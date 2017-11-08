import {inspect} from "util"
import deepFreeze from "deep-freeze"
import {Observable as O} from "../rxjs"
import {mergeObj, mergeObjTracking, chan as Chan} from "rx-utils"
import * as R from "../ramda"

// Different Helpers ===============================================================================

// Number -> Promise ()
export let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export let isBrowser = new Function("try { return this === window } catch(e) { return false }")

export let isNode = new Function("try { return this === global } catch(e) { return false }")

export let run = (...fns) => {
  return R.pipe(...fns)()
}

// TODO rx-utils candidate
export let init = (seed) =>
  O.of(R.fn("init", R.always(seed)))

// Store ===========================================================================================

let cmpFn = R.identical

let freezeFn = (v) => {
  return process.env.NODE_ENV != "production"
    ? (R.is(Object, v) ? deepFreeze(v) : v)
    : v
}

let assertFn = (v) => {
  if (process.env.NODE_ENV != "production") {
    let v2
    try {
      v2 = JSON.parse(JSON.stringify(v))
      if (R.equals(v, v2)) {
        return v
      }
    } catch (err) {
      // break
    }
    throw Error(`state must be JSON-serializable, got ${inspect(v)}`)
  }
  return v
}

let actionToFunction = ({fn, args}) => {
  if (args) {
    args = R.map(arg => {
      return arg.fn
        ? actionToFunction(arg)
        : arg
    }, args)
    return fn(...args)
  } else {
    return fn
  }
}

let actionToString = (action) => {
  if (action.fn) {
    if (action.args) {
      // action :: {fn :: Function, args :: Array a}
      let args = R.map(actionToString, action.args)
      return `${actionToString(action.fn)}(${R.join(", ", args)})`
    } else {
      // action :: {fn :: Function}
      return actionToString(action.fn)
    }
  } else if (R.is(Function, action)) {
    // action :: Function
    return action.name || "anonymous"
  } else {
    return inspect(action)
  }
}

export let makeStore = (options) => {
  function Store(action$) {
    options = R.merge(makeStore.options, options)

    let _val

    let get = () => _val // can't just access store._val because we don't use prototype(-like) chains

    let self = {options, get}

    self.$ = action$
      .scan((prevState, fn) => {
        let nextState
        if (R.is(Function, fn)) {
          nextState = fn(prevState)
        } else if (fn.fn) {
          nextState = actionToFunction(fn)(prevState)
        } else {
          throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
        }
        return options.freezeFn(options.assertFn(nextState))
      }, null)
      .distinctUntilChanged(options.cmpFn)
      .do(val => { _val = val })
      .publishReplay(1)
      .refCount()

    return self
  }

  return Store
}

makeStore.options = {
  cmpFn,
  freezeFn,
  assertFn,
}

// Logging mixin/middleware ========================================================================
let storeCount = 0

let logActionFn = (storeName, action) => {
  if (isBrowser()) {
    console.log(`%c@ ${storeName} λ ${actionToString(action)}`, `color: green`)
  } else {
    console.log(`@ ${storeName} λ ${actionToString(action)}`)
  }
}

let logStateFn = (storeName, state) => {
  if (isBrowser()) {
    console.log(`%c# ${storeName} = ${inspect(state)}`, `color: brown`)
  } else {
    console.log(`# ${storeName} = ${inspect(state)}`)
  }
}

export let withLog = R.curry((options, Store) => {
  function LoggingStore(action$) {
    options = R.merge(withLog.options, options)
    options.key = options.key || "store" + (++storeCount) // Anonymous stores will be "store1", "store2", etc.

    if (options.input) {
      action$ = action$.do(action => {
        options.logActionFn(options.key, action)
      })
    }

    let store = Store(action$)
    let self = R.merge(store, {
      log: {
        options,
      }
    })

    if (options.output) {
      self.$ = self.$.do(state => {
        options.logStateFn(options.key, state)
      }).publishReplay(1).refCount()
    }

    return self
  }

  return LoggingStore
})

withLog.options = {
  logActionFn,
  logStateFn,
  input: true,
  output: true,
  key: "",
}

// Control mixin/middleware ========================================================================

export let withControl = R.curry((options, Store) => {
  function ControlledStore(action$) {
    options = R.merge(withControl.options, options)

    let chan = Chan($ => O.merge(action$, $))

    let store = Store(chan)
    let self = R.merge(store, {
      control: {
        options,
      }
    })

    let helpers = {
      // over :: (a -> b) -> ()
      over: (fn) => {
        chan(fn)
      },

      // set :: a -> ()
      set: (val) => {
        chan({
          fn: R.always,
          args: [val]
        })
      },

      // setLensed :: (String, a) -> ()
      setLensed: (lens, val) => {
        chan({
          fn: R.over,
          args: [lens, {fn: R.set, args: [val]}]
        })
      },

      // merge :: a -> ()
      merge: (val) => {
        chan({
          fn: R.mergeFlipped,
          args: [val]
        })
      },

      // mergeLensed :: (String, a) -> ()
      mergeLensed: (lens, val) => {
        chan({
          fn: R.over,
          args: [lens, {fn: R.mergeFlipped, args: [val]}]
        })
      },

      // mergeDeep :: a -> ()
      mergeDeep: (val) => {
        chan({
          fn: R.mergeDeepFlipped,
          args: [val]
        })
      },

      // mergeDeepLensed :: a -> ()
      mergeDeepLensed: (lens, val) => {
        chan({
          fn: R.over, args: [lens, {fn: R.mergeDeepFlipped, args: [val]}]
        })
      }
    }

    return R.merge(self, helpers)
  }

  return ControlledStore
})

withControl.options = {}

// Persistent mixins/middlewares ===================================================================

// TODO timeout option?!
let _memCache = {}

export let withMemoryPersistence = R.curry((options, Store) => {
  function MemoryPersistentStore(action$) {
    options = R.merge(withMemoryPersistence.options, options)

    if (options.key && options.key in _memCache) {
      let initFn = R.fn("initFromMemory", R.always(_memCache[options.key]))
      action$ = action$
        .skip(1)
        .startWith(initFn)
    }

    let self = Store(action$)

    if (options.key) {
      self.$ = self.$.do(s => {
        _memCache[options.key] = s
      })
    }

    return self
  }

  return MemoryPersistentStore
})

withMemoryPersistence.options = {
  key: "",
}

export let withLocalStoragePersistence = R.curry((options, Store) => {
  if (!isBrowser()) {
    throw Error("withLocalStoragePersistence can be used only in Browser")
  }

  function LocalStoragePersistentStore(action$) {
    options = R.merge(withLocalStoragePersistence.options, options)

    if (options.key && localStorage.getItem(options.key) !== null) {
      let initFn
      try {
        initFn = R.fn("initFromLocalStorage", R.always(JSON.parse(localStorage.getItem(options.key))))
      } catch (err) {
        console.warn("error at read from localStorage")
        initFn = R.fn("initWithNull", R.always(null))
      }
      action$ = action$
        .skip(1)
        .startWith(initFn)
    }

    let self = Store(action$)

    if (options.key) {
      self.$ = self.$.merge(
        self.$
          .throttleTime(1000, undefined, {leading: true, trailing: true})
          .do(state => {
            try {
              localStorage.setItem(options.key, JSON.stringify(state))
            } catch (err) {
              console.warn("error at write to localStorage")
            }
          })
          .filter(R.F)
        )
        .publishReplay(1)
        .refCount()
    }

    return self
  }

  return LocalStoragePersistentStore
})

withLocalStoragePersistence.options = {
  key: "",
}

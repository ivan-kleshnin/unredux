import {inspect} from "util"
import deepFreeze from "deep-freeze"
import {mergeObj, mergeObjTracking, chan} from "rx-utils"
import * as R from "../ramda"
import {Observable as O, Subject} from "../rxjs"

// Async Helpers ===================================================================================

// Number -> Promise ()
export let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

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

let commandToFunction = ({fn, args}) => {
  if (args) {
    args = R.map(arg => {
      return arg.fn
        ? commandToFunction(arg)
        : arg
    }, args)
    return fn(...args)
  } else {
    return fn
  }
}

let commandToString = (command) => {
  if (command.fn) {
    if (command.args) {
      // command :: {fn :: Function, args :: Array a}
      let args = R.map(arg => {
        return arg.fn
          ? ["+", commandToString(arg)]
          : ["-", arg]
      }, command.args)
      return `${command.fn.name}(${R.join(", ", R.map(arg => arg[0] == "+" ? arg[1] : inspect(arg[1]), args))})` // , __state__)
    } else {
      // command :: {fn :: Function}
      return command.fn.name // + "(__state__)"
    }
  } else {
    // command :: Function
    return command.name
  }
}

let storeCount = 0

export let makeStore = (options) => {
  function Store(actions) {
    options = R.merge(makeStore.options, options)
    options.name = options.name || "store" + (++storeCount) // Anonymous stores will be "store1", "store2", etc.
    actions = R.merge(Store.actions, actions)

    let _val // cross-stream "global" value

    let get = () => _val // can't just access store._val because we don't use prototype(-like) chains

    let self = {options, get}

    self.$ = mergeObj(actions)
      .startWith(options.seed)
      .scan((prevState, fn) => {
        let nextState
        if (R.is(Function, fn)) {
          nextState = fn(prevState)
        } else if (fn.fn) {
          nextState = commandToFunction(fn)(prevState)
        } else {
          throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
        }
        return options.freezeFn(options.assertFn(nextState))
      })
      .distinctUntilChanged(options.cmpFn)
      .do(val => { _val = val })
      .shareReplay(1)

    // self.$ = options.seed === undefined ? $.skip(1) : $

    // TODO implement self.$.next? (will shortcut logging and other stuff) = BAD

    return self
  }

  Store.actions = {
    map: O.of(), // :: Observable (a -> b)
  }

  returnStore
}

makeStore.options = {
  cmpFn,
  freezeFn,
  assertFn,
  name: "",
  seed: null,
}

// Logging mixin ===================================================================================
let logFn = (storeName, action, command) => {
  if (process.env.NODE_ENV != "production") {
    console.log(`@ ${storeName}.${action}: ${commandToString(command)}`)
  }
}

let logState = (storeName, state) => {
  if (process.env.NODE_ENV != "production") {
    console.log(`# ${storeName} =`, state)
  }
}

export let withLog = R.curry((options, Store) => {
  function LoggingStore(actions) {
    options = R.merge(withLog.options, options)
    actions = R.merge(LoggingStore.actions, actions)

    let _loggingInput = false
    let _loggingOutput = false

    let store = Store(actions)
    let self = R.merge(store, {
      log: {
        options,
      }
    })

    self.log.$ = mergeObjTracking(actions)
      .map(({key, data}) => ({action: key, data}))

    self.log.input = () => {
      if (!_loggingInput) {
        _loggingInput = true
        self.log.$.subscribe((packet) => {
          logFn(store.options.name, packet.action, packet.data)
        })
      }
    }

    self.log.output = () => {
      if (!_loggingOutput) {
        _loggingOutput = true
        self.$.subscribe(state => {
          logState(store.options.name, state)
        })
      }
    }

    self.log.all = () => {
      self.log.input()
      self.log.output()
    }

    return self
  }

  LoggingStore.actions = Store.actions

  return LoggingStore
})

withLog.options = {}

// Lensed mixin ====================================================================================
// export let withLens = R.curry((options, Store) => {
//   function LensedStore(actions) {
//     options = R.merge(withLens.options, options)
//     actions = R.merge(LensedStore.actions, actions)
//
//     // Recreate an original toolkit on base of `over`
//     actions.over = O.merge(
//       actions.over.map(fn => R.over(options.lens, fn)),
//       actions.set.map(val => R.over(options.lens, R.always(val))),
//       actions.merge.map(val => R.over(options.lens, R.mergeFlipped(val))),
//       actions.mergeDeep.map(val => R.over(options.lens, R.mergeDeepFlipped(val))),
//     )
//     actions.set = O.of()       // Don't have access to full state
//     actions.merge = O.of()     // so this three are disabled
//     actions.mergeDeep = O.of() // and recreated "from scratch"
//
//     let store = Store(actions)
//     let self = R.merge(store, {
//       lens: {
//         options,
//       }
//     })
//
//     self.doSomething = () => {
//       console.log("doSomething")
//     }
//
//     return self
//   }
//
//   // Disable this two as superfluous
//   LensedStore.actions = R.omit(["lensedOver", "lensedSet"], Store.actions)
//
//   return LensedStore
// })

// withLens.options = {
//   lens: ""
// }

// Control =========================================================================================
export let control = (Store) => {
  let inputs = R.keys(Store.actions)

  let actions = R.reduce((z, k) => {
    z[k] = new S()
    return z
  }, {}, inputs)

  let store = Store(actions)

  let outputs = R.reduce((z, k) => {
    z[k] = (...args) => {
      actions[k].next(args.length > 1 ? args : args[0])
      console.log(store)
      return store.get()
    }
    return z
  }, {}, inputs)

  return R.merge(store, outputs)
}

// let moleculeCount = 0

//
// set: O.merge(self.set, actions.set)
//   .map(val => R.always(val)),
//
// merge: O.merge(self.merge, actions.merge)
//   .map(val => R.mergeFlipped(val)),
//
// mergeDeep: O.merge(self, mergeDeep, actions.mergeDeep)
//   .map(val => R.mergeDeepFlipped(val)),
//
// lensedOver: O.merge(self.lensedOver, actions.lensedOver)
//   .map(([lens, fn]) => R.over(lens, fn)),
//
// lensedSet: O.merge(self.lensedSet, actions.lensedSet)
//   .map(([lens, val]) => R.over(lens, R.always(val))),

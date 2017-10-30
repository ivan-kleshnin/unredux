import {inspect} from "util"
import deepFreeze from "deep-freeze"
import * as R from "../ramda"
import {O, RS, S} from "../rxjs"

// Async Helpers ===================================================================================

// Number -> Promise ()
export let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

// Rx-Utils ========================================================================================

let sndComplement = R.complement(R.snd)

// Filter observable by another observable, pass values on gate = 1
// passIfHigh :: Observable Boolean -> Observable a -> Observable a
export let passIfHigh = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(R.snd).map(R.fst)
}

// Filter observable by another observable, pass values on gate = 0
// passIfLow :: Observable Boolean -> Observable a -> Observable a
export let passIfLow = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(sndComplement).map(R.fst)
}

// Filter observable by another observable, pass values on gate = 1, including 1 to 0 switch
// passIfUp :: Observable Boolean -> Observable a -> Observable a
export let passIfUp = (obs) => (self) => {
  return self.combineLatest(obs).filter(R.snd).map(R.fst)
}

// Filter observable by another observable, pass values on gate = 0, including 1 to 0 switch
// passIfDown :: Observable Boolean -> Observable a -> Observable a
export let passIfDown = (obs) => (self) => {
  return self.combineLatest(obs).filter(sndComplement).map(R.fst)
}

// mergeObj :: Object (Observable *) -> Observable *
export let mergeObj = (obj) => {
  obj = R.flattenObj(obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
// combineLatestObj :: Object (Observable *) -> Observable *
export let combineLatestObj = (obj) => {
  let keys = R.keys(obj)     // stream names
  let values = R.values(obj) // streams
  return O.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

// mergeObjTracking :: Object (Observable *) -> Observable {key :: String, value :: *}
export let mergeObjTracking = (obj) => {
  obj = R.mapObjIndexed((value, key) => {
    return value.map(data => ({key, data}))
  }, obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// Atom ============================================================================================

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

let atomCount = 0

export let makeAtom = (options) => {
  function Atom(actions) {
    options = R.merge(makeAtom.defaultOptions, options)
    options.name = options.name || "atom" + (++atomCount) // Anonymous atoms will be "atom1", "atom2", etc.
    actions = R.merge(Atom.defaultActions, actions)

    let self = {_options: options, _val: undefined}

    let mappers = {
      over: actions.over,
      set: actions.set.map(val => R.always(val)),
      merge: actions.merge.map(val => R.mergeFlipped(val)),
      mergeDeep: actions.mergeDeep.map(val => R.mergeDeepFlipped(val)),
      lensedOver: actions.lensedOver.map(([lens, fn]) => R.over(lens, fn)),
      lensedSet: actions.lensedSet.map(([lens, val]) => R.over(lens, R.always(val))),
    }

    self.$ = mergeObj(mappers)
     .scan((prevState, fn) => {
        if (R.is(Function, fn)) {
          let nextState = fn.call("$", prevState)
          return options.freezeFn(options.assertFn(nextState))
        } else {
          throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
        }
     }, null)
     .distinctUntilChanged(options.cmpFn)
     .do(val => { self._val = val })
     .shareReplay(1)

    return self
  }

  Atom.defaultActions = {
    over: O.of(),       // :: Observable (a -> b)
    set: O.of(),        // :: Observable a
    merge: O.of(),      // :: Observable a
    mergeDeep: O.of(),  // :: Observable a
    lensedOver: O.of(), // :: Observable (Lens, (a -> b)) // TODO possibly try to remove with overloaded API again...
    lensedSet: O.of(),  // :: Observable (Lens, a)
  }

  return Atom
}

makeAtom.defaultOptions = {
  cmpFn,
  freezeFn,
  assertFn,
  name: "anonymous",
}

export let control = R.curry((Atom, inputs) => {
  let actions = R.reduce((z, k) => {
    z[k] = new S()
    return z
  }, {}, inputs)

  let outputs = R.reduce((z, k) => {
    z[k] = (...args) => actions[k].next(args.length > 1 ? args : args[0])
    return z
  }, {}, inputs)

  return R.merge(Atom(actions), outputs)
})

// Logging =========================================================================================
let logFn = (fnName, args=[]) => {
  if (process.env.NODE_ENV != "production") {
    console.log(`@ ${fnName}(${args.map(inspect).join(", ")})`)
  }
}

let logState = (atomName, state) => {
  if (process.env.NODE_ENV != "production") {
    console.log(`# ${atomName} =`, state)
  }
}

export let withLog = R.curry((options, Atom) => {
  function LoggingAtom(actions) {
    options = R.merge(withLog.options, options)
    actions = R.merge(withLog.actions, actions)

    let atom = Atom(actions)
    let self = R.merge(atom, {_options: options})

    self.log = {
      _options: options,
      _loggingInput: false,
      _loggingOutput: false,
    }

    self.log.$ = mergeObjTracking(actions)
      .map(({key, data}) => ({op: key, args: [data]}))

    self.log.input = () => {
      if (!self.log._loggingInput) {
        self.log._loggingInput = true
        self.log.$.subscribe(({op, args}) => {
          logFn(atom._options.name + "." + op, args)
        })
      }
      return self
    }

    self.log.output = () => {
      if (!self.log._loggingOutput) {
        self.log._loggingOutput = true
        self.$.subscribe(state => {
          logState(atom._options.name, state)
        })
      }
      return self
    }

    self.log.all = () => {
      self.log.input()
      self.log.output()
      return self
    }

    return self
  }

  LoggingAtom.defaultActions = {}

  return LoggingAtom
})

withLog.options = {}

export let withSomething = R.curry((options, Atom) => {
  function SomeAtom(actions) {
    let atom = Atom(actions)
    let self = R.merge(atom, {_options: options})

    self.doSomething = () => {
      console.log("doSomething")
      return self
    }

    return self
  }

  SomeAtom.defaultActions = {}

  return SomeAtom
})

withSomething.defaultOptions = {}

// Lensed Atom =====================================================================================

// export let LensedAtom = (atom, lens, options={}) => {
//   options = R.merge({cmpFn}, options)
//   options.name = atom._options.name + "." + (options.name || toArray(lens).join("."))
//
//   let self = {_options: options, _val: undefined}
//
//   let actions = {
//     over: over,
//     set: set.map(val => R.always(val)),
//     merge: merge.map(val => R.mergeFlipped(val)),
//     mergeDeep: mergeDeep.map(val => R.mergeDeepFlipped(val)),
//     lensedOver: lensedOver.map(([lens, fn]) => R.over(lens, fn)),
//     lensedSet: lensedSet.map(([lens, val]) => R.over(lens, R.always(val))),
//   }
//
//   self.$ = atom.$
//     .map(R.view(lens))
//     .let(passIfDown(lock))
//     // .filter(x => x != Atom.mute)
//     .distinctUntilChanged(options.cmpFn)
//     .do(val => { self._val = val })
//     .shareReplay(1)
//
//   self.over = (fn) => {
//     self.log$.next({op: "over", args: [fn]})
//     atom.lensedOver(lens, fn)
//     return self._val
//   }
//
//   self.set = (val) => {
//     self.log$.next({op: "set", args: [val]})
//     atom.lensedSet(lens, val)
//     return self._val
//   }
//
//   self.merge = (val) => {
//     self.log$.next({op: "merge", args: [val]})
//     atom.lensedMerge(lens)
//     return self._val
//   }
//
//   self.mergeDeep = (val) => {
//     self.log$.next({op: "mergeDeep", args: [val]})
//     atom.lensedMergeDeep(lens)
//     return self._val
//   }
//
//   return self
// }

// let moleculeCount = 0

// chan :: (Observable a -> Observable b) -> Observable (State -> State)
// chan :: a -> Promise State
export let chan = (letFn) => {
  let subj = new S()
  function channel(...callArgs) {
    if (callArgs.length <= 1) {
      subj.next(callArgs[0]) // no return value
    }
    else {
      subj.next(callArgs) // no return value
    }
  }
  let obs = letFn(subj)
  Object.setPrototypeOf(channel, obs)      // support basic calls
  channel.apply = Function.prototype.apply // support spreads
  return channel
}

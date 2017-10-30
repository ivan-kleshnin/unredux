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
    if (!this) { return new Atom(actions) }

    options = R.merge(makeAtom.defaultOptions, options)
    options.name = options.name || "atom" + (++atomCount) // Anonymous atoms will be "atom1", "atom2", etc.
    actions = R.merge(Atom.defaultActions, actions)

    this._options = options
    this._val = undefined

    let mappers = {
      over: actions.over,
      set: actions.set.map(val => R.always(val)),
      merge: actions.merge.map(val => R.mergeFlipped(val)),
      mergeDeep: actions.mergeDeep.map(val => R.mergeDeepFlipped(val)),
      lensedOver: actions.lensedOver.map(([lens, fn]) => R.over(lens, fn)),
      lensedSet: actions.lensedSet.map(([lens, val]) => R.over(lens, R.always(val))),
    }

    this.$ = mergeObj(mappers)
     .scan((prevState, fn) => {
        if (R.is(Function, fn)) {
          let nextState = fn.call("$", prevState)
          return options.freezeFn(options.assertFn(nextState))
        } else {
          throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
        }
     }, null)
     .distinctUntilChanged(options.cmpFn)
     .do(val => { this._val = val })
     .shareReplay(1)

    return this
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
    if (!this) { return new LoggingAtom(actions) }

    options = R.merge(withLog.options, options)
    actions = R.merge(withLog.actions, actions)

    Atom.call(this || {}, actions)

    this.log = {
      _options: options,
      _loggingInput: false,
      _loggingOutput: false,
    }

    this.log.$ = mergeObjTracking(actions)
      .map(({key, data}) => ({op: key, args: [data]}))

    this.log.input = () => {
      if (!this.log._loggingInput) {
        this.log._loggingInput = true
        this.log.$.subscribe(({op, args}) => {
          logFn(this._options.name + "." + op, args)
        })
      }
      return this
    }

    this.log.output = () => {
      if (!this.log._loggingOutput) {
        this.log._loggingOutput = true
        this.$.subscribe(state => {
          logState(this._options.name, state)
        })
      }
      return this
    }

    this.log.all = () => {
      this.log.input()
      this.log.output()
      return this
    }

    return this
  }

  LoggingAtom.defaultActions = {}

  return LoggingAtom
})

withLog.options = {}

export let withSomething = R.curry((options, Atom) => {
  function SomeAtom(actions) {
    if (!this) { return new SomeAtom(actions) }

    Atom.call(this || {}, actions)

    this.doSomething = () => {
      console.log("doSomething")
      return this
    }

    return this
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

// export let Molecule = (atoms, mapFn, options={}) => {
//   options = R.merge({cmpFn, name: "molecule" + (++moleculeCount)}, options)
//
//   let _val
//   let $ = combineLatestObj(R.pluck("$", atoms))
//     .map(mapFn)
//     // .debounceTime(1) // mute possible diamond cases
//     .let(passIfDown(lock))
//     // .filter(x => x != Atom.mute)
//     .distinctUntilChanged(options.cmpFn)
//     .do(val => { _val = val })
//     .shareReplay(1)
//
//   let self = mixLogging({_options: options, atoms, $})
//
//   return self
// }

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

// let lockSubj = new RS(1)
// let lock = lockSubj
//   .startWith(0)
//   .scan((z, fn) => fn(z))
//   .distinctUntilChanged(R.identical)
//   .shareReplay(1)
//
// export let holding = (fn) => {
//   lockSubj.next(c => c + 1)
//   try {
//     return fn()
//   } finally {
//     lockSubj.next(c => c - 1)
//   }
// }


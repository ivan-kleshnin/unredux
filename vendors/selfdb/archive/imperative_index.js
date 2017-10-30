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
let moleculeCount = 0

export let Atom = (seed, options={}) => {
  options = R.merge({cmpFn, freezeFn, assertFn, name: "atom" + (++atomCount)}, options)

  let self = mixLogging({_options: options})
  let subj = new S()
  self.$ = subj
   .startWith(options.freezeFn(options.assertFn(seed)))
   .scan((prevState, fn) => {
      if (R.is(Function, fn)) {
        let nextState = fn.call("$", prevState)
        return options.freezeFn(options.assertFn(nextState))
      } else {
        throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
      }
   })
   .let(passIfDown(lock))
   // .filter(x => x != Atom.mute)
   .distinctUntilChanged(options.cmpFn)
   .do(val => { self._val = val })
   .shareReplay(1)

  // over :: (a -> b) -> a|b
  self.over = (fn) => {
    self.log$.next({op: "over", args: [fn]})
    subj.next(fn)
    return self._val
  }

  // set :: a -> b
  self.set = (val) => {
    self.log$.next({op: "set", args: [val]})
    subj.next(R.always(val))
    return self._val
  }

  // merge :: a -> b
  self.merge = (val) => {
    self.log$.next({op: "merge", args: [val]})
    subj.next(R.mergeFlipped(val))
    return self._val
  }

  // mergeDeep :: a -> b
  self.mergeDeep = (val) => {
    self.log$.next({op: "mergeDeep", args: [val]})
    subj.next(R.mergeDeepFlipped(val))
    return self._val
  }

  // lensedOver :: Lens -> (a -> b) -> a|b
  self.lensedOver = R.curry((lens, fn) => {
    self.log$.next({op: "lensedOver", args: [lens, fn]})
    subj.next(R.over(lens, fn))
    return self._val
  })

  // lensedSet :: Lens -> a -> b
  self.lensedSet = R.curry((lens, val) => {
    self.log$.next({op: "lensedSet", args: [lens, val]})
    subj.next(R.over(lens, R.always(val)))
    return self._val
  })

  // lensedMerge :: Lens -> a -> b
  self.lensedMerge = R.curry((lens, val) => {
    self.log$.next({op: "lensedMerge", args: [lens, val]})
    subj.next(R.over(lens, R.mergeFlipped(val)))
    return self._val
  })

  // lensedMergeDeep :: Lens -> a -> b
  self.lensedMergeDeep = R.curry((lens, val) => {
    self.log$.next({op: "lensedMergeDeep", args: [lens, val]})
    subj.next(R.over(lens, R.mergeDeepFlipped(val)))
    return self._val
  })

  return self
}

// Atom.mute = Symbol("mute")

let toArray = (v) => {
  return R.is(Array, v) ? v : [v]
}

export let LensedAtom = (atom, lens, options={}) => {
  options = R.merge({cmpFn}, options)
  options.name = atom._options.name + "." + (options.name || toArray(lens).join("."))

  let self = mixLogging({_options: options})
  self.$ = atom.$
    .map(R.view(lens))
    .let(passIfDown(lock))
    // .filter(x => x != Atom.mute)
    .distinctUntilChanged(options.cmpFn)
    .do(val => { self._val = val })
    .shareReplay(1)

  self.over = (fn) => {
    self.log$.next({op: "over", args: [fn]})
    atom.lensedOver(lens, fn)
    return self._val
  }

  self.set = (val) => {
    self.log$.next({op: "set", args: [val]})
    atom.lensedSet(lens, val)
    return self._val
  }

  self.merge = (val) => {
    self.log$.next({op: "merge", args: [val]})
    atom.lensedMerge(lens)
    return self._val
  }

  self.mergeDeep = (val) => {
    self.log$.next({op: "mergeDeep", args: [val]})
    atom.lensedMergeDeep(lens)
    return self._val
  }

  return self
}

export let Molecule = (atoms, mapFn, options={}) => {
  options = R.merge({cmpFn, name: "molecule" + (++moleculeCount)}, options)

  let _val
  let $ = combineLatestObj(R.pluck("$", atoms))
    .map(mapFn)
    // .debounceTime(1) // mute possible diamond cases
    .let(passIfDown(lock))
    // .filter(x => x != Atom.mute)
    .distinctUntilChanged(options.cmpFn)
    .do(val => { _val = val })
    .shareReplay(1)

  let self = mixLogging({_options: options, atoms, $})

  return self
}

// Experimental ====================================================================================

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

let lockSubj = new RS(1)
let lock = lockSubj
  .startWith(0)
  .scan((z, fn) => fn(z))
  .distinctUntilChanged(R.identical)
  .shareReplay(1)

export let holding = (fn) => {
  lockSubj.next(c => c + 1)
  try {
    return fn()
  } finally {
    lockSubj.next(c => c - 1)
  }
}

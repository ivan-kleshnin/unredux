import * as R from "ramda"
import {O, RS, S} from "rxjs"

// Promises ========================================================================================

// (a, Number?) -> Promise a
export let getAsync = (val, delay=500) => {
  return new Promise((resolve, reject) => setTimeout(() => resolve(val), delay))
}

// Number -> Promise ()
export let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

// Observables =====================================================================================

// Filter observable by another observable, truthy = keep
// filterBy :: Observable Boolean -> Observable a -> Observable a
export let filterBy = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(snd).map(fst)
}

// Filter observable by another observable, truthy = drop
// rejectBy :: Observable Boolean -> Observable a -> Observable a
export let rejectBy = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(R.complement(snd)).map(fst)
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
  obj = R.flattenObj(obj)
  let keys = R.keys(obj)     // stream names
  let values = R.values(obj) // streams
  return O.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

// Custom ==========================================================================================

// chan :: Observable a
// chan :: a -> ()
export let chan = (letFn) => {
  let subj = new S()
  let obs = letFn(subj)
  function channel(...callArgs) {
    return subj.next(callArgs[0]) // callArgs[1..n] are reserved
  }
  Object.setPrototypeOf(channel, obs)
  return channel
}

// Can be used for state loops (no examples so far)
// stateChan :: Observable a
// stateChan :: a -> ()
export let stateChan = () => {
  let subj = new RS(1)
  function channel(...callArgs) {
    return subj.next(callArgs[0]) // callArgs[1..n] are reserved
  }
  Object.setPrototypeOf(channel, subj)
  return channel
}

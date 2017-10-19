import * as R from "ramda"
import {O, S} from "rxjs"

// Observables =====================================================================================

// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
// combineLatestObj :: Object (Observable *) -> Observable *
export let combineLatestObj = (obj) => {
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

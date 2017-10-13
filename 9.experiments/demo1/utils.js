import {flattenObj} from "./helpers"

// Filter observable by another observable, truthy = keep
// :: Observable Boolean -> Observable a -> Observable a
export let filterBy = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(snd).map(fst)
}

// Filter observable by another observable, truthy = drop
// :: Observable Boolean -> Observable a -> Observable a
export let rejectBy = (obs) => (self) => {
  return self.withLatestFrom(obs).filter(R.complement(snd)).map(fst)
}

// :: Object (Observable *) -> Observable *
export let mergeObj = (obj) => {
  obj = flattenObj(obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
// :: Object (Observable *) -> Observable *
export let combineLatestObj = (obj) => {
  obj = flattenObj(obj)
  let keys = R.keys(obj)     // stream names
  let values = R.values(obj) // streams
  return O.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

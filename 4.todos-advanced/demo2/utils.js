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
  let values = Object.values(obj) // streams
  return Observable.merge(...values)
}

// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
// :: Object (Observable *) -> Observable *
export let combineLatestObj = (obj) => {
  obj = flattenObj(obj)
  let keys = Object.keys(obj)     // stream names
  let values = Object.values(obj) // streams
  return Observable.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

// let s1 = Observable.of(1)
// let s2 = Observable.of(2)
// let s3 = Observable.of(3)
//
// let sc = combineLatestObj({s1, s2, s3})
//
// sc.subscribe((data) => {
//   console.log(data)
// })

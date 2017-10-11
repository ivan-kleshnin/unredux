// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
// :: Object (Observable *) -> Observable *
export let combineLatestObj = (obj) => {
  let keys = Object.keys(obj)     // stream names
  let values = Object.values(obj) // streams
  return Observable.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

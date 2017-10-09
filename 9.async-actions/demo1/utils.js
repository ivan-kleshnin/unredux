export let mergeObj = (obj) => {
  obj = flattenObj(obj)
  let values = Object.values(obj) // streams
  return Observable.merge(...values)
}

// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js
export let combineLatestObj = (obj) => {
  obj = flattenObj(obj)
  let keys = Object.keys(obj)     // stream names
  let values = Object.values(obj) // streams
  return Observable.combineLatest(values, (...args) => {
    return R.zipObj(keys, args)
  })
}

let isPlainObj = (o) => Object.prototype.toString.call(o) == "[object Object]"

let flattenObj = (obj, keys=[]) => {
  return Object.keys(obj).reduce((acc, key) => {
    return Object.assign(acc, isPlainObj(obj[key])
      ? flattenObj(obj[key], keys.concat(key))
      : {[keys.concat(key).join(".")]: obj[key]}
    )
  }, {})
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

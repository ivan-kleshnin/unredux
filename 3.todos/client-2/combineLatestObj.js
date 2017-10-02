// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js

let R = require("ramda")
let {Observable} = require("rxjs")

function combineLatestObj(obj) {
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

module.exports = combineLatestObj

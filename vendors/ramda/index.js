import assoc from "ramda/src/assoc"
import addIndex from "ramda/src/addIndex"
import append from "ramda/src/append"
import ascend from "ramda/src/ascend"
import complement from "ramda/src/complement"
import comparator from "ramda/src/comparator"
import compose from "ramda/src/compose"
import curry from "ramda/src/curry"
import descend from "ramda/src/descend"
import dissoc from "ramda/src/dissoc"
import equals from "ramda/src/equals"
import filter from "ramda/src/filter"
import find from "ramda/src/find"
import findIndex from "ramda/src/findIndex"
import flip from "ramda/src/flip"
import is from "ramda/src/is"
import isEmpty from "ramda/src/isEmpty"
import lens from "ramda/src/lens"
import lensIndex from "ramda/src/lensIndex"
import lensProp from "ramda/src/lensProp"
import map from "ramda/src/map"
import mapObjIndexed from "ramda/src/mapObjIndexed"
import merge from "ramda/src/merge"
import mergeDeepRight from "ramda/src/mergeDeepRight"
import omit from "ramda/src/omit"
import _over from "ramda/src/over"
import pick from "ramda/src/pick"
import pipe from "ramda/src/pipe"
import pluck from "ramda/src/pluck"
import prepend from "ramda/src/prepend"
import prop from "ramda/src/prop"
import reduce from "ramda/src/reduce"
import repeat from "ramda/src/repeat"
import _set from "ramda/src/set"
import slice from "ramda/src/slice"
import sort from "ramda/src/sort"
import take from "ramda/src/take"
import takeLast from "ramda/src/takeLast"
import _view from "ramda/src/view"
import zip from "ramda/src/zip"
import zipObj from "ramda/src/zipObj"

let add = curry((x, y) => x + y)
let always = curry((x, y) => x)
let dec = (x) => x - 1
let divide = curry((x, y) => x / y)
let filter2 = addIndex(filter)
let fst = (xs) => xs[0]
let id = x => x
let inc = (x) => x + 1
let isPlainObj = (o) => Boolean(o && o.constructor && o.constructor.prototype && o.constructor.prototype.hasOwnProperty("isPrototypeOf"))
let flattenObj = (obj, keys=[]) => {
  return Object.keys(obj).reduce((acc, key) => {
    return merge(acc, isPlainObj(obj[key])
      ? flattenObj(obj[key], keys.concat(key))
      : {[keys.concat(key).join(".")]: obj[key]}
    )
  }, {})
}
let F = () => false
let head = (xs) => xs[0]
let keys = Object.keys
let lensify = (lens) => {
  if (is(Array, lens)) {
    return reduce(
      (z, s) => compose(z, is(Number, s) ? lensIndex(s) : lensProp(s)),
      id,
      lens
    )
  } else if (is(Function, lens)) {
    return lens
  } else {
    throw Error(`invalid lens ${lens}`)
  }
}
let multiply = curry((x, y) => x * y)
let over = curry((lens, fn, obj) => _over(lensify(lens), fn, obj))
let map2 = addIndex(map)
let mergeFlipped = flip(merge)
let mergeDeep = mergeDeepRight
let mergeDeepFlipped = flip(mergeDeep)
let reduce2 = addIndex(reduce)
let set = curry((lens, val, obj) => _set(lensify(lens), val, obj))
let snd = (xs) => xs[1]
let subtract = curry((x, y) => x + y)
let tail = (xs) => xs.slice(1)
let T = () => true
let values = Object.values
let view = curry((lens, obj) => _view(lensify(lens), obj))

export {
  add, addIndex, always, append, ascend, assoc,
  comparator, complement, compose, curry,
  dec, descend, dissoc, divide,
  equals,
  filter, filter2, find, findIndex, flattenObj, flip, fst, F,
  head,
  id, inc, is, isEmpty, isPlainObj,
  keys,
  lens, lensIndex, lensProp,
  map, map2, mapObjIndexed, merge, mergeFlipped, mergeDeep, mergeDeepFlipped, multiply,
  omit, over,
  pick, pipe, pluck, prepend, prop,
  repeat, reduce, reduce2,
  set, slice, snd, sort, subtract,
  tail, take, takeLast, T,
  values, view,
  zip, zipObj,
}

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
import dropLast from "ramda/src/dropLast"
import equals from "ramda/src/equals"
import filter from "ramda/src/filter"
import find from "ramda/src/find"
import findIndex from "ramda/src/findIndex"
import flip from "ramda/src/flip"
import identical from "ramda/src/identical"
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

export let add = curry((x, y) => x + y)
export let always = curry((x, y) => x)
export let dec = (x) => x - 1
export let divide = curry((x, y) => x / y)
export let filter2 = addIndex(filter)
export let fst = (xs) => xs[0]
export let id = x => x
export let inc = (x) => x + 1
export let isPlainObj = (o) => Boolean(o && o.constructor && o.constructor.prototype && o.constructor.prototype.hasOwnProperty("isPrototypeOf"))
export let flattenObj = (obj, keys=[]) => {
  return Object.keys(obj).reduce((acc, key) => {
    return merge(acc, isPlainObj(obj[key])
      ? flattenObj(obj[key], keys.concat(key))
      : {[keys.concat(key).join(".")]: obj[key]}
    )
  }, {})
}
export let F = () => false
export let head = (xs) => xs[0]
export let keys = Object.keys
export let lensify = (lens) => {
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
export let multiply = curry((x, y) => x * y)
export let over = curry((lens, fn, obj) => _over(lensify(lens), fn, obj))
export let map2 = addIndex(map)
export let mergeFlipped = flip(merge)
export let mergeDeep = mergeDeepRight
export let mergeDeepFlipped = flip(mergeDeep)
export let reduce2 = addIndex(reduce)
export let set = curry((lens, val, obj) => _set(lensify(lens), val, obj))
export let snd = (xs) => xs[1]
export let subtract = curry((x, y) => x + y)
export let tail = (xs) => xs.slice(1)
export let T = () => true
export let values = Object.values
export let view = curry((lens, obj) => _view(lensify(lens), obj))

export {
  addIndex, append, ascend, assoc,
  comparator, complement, compose, curry,
  descend, dissoc, dropLast,
  equals,
  filter, find, findIndex, flip,
  identical, is, isEmpty,
  lens, lensIndex, lensProp,
  map, mapObjIndexed, merge,
  omit,
  pick, pipe, pluck, prepend, prop,
  repeat, reduce,
  slice, sort,
  take, takeLast,
  zip, zipObj,
}

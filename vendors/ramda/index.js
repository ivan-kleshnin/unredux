import addIndex from "ramda/src/addIndex"
import append from "ramda/src/append"
import ascend from "ramda/src/ascend"
import chain from "ramda/src/chain"
import comparator from "ramda/src/comparator"
import compose from "ramda/src/compose"
import concat from "ramda/src/concat"
import contains from "ramda/src/contains"
import descend from "ramda/src/descend"
import difference from "ramda/src/difference"
import dissocPath from "ramda/src/dissocPath"
import dropLast from "ramda/src/dropLast"
import equals from "ramda/src/equals"
import filter from "ramda/src/filter"
import find from "ramda/src/find"
import findIndex from "ramda/src/findIndex"
import findLast from "ramda/src/findLast"
import forEach from "ramda/src/forEach"
import fromPairs from "ramda/src/fromPairs"
import identical from "ramda/src/identical"
import is from "ramda/src/is"
import isEmpty from "ramda/src/isEmpty"
import lens from "ramda/src/lens"
import lensIndex from "ramda/src/lensIndex"
import lensProp from "ramda/src/lensProp"
import map from "ramda/src/map"
import mergeDeepRight from "ramda/src/mergeDeepRight"
import nth from "ramda/src/nth"
import omit from "ramda/src/omit"
import _over from "ramda/src/over"
import pick from "ramda/src/pick"
import pipe from "ramda/src/pipe"
import pluck from "ramda/src/pluck"
import prepend from "ramda/src/prepend"
import prop from "ramda/src/prop"
import props from "ramda/src/props"
import propEq from "ramda/src/propEq"
import reduce from "ramda/src/reduce"
import range from "ramda/src/range"
import reject from "ramda/src/reject"
import repeat from "ramda/src/repeat"
import _set from "ramda/src/set"
import slice from "ramda/src/slice"
import sort from "ramda/src/sort"
import take from "ramda/src/take"
import toPairs from "ramda/src/toPairs"
import takeLast from "ramda/src/takeLast"
import unnest from "ramda/src/unnest"
import _view from "ramda/src/view"
import without from "ramda/src/without"
import zip from "ramda/src/zip"

// Convinience helpers
export function withName(name, fn) {
  return Object.defineProperty(fn, "name", {
    value: name,
  })
}
export let fn = withName

// Core Fn utils
export function curryN(N, fn) {
  let self = undefined
  let collectFn = Object.defineProperties(function (...args) {
    if (this) {
      self = this
    }
    if (args.length >= N) {
      return fn.apply(self, args)
    }
    else {
      return Object.defineProperties(function (...args2) {
        if (this) {
          self = this
        }
        return collectFn.apply(self, args.concat(args2))
      }, {
        name: {value: fn.name + "_" + args.length},
        length: {value: N - args.length},
      })
    }
  }, {
    name: {value: fn.name},
    length: {value: N}
  })
  return collectFn
}
export let curry = (fn) => curryN(fn.length, fn)
export let curryAs = (name, fn) => curry(withName(name, fn))

export let always = curryAs("always", (x, y) => x)
export let id = (x) => x
export let complement = (fn) => (...args) => !fn(...args)
export let flip = (fn) => {
  return curryN(fn.length, withName(fn.name + "_flipped", (...args) => {
    return fn(...[...args].reverse())
  }))
}
export let F = () => false
export let T = () => true

export let add = curryAs("add", (x, y) => x + y)
export let containsFlipped = flip(contains)
export let dec = (x) => x - 1
export let divide = curryAs("divide", (x, y) => x / y)
export let filter2 = addIndex(filter)
export let fst = (xs) => xs[0]
export let inc = (x) => x + 1
export let isNil = (x) => x == null
export let isPlainObj = (o) => Boolean(o && o.constructor && o.constructor.prototype && o.constructor.prototype.hasOwnProperty("isPrototypeOf"))
export let flattenObj = (obj, keys=[]) => {
  return Object.keys(obj).reduce((acc, key) => {
    return merge(acc, isPlainObj(obj[key])
      ? flattenObj(obj[key], keys.concat(key))
      : {[keys.concat(key).join(".")]: obj[key]}
    )
  }, {})
}
export let head = nth(0)
export let join = curryAs("join", (sep, xs) => xs.join(sep))
export let keys = Object.keys
export let length = (x) => x.length
export let lensify = (lens) => {
  if (is(Array, lens)) {
    return reduce(
      (z, s) => compose(z, is(Number, s) ? lensIndex(s) : lensProp(s)),
      id,
      lens
    )
  } else if (is(String, lens)) {
    return lensProp(lens)
  } else if (is(Number, lens)) {
    return lensIndex(lens)
  } else if (is(Function, lens)) {
    return lens
  } else {
    throw Error(`invalid lens ${lens}`)
  }
}
export let multiply = curryAs("multiply", (x, y) => x * y)
export let over = curryAs("over", (lens, fn, obj) => _over(lensify(lens), fn, obj))
export let passThrough = (...args) => args
export let mapObjIndexed = curryAs("mapObjIndexed", (fn, obj) => {
  return reduce((z, k) => {
    z[k] = fn(obj[k], k, obj)
    return z
  }, {}, keys(obj))
})
export let map2 = addIndex(map)
export let merge = curryAs("merge", (xs, ys) => Object.assign({}, xs, ys))
export let mergeFlipped = flip(merge)
export let mergeDeep = mergeDeepRight
export let mergeDeepFlipped = flip(mergeDeep)
export let not = (x) => !x
// TODO nth
export let reduce2 = addIndex(reduce)
export let set = curryAs("set", (lens, val, obj) => _set(lensify(lens), val, obj))
export let snd = (xs) => xs[1]
export let split = curryAs("split", (sep, xs) => xs.split(sep))
export let subtract = curryAs("subtract", (x, y) => x - y)
export let startsWith = curryAs("startsWith", (x, y) => y.startsWith(x))
export let tail = (xs) => xs.slice(1)
export let unset = curryAs("unset", (lens, obj) => is(Array, lens) ? dissocPath(lens, obj) : dissocPath([lens], obj)) // @_@
export let values = Object.values
export let view = curryAs("view", (lens, obj) => _view(lensify(lens), obj))
export let zipObj = curryAs("zipObj", (keys, values) => {
  return reduce((z, i) => {
    z[keys[i]] = values[i]
    return z
  }, {}, range(0, keys.length))
})

export {
  addIndex, append, ascend,
  chain, comparator, compose, concat, contains,
  descend, difference, dropLast,
  equals,
  filter, find, findIndex, findLast, forEach, fromPairs,
  identical, is, isEmpty,
  lens, lensIndex, lensProp,
  map,
  nth,
  omit,
  pick, pipe, pluck, prepend, prop, props, propEq,
  range, reject, repeat, reduce,
  slice, sort,
  take, takeLast, toPairs,
  unnest,
  without,
  zip,
}

// RAMDA ===========================================================================================
import append from "ramda/src/append"
import ascend from "ramda/src/ascend"
import complement from "ramda/src/complement"
import compose from "ramda/src/compose"
import curry from "ramda/src/curry"
import descend from "ramda/src/descend"
import equals from "ramda/src/equals"
import filter from "ramda/src/filter"
import find from "ramda/src/find"
import findIndex from "ramda/src/findIndex"
import flip from "ramda/src/flip"
import head from "ramda/src/head"
import isEmpty from "ramda/src/isEmpty"
import lens from "ramda/src/lens"
import lensIndex from "ramda/src/lensIndex"
import lensProp from "ramda/src/lensProp"
import map from "ramda/src/map"
import merge from "ramda/src/merge"
import over from "ramda/src/over"
import pipe from "ramda/src/pipe"
import pluck from "ramda/src/pluck"
import prepend from "ramda/src/prepend"
import prop from "ramda/src/prop"
import reduce from "ramda/src/reduce"
import repeat from "ramda/src/repeat"
import set from "ramda/src/set"
import slice from "ramda/src/slice"
import sort from "ramda/src/sort"
import tail from "ramda/src/tail"
import take from "ramda/src/take"
import takeLast from "ramda/src/takeLast"
import view from "ramda/src/view"
import zipObj from "ramda/src/zipObj"

let always = curry((x, y) => x)
let id = x => x
let keys = Object.keys
let values = Object.values

window.R = {
  always, append, ascend,
  complement, compose, curry,
  descend,
  equals,
  filter, find, findIndex, flip,
  head,
  id, isEmpty,
  keys,
  lens, lensIndex, lensProp,
  map, merge,
  over,
  pipe, pluck, prepend, prop,
  repeat, reduce,
  set, slice, sort,
  tail, take, takeLast,
  values, view,
  zipObj
}

// Helpers
let lensify = (lens) => {
  if (lens instanceof Array) {
    return reduce(
      (z, s) => compose(z, typeof s == "number" ? lensIndex(s) : lensProp(s)),
      id,
      lens
    )
  } else if (lens instanceof Function) {
    return lens
  } else {
    throw Error(`invalid lens ${lens}`)
  }
}

// Changing global namespace for brevity (bad for libs, ok for apps)
window.R.viewL = curry((lens, obj) => view(lensify(lens), obj))
window.R.setL = curry((lens, val, obj) => set(lensify(lens), val, obj))
window.R.overL = curry((lens, fn, obj) => over(lensify(lens), fn, obj))

// RXJS ============================================================================================
import {Observable} from "rxjs/Observable"
import {Subject} from "rxjs/Subject"
import {ReplaySubject} from "rxjs/ReplaySubject"

// Observable functions
import "rxjs/add/observable/combineLatest"
import "rxjs/add/observable/merge"
import "rxjs/add/observable/of"

// Observable methods
import "rxjs/add/operator/distinctUntilChanged"
import "rxjs/add/operator/do"
import "rxjs/add/operator/filter"
import "rxjs/add/operator/let"
import "rxjs/add/operator/map"
import "rxjs/add/operator/pluck"
import "rxjs/add/operator/sample"
import "rxjs/add/operator/scan"
import "rxjs/add/operator/shareReplay"
import "rxjs/add/operator/startWith"
import "rxjs/add/operator/throttleTime"
import "rxjs/add/operator/withLatestFrom"

window.Observable = window.O = Observable
window.Subject = Subject
window.ReplaySubject = ReplaySubject

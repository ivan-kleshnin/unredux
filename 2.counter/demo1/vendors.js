// RAMDA ===========================================================================================
// Until we implement tree shaking
import assoc from "ramda/src/assoc"
import compose from "ramda/src/compose"
import curry from "ramda/src/curry"
import equals from "ramda/src/equals"
import filter from "ramda/src/filter"
import map from "ramda/src/map"
import merge from "ramda/src/merge"
import pipe from "ramda/src/pipe"
import reduce from "ramda/src/reduce"

let id = x => x
let always = curry((x, y) => x)

window.R = {
  always, assoc,
  compose, curry,
  equals,
  filter,
  id,
  map, merge,
  pipe,
  reduce,
}

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
import "rxjs/add/operator/map"
import "rxjs/add/operator/sample"
import "rxjs/add/operator/scan"
import "rxjs/add/operator/shareReplay"
import "rxjs/add/operator/startWith"

window.Observable = Observable
window.Subject = Subject
window.ReplaySubject = ReplaySubject

// RAMDA ===========================================================================================
import assoc from "ramda/src/assoc"
import assocPath from "ramda/src/assocPath"
import compose from "ramda/src/compose"
import curry from "ramda/src/curry"
import equals from "ramda/src/equals"
import identity from "ramda/src/identity"
import filter from "ramda/src/filter"
import lens from "ramda/src/lens"
import lensIndex from "ramda/src/lensIndex"
import lensProp from "ramda/src/lensProp"
import merge from "ramda/src/merge"
import over from "ramda/src/over"
import set from "ramda/src/set"
import sortBy from "ramda/src/sortBy"
import view from "ramda/src/view"

window.R = {assoc, assocPath, compose, curry, equals, id: identity, identity, filter,
            lens, lensIndex, lensProp, merge, over, set, sortBy, view}

// RXJS ============================================================================================
import {Observable} from "rxjs/Observable"
import {Subject} from "rxjs/Subject"
import {ReplaySubject} from "rxjs/ReplaySubject"

// Observable functions
import "rxjs/add/observable/combineLatest"
import "rxjs/add/observable/merge"

// Observable methods
import "rxjs/add/operator/distinctUntilChanged"
import "rxjs/add/operator/do"
import "rxjs/add/operator/filter"
import "rxjs/add/operator/map"
import "rxjs/add/operator/pluck"
import "rxjs/add/operator/sample"
import "rxjs/add/operator/scan"
import "rxjs/add/operator/shareReplay"
import "rxjs/add/operator/startWith"
import "rxjs/add/operator/withLatestFrom"

window.Observable = Observable
window.Subject = Subject
window.ReplaySubject = ReplaySubject

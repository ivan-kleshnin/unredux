// RAMDA ===========================================================================================
import assoc from "ramda/src/assoc"
import equals from "ramda/src/equals"
import merge from "ramda/src/merge"

window.R = {assoc, merge}

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
import "rxjs/add/operator/sample"
import "rxjs/add/operator/scan"
import "rxjs/add/operator/shareReplay"
import "rxjs/add/operator/startWith"

window.Observable = Observable
window.Subject = Subject
window.ReplaySubject = ReplaySubject

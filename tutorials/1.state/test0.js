import * as R from "ramda"
import {Observable as O} from "rxjs"

let action$ = O.of(R.inc, R.inc, R.inc, R.inc, R.dec, R.dec, R.dec, R.dec)
  .concatMap(x => O.of(x).delay(200))

let a = 0
action$.subscribe(fn => {
  a = fn(a)
  console.log(a)
})

// Next: kinda works but global variables aren't what we want to end with...

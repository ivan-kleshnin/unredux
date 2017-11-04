import * as R from "ramda"
import {Observable as O} from "rxjs"

// Lib =============================================================================================
// Our current step is to separate app and library code
function Store(seed, action$) {
  return action$
    .startWith(seed)
    .scan((state, fn) => fn(state))
    .distinctUntilChanged(R.identical)
    .shareReplay(1)
}

// App =============================================================================================
let action$ = O.of(R.inc, R.inc, R.inc, R.inc, R.inc)
  .concatMap(x => O.of(x).delay(200))

let state1 = Store(1, action$)

state1.subscribe(s => {
  console.log("store1:", s)
})

setTimeout(() => {
  let state10 = Store(10, action$)

  state10.subscribe(s => {
    console.log("store10:", s)
  })
}, 1200)

// Next: we want to be able to name states and to override the defaults...

import * as R from "ramda"
import {Observable as O} from "rxjs"

let actions = O.of(R.inc, R.inc, R.inc, R.inc, R.dec, R.dec, R.dec, R.dec)
  .concatMap(x => O.of(x).delay(200))

let seed = 0
let state = actions
  .startWith(seed)
  .scan((state, fn) => fn(state))
  .shareReplay(1) // without this, the following will use two separate state copies!

state.subscribe(s => {
  console.log(s)
})

state.subscribe(s => {
  console.log(s)
})

// Next: prevent state from repeating the same value...

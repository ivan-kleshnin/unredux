import * as R from "ramda"
import K from "kefir"

let action$ = K.sequentially(200, [R.inc, R.inc, R.inc, R.inc, R.dec, R.dec, R.dec, R.dec])

let seed = 0
let state$ = action$
  .merge(K.constant(seed))
  .scan((state, fn) => fn(state))

state$.log("state$")
state$.log("state$") // Supported by default in KefirJS (but not in RxJS)

// Next: prevent state from repeating the same value...

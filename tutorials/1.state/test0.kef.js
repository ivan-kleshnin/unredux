import * as R from "ramda"
import K from "kefir"

let action$ = K.sequentially(200, [R.inc, R.inc, R.inc, R.inc, R.dec, R.dec, R.dec, R.dec])

let a = 0
action$.observe(fn => {
  a = fn(a)
  console.log(a)
})

// Next: kinda works but global variables aren't what we want to end with...

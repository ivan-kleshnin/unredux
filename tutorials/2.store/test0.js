import * as R from "ramda"
import K from "kefir"

// Lib =============================================================================================
// Our current step is to separate app and library code
function Store(seed, action$) {
  return action$
    .merge(K.constant(seed))
    .scan((state, fn) => fn(state))
    .skipDuplicates()
}

// App =============================================================================================
let makeAction$ = () => K.sequentially(200, [R.inc, R.inc, R.inc, R.inc, R.inc])

let state1 = Store(1, makeAction$())

state1.observe(s => {
  console.log("state1:", s)
})

setTimeout(() => {
  let state10 = Store(10, makeAction$())

  state10.observe(s => {
    console.log("state10:", s)
  })
}, 1200)

// Next: we want to be able to name states and to override the defaults...

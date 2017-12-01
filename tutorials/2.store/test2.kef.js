import * as R from "ramda"
import {inspect} from "util"
import K from "kefir"

// Lib ===========================================================================================
// We can inject `seed` via `options` or `action$`. The second one is preferable because the "later"
// arguments are easier to wrap (and substitute) with middlewares, as you'll see later.
function makeStore(options) {
  return function Store(action$) {
    options = R.merge(makeStore.options, options)

    let self = {options} // no OOP

    self.$ = action$
      .scan((state, fn) => {
        if (R.is(Function, fn)) {
          return fn(state)
        } else {
          throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
        }
      }, null)
      .skipDuplicates()

    return self
  }
}

// Discoverability (and debuggability) are even more important than testability!
// Why noone teaches them?!
makeStore.options = {
  cmpFn: R.identical,
}

// App =============================================================================================
let makeAction$ = () => K.sequentially(200, [R.inc, R.inc, R.inc, R.inc, R.inc])

let state1 = makeStore({})(makeAction$().merge(K.constant(1)))

state1.$.observe(s => {
  console.log("state1:", s)
})

setTimeout(() => {
  let state10 = makeStore({})(makeAction$().merge(K.constant(10)))

  state10.$.observe(s => {
    console.log("state10:", s)
  })
}, 1200)

// Next: we want to log state inputs and outputs...

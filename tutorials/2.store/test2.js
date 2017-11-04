import * as R from "ramda"
import {inspect} from "util"
import {Observable as O} from "rxjs"

// Lib ===========================================================================================
let storeCount = 0

// We can inject `seed` via `options` or `action$`. The second one is preferable because the "later"
// arguments are easier to wrap (and substitute) with middlewares, as you'll see later.
function makeStore(options) {
  return function Store(action$) {
    options = R.merge(makeStore.options, options)
    options.name = options.name || "store" + (++storeCount) // Anonymous stores will be "store1", "store2", etc.

    let self = {options} // no OOP

    self.$ = action$
      .scan((prevState, fn) => {
        let nextState
        if (R.is(Function, fn)) {
          nextState = fn(prevState)
        } else {
          throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
        }
        return nextState
      }, null)
      .distinctUntilChanged(options.cmpFn)
      .shareReplay(1)

    return self
  }
}

// Discoverability (and debuggability) are even more important than testability!
// Why noone teaches you them?
makeStore.options = {
  cmpFn: R.identical,
  name: "",
  seed: null,
}

// App =============================================================================================
let action$ = O.of(R.inc, R.inc, R.inc, R.inc, R.inc) // try to append `R.add` to see an error
  .concatMap(x => O.of(x).delay(200))                 // caused by a wrong arity!

let state1 = makeStore({name: "state1"})
  (action$.startWith(() => 1))

state1.$.subscribe(s => {
  console.log(state1.options.name + ":", s)
})

setTimeout(() => {
  let state10 = makeStore({name: "state10"})
    (action$.startWith(() => 10))

  state10.$.subscribe(s => {
    console.log(state10.options.name + ":", s)
  })
}, 1200)

// Next: we want to log state inputs and outputs...

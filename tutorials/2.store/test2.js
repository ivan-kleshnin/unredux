import * as R from "ramda"
import {inspect} from "util"
import {Observable as O} from "rxjs"

// Lib ===========================================================================================
let cmpFn = R.identical

let assertFn = (v) => {
  if (process.env.NODE_ENV != "production") {
    let v2
    try {
      v2 = JSON.parse(JSON.stringify(v))
      if (R.equals(v, v2)) {
        return v
      }
    } catch (err) {
      // break
    }
    throw Error(`state must be JSON-serializable, got ${inspect(v)}`)
  }
  return v
}

let storeCount = 0

// Let's hide that `seed` into options where it fits better. One argument less...
function makeStore(options) {
  return function Store(actions) {
    options = R.merge(makeStore.options, options)
    options.name = options.name || "store" + (++storeCount) // Anonymous stores will be "store1", "store2", etc.

    let self = {options} // no OOP

    self.$ = actions
      .startWith(options.seed)
      .scan((prevState, fn) => {
        let nextState
        if (R.is(Function, fn)) {
          nextState = fn(prevState)
        } else {
          throw Error(`dispatched value must be a function, got ${inspect(fn)}`)
        }
        return options.assertFn(nextState) // sanity checks in the abscence of static typing
      })
      .distinctUntilChanged(options.cmpFn)
      .shareReplay(1)

    return self
  }
}

// Discoverability (and debuggability) are even more important than testability!
// Why noone teaches them?!
makeStore.options = {
  cmpFn: R.identical,
  assertFn,
  name: "",
  seed: null,
}

// App =============================================================================================
let actions = O.of(R.inc, R.inc, R.inc, R.inc, R.inc) // try to append `R.add` to see an error
  .concatMap(x => O.of(x).delay(200))                 // caused by a wrong arity!

let state1 = makeStore({name: "state1", seed: 1})(actions)

state1.$.subscribe(s => {
  console.log(state1.options.name + ":", s)
})

setTimeout(() => {
  let state10 = makeStore({name: "state10", seed: 10})(actions)

  state10.$.subscribe(s => {
    console.log(state10.options.name + ":", s)
  })
}, 1200)

// Next: we want to log state inputs and outputs...

// TODO port to Kefir

import A from "assert"
import {Observable as O} from "rxjs"
import * as R from "@paqmind/ramda"
import * as D from "kefir.db"

let seed = {counter: 0}

// Comparison of approaches:
let action$ = O.of
  (
    // Raw lambdas and curried functions
    () => seed,
    R.over("counter", R.inc),
    R.over("counter", R.add(2)),
  )
  .concatMap(x => O.of(x).delay(200))
  .concat(O.of
    (
      // ES5-style functions
      function init() { return seed },
      function increment(s) { return R.over("counter", R.inc, s) },
      function addTwo(s) { return R.over("counter", R.add(2), s) },
    ).concatMap(x => O.of(x).delay(200))
  )
  .concat(O.of
    (
      // Commands
      {fn: R.fn("init", () => seed)},
      {fn: R.over, args: ["counter", R.inc]},
      {fn: R.over, args: ["counter", {fn: R.add, args: [2]}]},
    ).concatMap(x => O.of(x).delay(200))
  )

let state = D.run(
  () => D.makeStore({}),
  D.withLog({key: "db"}),
  D.withControl({}),
)(action$)

state.$.subscribe()

/*
Raw lambdas and curried functions
  @ db λ anonymous
  # db = { counter: 0 }
  @ db λ over_2
  # db = { counter: 1 }
  @ db λ over_2
  # db = { counter: 3 }

ES5-style functions
  @ db λ init
  # db = { counter: 0 }
  @ db λ increment
  # db = { counter: 1 }
  @ db λ addTwo
  # db = { counter: 3 }

Commands
  @ db λ init
  # db = { counter: 0 }
  @ db λ over('counter', inc)
  # db = { counter: 1 }
  @ db λ over('counter', add(2))
  # db = { counter: 3 }

Commands are the most transparent. Note that they are syntactically longer than ES6, but still
shorter than ES5 ^_^.
*/

// Next: try testable (external) state modifiers



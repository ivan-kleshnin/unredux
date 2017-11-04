import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import {isolate} from "../meta"
import CounterA from "../counter-a/CounterA"
import CounterB from "../counter-b/CounterB"
import CounterX from "../counter-x/CounterX"
import CounterY from "../counter-y/CounterY"

export default (sources, key) => {
  // State-independent components
  let a = isolate(CounterA, "a")(sources)
  let b = isolate(CounterB, "b")(sources)

  // State-connected components
  let x1 = isolate(CounterX, "x1")(sources)
  let x2 = isolate(CounterX, "x2")(sources)
  let y1 = isolate(CounterY, "y1")(sources)
  let y2 = isolate(CounterY, "y2")(sources)

  let seed = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  }

  let state = R.run(
    () => D.makeStore({name: key + ".db"}),
    D.withLog({}),
  )(O.merge(
    F.init({x1: 0, x2: 0, y1: 0, y2: 0}),
    O.merge(x1.$, x2.$, y1.$, y2.$),
  ))

  let DOM = (props) => {
    return <div>
      <a.DOM/>
      <b.DOM/>
      <x1.DOM/>
      <x2.DOM/>
      <y1.DOM/>
      <y2.DOM/>
    </div>
  }

  state.$.subscribe(sources.$)

  return {DOM}
}

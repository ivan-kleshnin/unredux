import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import CounterAApp from "../counter-a/CounterAApp"
import CounterBApp from "../counter-b/CounterBApp"
import CounterXApp from "../counter-x/CounterXApp"
import CounterYApp from "../counter-y/CounterYApp"

export default (sources, key) => {
  // State-independent components
  let counterAApp = F.isolate(CounterAApp, "a")(sources)
  let counterBApp = F.isolate(CounterBApp, "b")(sources)

  // State-connected components
  let counterX1App = F.isolate(CounterXApp, "x1")(sources)
  let counterX2App = F.isolate(CounterXApp, "x2")(sources)
  let counterY1App = F.isolate(CounterYApp, "y1")(sources)
  let counterY2App = F.isolate(CounterYApp, "y2")(sources)

  let seed = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({name: key}),
  )(O.merge(
    F.init({x1: 0, x2: 0, y1: 0, y2: 0}),

    counterX1App.$,
    counterX2App.$,
    counterY1App.$,
    counterY2App.$,
  )).$

  state$.subscribe(sources.$)

  let DOM = (props) => {
    return <div>
      <counterAApp.DOM/>
      <counterBApp.DOM/>
      <counterX1App.DOM/>
      <counterX2App.DOM/>
      <counterY1App.DOM/>
      <counterY2App.DOM/>
    </div>
  }

  return {DOM}
}

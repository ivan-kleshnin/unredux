import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import aApp from "../counter-a/app"
import bApp from "../counter-b/app"
import cApp from "../counter-c/app"

export default (sources, key) => {
  // Counters A* aren't connected to the root state
  let a1Sinks = F.isolate(aApp, "a1")({...sources, props: {title: "CounterA1"}})
  let a2Sinks = F.isolate(aApp, "a2")({...sources, props: {title: "CounterA2"}})

  // Counters B* are connected to the root state via state$ sinks
  let b1Sinks = F.isolate(bApp, "b1")({...sources, props: {title: "CounterB1"}})
  let b2Sinks = F.isolate(bApp, "b2")({...sources, props: {title: "CounterB2"}})

  // CounterC is connected to the root state via action$ sink
  let c1Sinks = F.isolate(cApp, "c1")({...sources, props: {title: "CounterC1"}})
  let c2Sinks = F.isolate(cApp, "c2")({...sources, props: {title: "CounterC2"}})

  let seed = {
    b1: 2,
    b2: 2,
    c1: 2,
    c2: 2,
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(O.merge(
    D.init(seed),

    b1Sinks.state$.map(v => R.set("b1", v)),
    b2Sinks.state$.map(v => R.set("b2", v)),
    c1Sinks.action$,
    c2Sinks.action$,
  )).$

  let Component = (props) => {
    return <div>
      <a1Sinks.Component/>
      <a2Sinks.Component/>
      <b1Sinks.Component/>
      <b2Sinks.Component/>
      <c1Sinks.Component/>
      <c2Sinks.Component/>
    </div>
  }

  return {state$, Component}
}

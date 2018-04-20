import {isolate} from "framework"
import * as D from "kefir.db"
import React from "react"
import aApp from "../counter-a"
import bApp from "../counter-b"
import cApp from "../counter-c"

export let seed = {
  b1: 1,
  b2: 1,
  c1: 2,
  c2: 2,
}

/*
 This example demonstrates 4 possible patterns
 of connection between parent and child apps.

 All 4 cases have the same sources but different sinks.
*/
export default (sources, {key}) => {
  // Counters A* aren't connected to the root state
  let a1Sinks = isolate(aApp, "a1")({...sources, title: "CounterA1"})
  let a2Sinks = isolate(aApp, "a2")({...sources, title: "CounterA2"})
  // a*Sinks :: {Component}

  // Counters B* are connected to the root state via `state$` sinks
  let b1Sinks = isolate(bApp, "b1")({...sources, title: "CounterB1"})
  let b2Sinks = isolate(bApp, "b2")({...sources, title: "CounterB2"})
  // b*Sinks :: {Component, state$}

  // Counters C* are connected to the root state via `action$` sinks
  let c1Sinks = isolate(cApp, "c1")({...sources, title: "CounterC1"})
  let c2Sinks = isolate(cApp, "c2")({...sources, title: "CounterC2"})
  // c*Sinks :: {Component, action$}

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(seed),

    // Counters B* can work without root state
    b1Sinks.state$.skip(1).map(R.set2("b1")),
    b2Sinks.state$.skip(1).map(R.set2("b2")),

    // Counters C* can't work without root state
    c1Sinks.action$,
    c2Sinks.action$,
  ).$

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

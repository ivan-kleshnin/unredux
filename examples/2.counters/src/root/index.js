import {isolateDOM, isolateState} from "vendors/framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import aApp from "../counter-a"
import bApp from "../counter-b"
import cApp from "../counter-c"

export let seed = {
  b1: 10,
  b2: 10,
  c1: 20,
  c2: 20,
}

/*
 This example demonstrates 3 most important patterns of connection between parent
 and child apps (more patterns are technically possible).
*/
export default (sources, {key}) => {
  // Counters A* have their own states, invisible outside
  let a1Sinks = isolateDOM(aApp, "a1")(sources, {title: "CounterA1"})
  let a2Sinks = isolateDOM(aApp, "a2")(sources, {title: "CounterA2"})
  // a*Sinks :: {Component}

  // Counters B* have their own states, visible outside
  let b1Sinks = isolateDOM(bApp, "b1")(sources, {title: "CounterB1"})
  let b2Sinks = isolateDOM(bApp, "b2")(sources, {title: "CounterB2"})
  // b*Sinks :: {Component, state$}

  // Counters C* use the root state$ and modify it via `action$` sink
  let c1Sinks = isolateState(isolateDOM(cApp, "c1"), "c1")(sources, {title: "CounterC1"})
  let c2Sinks = isolateState(isolateDOM(cApp, "c2"), "c2")(sources, {title: "CounterC2"})
  // c*Sinks :: {Component, action$}

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(seed),

    // Counters A* are irrelevant here

    // Counters B* will work without the root state
    b1Sinks.state$.skip(1).map(R.set2("b1")),
    b2Sinks.state$.skip(1).map(R.set2("b2")),

    // Counters C* won't work without the root state
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

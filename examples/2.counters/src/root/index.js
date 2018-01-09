import * as R from "@paqmind/ramda"
import * as F from "framework"
import * as D from "kefir.db"
import React from "react"
import aApp from "../counter-a"
import bApp from "../counter-b"
import cApp from "../counter-c"
import dApp from "../counter-d"

export let seed = {
  b1: 1,
  b2: 1,
  c1: 2,
  c2: 2,
  d1: 3,
  d2: 3,
}

/*
 This example demonstrates 4 possible patterns
 of connection between parent and child apps.

 All 4 cases have the same sources but different sinks.
*/
export default (sources, key) => {
  // Counters A* aren't connected to the root state
  let a1Sinks = F.isolate(aApp, "a1")({...sources, props: {title: "CounterA1"}})
  let a2Sinks = F.isolate(aApp, "a2")({...sources, props: {title: "CounterA2"}})
  // a*Sinks :: {Component}

  // Counters B* are connected to the root state via `state$` sinks
  let b1Sinks = F.isolate(bApp, "b1")({...sources, props: {title: "CounterB1"}})
  let b2Sinks = F.isolate(bApp, "b2")({...sources, props: {title: "CounterB2"}})
  // b*Sinks :: {Component, state$}

  // Counters C* are connected to the root state via `action$` sinks
  let c1Sinks = F.isolate(cApp, "c1")({...sources, props: {title: "CounterC1"}})
  let c2Sinks = F.isolate(cApp, "c2")({...sources, props: {title: "CounterC2"}})
  // c*Sinks :: {Component, action$}

  // Counters D* are connected to the root state via `intents` sinks
  let d1Sinks = F.isolate(dApp, "d1")({...sources, props: {title: "CounterD1"}})
  let d2Sinks = F.isolate(dApp, "d2")({...sources, props: {title: "CounterD2"}})
  // d*Sinks :: {Component, intents}

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

    // Counters D* can't work without root state
    d1Sinks.intents.inc$.map(_ => R.over2("d1", R.inc)),
    d1Sinks.intents.dec$.map(_ => R.over2("d1", R.dec)),
    d2Sinks.intents.inc$.map(_ => R.over2("d2", R.inc)),
    d2Sinks.intents.dec$.map(_ => R.over2("d2", R.dec)),
  ).$

  let Component = (props) => {
    return <div>
      <a1Sinks.Component/>
      <a2Sinks.Component/>
      <b1Sinks.Component/>
      <b2Sinks.Component/>
      <c1Sinks.Component/>
      <c2Sinks.Component/>
      <d1Sinks.Component/>
      <d2Sinks.Component/>
    </div>
  }

  return {state$, Component}
}

import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import aApp from "../counter-a/app"
import bApp from "../counter-b/app"
import xApp from "../counter-x/app"
import yApp from "../counter-y/app"

export default (sources, key) => {
  // State-independent components
  let aSinks = F.isolate(aApp, "a")(sources)
  let bSinks = F.isolate(bApp, "b")(sources)

  // State-connected components
  let x1Sinks = F.isolate(xApp, "x1")(sources)
  let x2Sinks = F.isolate(xApp, "x2")(sources)
  let y1Sinks = F.isolate(yApp, "y1")(sources)
  let y2Sinks = F.isolate(yApp, "y2")(sources)

  let seed = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(O.merge(
    F.init({x1: 0, x2: 0, y1: 0, y2: 0}),

    x1Sinks.$,
    x2Sinks.$,
    y1Sinks.$,
    y2Sinks.$,
  )).$

  state$.subscribe(sources.$)

  let DOM = (props) => {
    return <div>
      <aSinks.DOM/>
      <bSinks.DOM/>
      <x1Sinks.DOM/>
      <x2Sinks.DOM/>
      <y1Sinks.DOM/>
      <y2Sinks.DOM/>
    </div>
  }

  return {DOM}
}

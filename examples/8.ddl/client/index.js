import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import React from "react"
import ReactDOM from "react-dom"
import "shims"
import {appKey} from "./meta"
import app, {seed} from "./root"

import "./index.less"

let toProperty = (x) => x.toProperty().skipDuplicates(R.equals)

// APP RUN -----------------------------------------------------------------------------------------
let sources = {
  state$: K.pool(),
  DOM: F.fromDOMEvent("#" + appKey),
}

let sinks = app(
  R.over2("state$", toProperty, sources),
  appKey
)

sources.state$.plug(K.constant(seed))

sinks.state$.observe(state => {
  setImmediate(() => {
    sources.state$.plug(K.constant(state))
  })
})

// APP MODES ---------------------------------------------------------------------------------------
// we can delay for some official first state event here
ReactDOM.render(<sinks.Component/>, document.getElementById(appKey))

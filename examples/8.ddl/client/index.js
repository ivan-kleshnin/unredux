import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import React from "react"
import ReactDOM from "react-dom"
import "shims"
import {appKey} from "./meta"
import app, {seed} from "./root"

import "./index.less"

// APP RUN -----------------------------------------------------------------------------------------
let sources = {
  state$: K.pool(),
  DOM: F.fromDOMEvent("#" + appKey),
}

let sinks = app(
  R.over2("state$", (x) => x.toProperty().skipDuplicates(), sources),
  appKey
)

sinks.state$.skip(1).observe(state => {
  setImmediate(() => {
    sources.state$.plug(K.constant(state))
  })
})

sources.state$.plug(K.constant(R.merge(seed, {url: document.location.href})))

// APP MODES ---------------------------------------------------------------------------------------
// we can delay for some official first state event here
ReactDOM.render(<sinks.Component/>, document.getElementById(appKey))

import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import React from "react"
import ReactDOM from "react-dom"
import "shims"
import {APP_KEY} from "./meta"
import app from "./root"

let sources = {
  state$: K.pool(),
  DOM: F.fromDOMEvent("#" + APP_KEY),
}

let sinks = app(
  R.over2("state$", x => x.toProperty(), sources),
  APP_KEY
)

sinks.state$.observe(state =>
  sources.state$.plug(K.constant(state))
)

ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))

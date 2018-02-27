import {fromDOMEvent} from "framework"
import K from "kefir"
import React from "react"
import ReactDOM from "react-dom"
import "shims"
import {APP_KEY} from "./meta"
import app from "./root"

let sources = {
  state$: K.pool(),
  DOM: fromDOMEvent("#" + APP_KEY),
}

let sinks = app(sources, APP_KEY)

sinks.state$.observe(state =>
  sources.state$.plug(K.constant(state))
)

ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))

import {fromDOMEvent, poolProp} from "framework"
import Q from "querystring"
import React from "react"
import ReactDOM from "react-dom"
import "shims"
import {APP_KEY} from "./meta"
import app from "./root"

import "./index.less"

// Prepare sources
let sources = {
  DOM: fromDOMEvent("#" + APP_KEY),
  state$: poolProp(),
}

// Prepare props
let props = {
  key: APP_KEY,
  url: document.location.href.replace(document.location.origin, ""),
}

// Run app to get sinks
let sinks = app(sources, props)

// Cycle the root state
sinks.state$.observe(sources.state$.plug)

// Render the Component sink
ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))

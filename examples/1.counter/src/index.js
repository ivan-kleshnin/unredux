import {fromDOMEvent, poolProp} from "framework"
import React from "react"
import ReactDOM from "react-dom"
import "shims"
import app from "./root"

let APP_KEY = "root"

// Prepare sources
let sources = {
  DOM: fromDOMEvent("#" + APP_KEY),
  state$: poolProp(),
}

// Prepare props
let props = {
  key: APP_KEY,
}

// Run app to get sinks
let sinks = app(sources, props)

// Cycle the root state
sinks.state$.observe(sources.state$.plug)

// Render the Component sink
ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))

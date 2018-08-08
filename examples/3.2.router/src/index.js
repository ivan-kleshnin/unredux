import {fromDOMEvent, poolProp} from "vendors/framework"
import "vendors/shims"
import React from "react"
import ReactDOM from "react-dom"
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
  url: document.location.href.replace(document.location.origin, ""),
}

// Run app to get sinks
let sinks = app(sources, props)

// Cycle the root state
sinks.state$.observe(sources.state$.plug)

// Render the Component sink
sinks.state$.sampledBy(sinks.route$).take(1).observe(state => {
  ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))
})

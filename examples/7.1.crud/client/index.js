import React from "react"
import ReactDOM from "react-dom"
import "vendors/shims"
import {fromDOMEvent, poolProp} from "vendors/framework"
import {APP_KEY} from "./meta"
import app, {seed} from "./root"
import "./index.less"

// Prepare sources
let sources = {
  DOM: fromDOMEvent("#" + APP_KEY),
  state$: poolProp(seed),
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

sinks.state$.sampledBy(sinks.route$).take(1).observe(state => {
  // Render the Component sink
  ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))
})

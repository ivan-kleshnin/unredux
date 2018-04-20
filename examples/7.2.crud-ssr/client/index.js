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
let qs = Q.parse(document.location.search.slice(1))

let props = {
  key: APP_KEY,
  url: document.location.href.replace(document.location.origin, ""),
  noSSR: qs.noSSR,
}

// Run app to get sinks
let sinks = app(sources, props)

// Cycle the root state
sinks.state$.observe(sources.state$.plug)

// Check rendering modes
if (qs.noSSR) {
  // Render the Component sink
  ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))
}
else {
  // Reset window.state except _loading flags (to avoid index caching in a quick-n-dirty way)
  window.state = {_loading: window.state._loading}
  // Remove state DOM node
  document.querySelector(`#${APP_KEY}-state`).outerHTML = ""
  // Hydrate the Component sink
  ReactDOM.hydrate(<sinks.Component/>, document.getElementById(APP_KEY))
}

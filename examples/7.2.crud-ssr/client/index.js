import Q from "querystring"
import React from "react"
import ReactDOM from "react-dom"
import "vendors/shims"
import {derive, fromDOMEvent, poolProp} from "vendors/framework"
import {APP_KEY} from "./meta"
import app, {seed} from "./root"
import "./index.less"

let qs = Q.parse(document.location.search.slice(1))
let noSSR = "noSSR" in qs

// Prepare sources
let sources = {
  DOM: fromDOMEvent("#" + APP_KEY),
  state$: poolProp(noSSR ? seed : window.state),
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

// TODO move to withRouting?!
derive(sinks.state$, "document").observe(doc => {
  // Effects
  document.title = doc.title
  // descriptionElem.setAttribute("content", doc.description || "")
})

sinks.route$.observe(route => {
  // Other possible effects
  // ogUrlElem.setAttribute("content", (document.location.origin + route.url) || "")
  // if (window.ga) {
  //   window.ga("set", "page", route.url)
  //   window.ga("send", "pageview")
  // }
})

sinks.effect$.observe(fn => {
  // Effects
  fn()
})

sinks.state$.sampledBy(sinks.route$).take(1).observe(state => {
  // Check rendering modes
  if (noSSR) {
    // Render the Component sink
    ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))
  } else {
    // Reset window.state
    delete window.state
    // Remove state DOM node
    document.querySelector(`#${APP_KEY}-state`).outerHTML = ""
    // Hydrate the Component sink
    ReactDOM.hydrate(<sinks.Component/>, document.getElementById(APP_KEY))
  }
})

import Q from "querystring"
import K from "kefir"
import React from "react"
import ReactDOM from "react-dom"
import "vendors/shims"
import {derive, fromDOMEvent, poolProp} from "vendors/framework"
import {APP_KEY} from "./meta"
import app, {seed} from "./root"
import "./index.less"

let qs = Q.parse(document.location.search.slice(1))
let ssr = !("noSSR" in qs)

// Prepare sources
let sources = {
  DOM: fromDOMEvent("#" + APP_KEY),
  state$: poolProp(ssr ? window[APP_KEY].state : seed),
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

// Side-effects
K.combine([sinks.route$], [derive(sinks.state$, "document")]).observe(([route, doc]) => {
  document.title = doc.title
  // Other possibilities:
  // descriptionElem.setAttribute("content", doc.description || "")
  // ogTitleElem.setAttribute("content", doc.title || "")
  // ogTypeElem.setAttribute("content", doc.ogType || "")
  // ogUrlElem.setAttribute("content", document.location.origin + route.url)
  // ogImageElem.setAttribute("content", document.location.origin + doc.ogImage)
  // ogDescriptionElem.setAttribute("content", doc.description || "")
  // if (window.ga) {
  //   window.ga("set", "page", route.url)
  //   window.ga("send", "pageview")
  // }
})

sinks.effect$.observe(fn => { fn() })

// Start rendering the state on the first route
sinks.state$.sampledBy(sinks.route$).take(1).observe(state => {
  if (ssr) {
    // Reset window.state
    delete window[APP_KEY].state
    // Remove state DOM node
    document.querySelector(`#${APP_KEY}-state`).outerHTML = ""
    // Hydrate the Component sink
    ReactDOM.hydrate(<sinks.Component/>, document.getElementById(APP_KEY))
  } else {
    // Render the Component sink
    ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))
  }
})

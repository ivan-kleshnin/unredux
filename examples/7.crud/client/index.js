import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import React from "react"
import ReactDOM from "react-dom"
import Q from "querystring"
import "shims"
import {appKey} from "./meta"
import app from "./root"

import "./index.less"

let toProperty = (x) => x.toProperty().skipDuplicates(R.equals)

// APP RUN -----------------------------------------------------------------------------------------
let sources = {
  state$: K.pool(),
  DOM: F.fromDOMEvent("#" + appKey),
}

let sinks = app(
  R.over2("state$", toProperty, sources),
  appKey
)

if (window.state) {
  sources.state$.plug(K.constant(R.clone(window.state)))
}

sinks.state$.observe(state => {
  setImmediate(() => {
    sources.state$.plug(K.constant(state))
  })
})

// APP MODES ---------------------------------------------------------------------------------------
let qs = Q.parse(document.location.search.slice(1))

if (qs.noSSR || qs.noAPP) {
  ReactDOM.render(<sinks.Component/>, document.getElementById(appKey))
} else {
  // delete window.state <...data keys only...> TODO
  document.querySelector("#rootState").outerHTML = ""
  ReactDOM.hydrate(<sinks.Component/>, document.getElementById(appKey))
}

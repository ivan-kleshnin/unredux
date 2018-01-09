import "setimmediate"
import clone from "clone"
import K from "kefir"
import * as F from "framework"
import * as R from "ramda"
import React from "react"
import ReactDOM from "react-dom"
import "./index.less"
import {appKey} from "./meta"
import app from "./root"

let sources = {
  state$: K.pool(),
  DOM: F.fromDOMEvent("#" + appKey),
}

let sinks = app(
  R.over("state$", x => x.toProperty().skipDuplicates(R.equals), sources),
  appKey
)

// With SSR ----------------------------------------------------------------------------------------
sources.state$.plug(K.constant(clone(window[appKey].state)))
// delete window[appKey].state <...data keys only...> TODO
document.querySelector("#rootState").outerHTML = ""

sinks.state$.observe(state => {
  sources.state$.plug(K.constant(state))
})

ReactDOM.hydrate(<sinks.Component/>, document.getElementById(appKey))

// Without SSR -------------------------------------------------------------------------------------
// sources.state$.plug(K.constant(window.state))
//
// sinks.state$.observe(state => {
//   sources.state$.plug(K.constant(state))
// })
//
// ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))

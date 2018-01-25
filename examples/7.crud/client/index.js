import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import React from "react"
import ReactDOM from "react-dom"
import "shims"
import {appKey} from "./meta"
import app from "./root"
import "./index.less"

let sources = {
  state$: K.pool(),
  DOM: F.fromDOMEvent("#" + appKey),
}

let sinks = app(
  R.over2("state$", x => x.toProperty().skipDuplicates(R.equals), sources),
  appKey
)

// With SSR ----------------------------------------------------------------------------------------
sources.state$.plug(K.constant(R.clone(window.state)))
// delete window.state <...data keys only...> TODO
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

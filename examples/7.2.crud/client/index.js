import "setimmediate"
import "./index.less"
import K from "kefir"
import * as R from "ramda"
import React from "react"
import ReactDOM from "react-dom"
import {APP_KEY} from "./meta"
import * as F from "framework"
import app from "./root"

let sources = {
  state$: K.pool(),
  DOM: F.fromDOMEvent("#" + APP_KEY),
}

let sinks = app(
  R.over("state$", x => x.toProperty().skipDuplicates(R.equals), sources),
  APP_KEY
)

// With SSR ----------------------------------------------------------------------------------------
// sources.state$.plug(K.constant(window.state))
// delete window.state
// document.querySelector("#rootState").outerHTML = ""
//
// sinks.state$.observe(state => {
//   sources.state$.plug(K.constant(state))
// })
//
// ReactDOM.hydrate(<sinks.Component/>, document.getElementById(APP_KEY))

// Without SSR -------------------------------------------------------------------------------------
sources.state$.plug(K.constant(window.state))

sinks.state$.observe(state => {
  sources.state$.plug(K.constant(state))
})

ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))

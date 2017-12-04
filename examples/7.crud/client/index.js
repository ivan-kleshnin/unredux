import "./index.less"

import {ReplaySubject} from "rxjs"
import React from "react"
import ReactDOM from "react-dom"
import {APP_KEY} from "./meta"
import * as F from "framework"
import app from "./root"

let sources = {
  props: {},
  state$: new ReplaySubject(1),
  DOM: F.fromDOMEvent("#" + APP_KEY),
}

let sinks = app(sources, APP_KEY)

sinks.state$.subscribe(sources.state$)

// Use window.state and cleanup after SSR
sources.state$.next(window.state)
delete window.state
document.querySelector("#rootState").outerHTML = ""

// ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))
ReactDOM.hydrate(<sinks.Component/>, document.getElementById(APP_KEY))

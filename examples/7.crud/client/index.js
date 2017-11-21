import {ReplaySubject} from "rxjs"
import React from "react"
import ReactDOM from "react-dom"
import {APP_KEY} from "./meta"
import * as F from "framework"
import app from "./root"

let sources = {
  state$: new ReplaySubject(1),
  DOM: F.fromDOMEvent("#" + APP_KEY),
}

let sinks = app(sources, APP_KEY)

sinks.state$.subscribe(sources.state$)

ReactDOM.render(<sinks.Component/>, document.getElementById(APP_KEY))

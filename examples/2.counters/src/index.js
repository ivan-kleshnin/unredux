import {ReplaySubject} from "rxjs"
import React from "react"
import ReactDOM from "react-dom"
import {APP_KEY} from "./meta"
import * as F from "framework"
import App from "./app/App"

let app = App({
  $: new ReplaySubject(1),
  DOM: F.fromDOMEvent("#" + APP_KEY),
}, APP_KEY)

ReactDOM.render(<app.DOM/>, document.getElementById(APP_KEY))

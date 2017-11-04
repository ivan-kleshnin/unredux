import * as Rx from "rxjs"
import React from "react"
import ReactDOM from "react-dom"
import {fromDOMEvent} from "framework"
import App from "./app/App"

let APP_KEY = "root"

let app = App({
  $: new Rx.ReplaySubject(1),
  DOM: fromDOMEvent("#" + APP_KEY)
}, APP_KEY)

ReactDOM.render(<app.DOM/>, document.getElementById(APP_KEY))

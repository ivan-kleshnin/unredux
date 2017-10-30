import * as Rx from "rxjs"
import {fromDOMEventSTD} from "framework"
import App from "./app/App"

let APP_KEY = "root"

let {DOM} = App({
  $: new Rx.ReplaySubject(1),
  DOM: fromDOMEventSTD(APP_KEY)
})

ReactDOM.render(<DOM/>, document.getElementById(APP_KEY))

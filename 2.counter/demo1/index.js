import * as R from "ramda"
import {O, S} from "rxjs"
import {Component} from "react"
import {chan} from "./utils"

// Actions =========================================================================================
let actions = {
  increment: chan($ => $.map((...args) => state =>
    R.assoc("counter", state.counter + 1, state)
  )),

  decrement: chan($ => $.map((...args) => state =>
    R.assoc("counter", state.counter - 1, state)
  )),

  incrementIfOdd: chan($ => $.map((...args) => state =>
    state.counter % 2
      ? R.assoc("counter", state.counter + 1, state)
      : state
  )),
}

// State ===========================================================================================
let state = O.merge(
  actions.increment,
  actions.decrement,
  actions.incrementIfOdd,
)
 .startWith({counter: 0})
 .scan((state, fn) => fn(state))
 .distinctUntilChanged(R.equals)
 .do(s => {
   console.log("state:", s)
 })
 .shareReplay(1)

// Components ======================================================================================
class App extends Component {
  componentWillMount() {
    this.sb = state
      .throttleTime(10, undefined, {leading: true, trailing: true}) // RxJS throttle is half-broken (https://github.com/ReactiveX/rxjs/search?q=throttle&type=Issues)
      .subscribe(state => {
        this.setState(state)
      })
  }

  componentWillUnmount() {
    this.sb.unsubscribe()
  }

  render() {
    return <div>
      <p>
        Clicked: <span id="value">{this.state.counter}</span> times
        {" "}
        <button id="increment" onClick={() => actions.increment()}>+</button>
        {" "}
        <button id="decrement" onClick={() => actions.decrement()}>-</button>
        {" "}
        <button id="incrementIfOdd" onClick={() => actions.incrementIfOdd()}>Increment if odd</button>
        {" "}
        <button id="incrementAsync" onClick={() => { setTimeout(() => actions.increment(), 500)}}>Increment async</button>
      </p>
    </div>
  }
}

ReactDOM.render(<App/>, document.getElementById("root"))

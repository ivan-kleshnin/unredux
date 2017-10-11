import {Component} from "react"
import {chan} from "./chan"

// Actions =========================================================================================
let actions = {
  increment: chan($ => $
    .map((...args) => state =>
      R.assoc("counter", state.counter + 1, state)
    )
  ),

  decrement: chan($ => $
    .map((...args) => state =>
      R.assoc("counter", state.counter - 1, state)
    )
  ),

  incrementIfOdd: chan($ => $
    .map((...args) => state =>
      state.counter % 2
        ? R.assoc("counter", state.counter + 1, state)
        : state
    )
  ),
}

// State ===========================================================================================
let initialState = {counter: 0}

let state = Observable.merge(
  actions.increment,
  actions.decrement,
  actions.incrementIfOdd,
)
 .startWith(initialState)
 .scan((state, fn) => fn(state))
 .distinctUntilChanged(R.equals)
 .do(s => {
   console.log("state:", s)
 })
 .shareReplay(1)

// Components ======================================================================================
class App extends Component {
  componentWillMount() {
    this.$ = state.subscribe(state => {
      this.setState(state)
    })
  }

  componentWillUnmount() {
    this.$.unsubscribe()
  }

  render() {
    return <div>
      <p>
        Clicked: <span id="value">{this.state.counter}</span> times
        <button id="increment" onClick={() => actions.increment()}>+</button>
        <button id="decrement" onClick={() => actions.decrement()}>-</button>
        <button id="incrementIfOdd" onClick={() => actions.incrementIfOdd()}>Increment if odd</button>
        <button id="incrementAsync" onClick={() => { setTimeout(() => actions.increment(), 500)}}>Increment async</button>
      </p>
    </div>
  }
}

ReactDOM.render(<App/>, document.getElementById("root"))

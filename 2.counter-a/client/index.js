import {Component} from "react"

// User intents
let intents = {
  increment: new Subject(),
  decrement: new Subject(),
  incrementIfOdd: new Subject(),
}

// State actions
let stateCycle = new ReplaySubject(1)

let actions = {
  increment: Observable.merge(
    intents.increment,
    stateCycle.sample(intents.incrementIfOdd).filter(state => state.counter % 2)
  )
    .map(() => R.assoc("counter", state.counter + 1)),
  decrement: intents.decrement
    .map(() => R.assoc("counter", state.counter - 1)),
}

// State stream
let initialState = {counter: 0}

let state = Observable.merge(
  actions.increment,
  actions.decrement,
)
 .startWith(initialState)
 .scan((state, fn) => fn(state))
 .do(state => {
   console.log("state spy:", state)
   stateCycle.next(state)
 })
 .distinctUntilChanged()
 .shareReplay(1)

// Rendering & Events
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
    let {state} = this
    return <div>
      <p>
        Clicked: <span id="value">{state.counter}</span> times
        <button id="increment" onClick={() => intents.increment.next()}>+</button>
        <button id="decrement" onClick={() => intents.increment.next()}>-</button>
        <button id="incrementIfOdd" onClick={() => intents.incrementIfOdd.next()}>Increment if odd</button>
        <button id="incrementAsync" onClick={() => setTimeout(() => intents.increment.next(), 500)}>Increment async</button>
      </p>
    </div>
  }
}

ReactDOM.render(<App/>, document.getElementById("root"))

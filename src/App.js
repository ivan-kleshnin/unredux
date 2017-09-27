import R from "ramda"
import {Observable} from "rxjs/Observable"
import {Subject} from "rxjs/Subject"

// Import RxJS Observable functions
import 'rxjs/add/observable/merge'

// Import RxJS Observable methods
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/shareReplay'

import React, { Component } from "react"

let intents = {
  increment: new Subject(),
  decrement: new Subject(),
  incrementIfOdd: new Subject(),
}

let actions = {
  increment: intents.increment.map(() => (state) => R.assoc("counter", state.counter + 1, state)),
  decrement: intents.decrement.map(() => (state) => R.assoc("counter", state.counter + 1, state)),
  incrementIfOdd: intents.incrementIfOdd.map(() => (state) => {
    return R.assoc("counter", state.counter % 2 ? state.counter + 1 : state.counter, state)
  }),
}

let initialState = {counter: 0}

let state = Observable.merge(
  actions.increment, actions.decrement, actions.incrementIfOdd,
).scan((state, fn) => fn(state), initialState)
 .distinctUntilChanged()
 .shareReplay(1)

class App extends Component {
  state = initialState

  componentDidMount() {
    this.$ = state.subscribe((state) => {
      console.log("setting state:", state)
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
        <button id="increment" onClick={() => intents.increment.next()}>+</button>
        <button id="decrement" onClick={() => intents.decrement.next()}>-</button>
        <button id="incrementIfOdd" onClick={() => intents.incrementIfOdd.next()}>Increment if odd</button>
        <button id="incrementAsync" onClick={() => {
          setTimeout(() => intents.increment.next(), 1000)
        }}>Increment async</button>
      </p>
    </div>
  }
}

export default App

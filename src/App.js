import R from "ramda"
import {Observable} from "rxjs/Observable"
import {Subject} from "rxjs/Subject"

// Import RxJS Observable functions
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/merge'

// Import RxJS Observable methods
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/shareReplay'

import React, { Component } from "react"

import combineLatestObj from "./combineLatestObj"

let intents = {
  increment: new Subject(),
  decrement: new Subject(),
  incrementIfOdd: new Subject(),
}

let actions = {
  increment: intents.increment.map(() => (state) => R.assoc("counter", state.counter + 1, state)),
  decrement: intents.decrement.map(() => (state) => R.assoc("counter", state.counter - 1, state)),
  incrementIfOdd: intents.incrementIfOdd.map(() => (state) => {
    return R.assoc("counter", state.counter % 2 ? state.counter + 1 : state.counter, state)
  }),
}

let initialState = {counter: 0}

let state = Observable.merge(
  actions.increment, actions.decrement, actions.incrementIfOdd,
)
 .startWith(initialState)
 .scan((state, fn) => fn(state))
 .distinctUntilChanged()
 .shareReplay(1)

function connect(streamsToProps, Component) {
  class Container extends Component {
    state = {} // will be replaced with initialState on componentWillMount (before first render)

    componentWillMount() {
      let props = combineLatestObj(streamsToProps)
      this.$ = props.subscribe((data) => {
        this.setState(data)
      })
    }

    componentWillUnmount() {
      this.$.unsubscribe()
    }

    render() {
      return React.createElement(Component, R.merge(this.props, this.state), this.props.children)
    }
  }
  return Container
}

class App extends Component {
  render() {
    return <div className={this.props.className}>
      <p>
        Clicked: <span id="value">{this.props.counter}</span> times
        <button id="increment" onClick={() => intents.increment.next()}>+</button>
        <button id="decrement" onClick={() => intents.decrement.next()}>-</button>
        <button id="incrementIfOdd" onClick={() => intents.incrementIfOdd.next()}>Increment if odd</button>
        <button id="incrementAsync" onClick={() => {
          setTimeout(() => intents.increment.next(), 500)
        }}>Increment async</button>
      </p>
    </div>
  }
}

export default connect({counter: state.map(s => s.counter)}, App)

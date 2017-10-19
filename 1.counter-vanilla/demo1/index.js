import * as R from "ramda"
import {O, S} from "rxjs"

// Actions =========================================================================================
let actions = {
  increment: new Subject().map(_ => state =>
    R.assoc("counter", state.counter + 1, state)
  ),

  decrement: new Subject().map(_ => state =>
    R.assoc("counter", state.counter - 1, state)
  ),

  incrementIfOdd: new Subject().map(_ => state =>
    state.counter % 2
      ? R.assoc("counter", state.counter + 1, state)
      : state
  )
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

// Rendering & Events ==============================================================================
let App = (state) =>
  `<div>
    <p>
      Clicked: <span id="value">${state.counter}</span> times
      <button id="increment">+</button>
      <button id="decrement">-</button>
      <button id="incrementIfOdd">Increment if odd</button>
      <button id="incrementAsync">Increment async</button>
    </p>
  </div>`

let bindEvents = () => {
  document.querySelector("#increment").addEventListener("click", () => {
    actions.increment.next()
  })

  document.querySelector("#decrement").addEventListener("click", () => {
    actions.decrement.next()
  })

  document.querySelector("#incrementIfOdd").addEventListener("click", () => {
    actions.incrementIfOdd.next()
  })

  document.querySelector("#incrementAsync").addEventListener("click", () => {
    setTimeout(() => actions.increment.next(), 500)
  })
}

let root = document.querySelector("#root")
state.subscribe(s => {
  root.innerHTML = App(s)
  bindEvents()
})

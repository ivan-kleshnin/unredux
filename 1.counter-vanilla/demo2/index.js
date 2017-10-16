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
    actions.increment() // .next() is no longer required
  })

  document.querySelector("#decrement").addEventListener("click", () => {
    actions.decrement() // .next() is no longer required
  })

  document.querySelector("#incrementIfOdd").addEventListener("click", () => {
    actions.incrementIfOdd() // .next() is no longer required
  })

  document.querySelector("#incrementAsync").addEventListener("click", () => {
    setTimeout(() => actions.increment(), 500) // .next() is no longer required
  })
}

let root = document.querySelector("#root")
state.subscribe(s => {
  root.innerHTML = App(s)
  bindEvents()
})

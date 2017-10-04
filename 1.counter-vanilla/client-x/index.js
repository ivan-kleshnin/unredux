import {chan, stateChan} from "./chan"

// User intents
let intents = {
  increment: chan(),      // new is no longer required
  decrement: chan(),      // new is no longer required
  incrementIfOdd: chan(), // new is no longer required
}

// State actions
let stateLoop = stateChan()

let actions = {
  increment: Observable.merge(
    intents.increment,
    stateLoop.sample(intents.incrementIfOdd).filter(state => state.counter % 2)
  )
    .map(() => state => R.assoc("counter", state.counter + 1, state)),

  decrement: intents.decrement
    .map(() => state => R.assoc("counter", state.counter - 1, state)),

  // In the current architecture, the worthless event (attempt to increment counter which won't work by condition)
  // is not even triggered. It's more reactive though arguably more complex (more moving parts)
  // It also requires the state looping (which is inevitably imperative).
}

// State stream
let initialState = {counter: 0}

let state = Observable.merge(
  actions.increment,
  actions.decrement,
)
 .startWith(initialState)
 .scan((state, fn) => fn(state))
 .distinctUntilChanged(R.equals)
 .do(state => {
   console.log("state spy:", state)
   stateLoop(state) // .next() is no longer required
 })
 .shareReplay(1)

// Rendering & Events
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
    intents.increment() // .next() is no longer required
  })

  document.querySelector("#decrement").addEventListener("click", () => {
    intents.decrement() // .next() is no longer required
  })

  document.querySelector("#incrementIfOdd").addEventListener("click", () => {
    intents.incrementIfOdd() // .next() is no longer required
  })

  document.querySelector("#incrementAsync").addEventListener("click", () => {
    setTimeout(() => intents.increment(), 500) // .next() is no longer required
  })
}

// Run
let root = document.querySelector("#root")
state.subscribe(state => {
  root.innerHTML = App(state)
  bindEvents()
})

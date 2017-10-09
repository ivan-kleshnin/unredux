// Intents =========================================================================================
let intents = {
  increment: new Subject(),
  decrement: new Subject(),
  incrementIfOdd: new Subject(),
}

// Actions =========================================================================================
let actions = {
  increment: intents.increment
    .map((...intentArgs) => (state) =>
      R.assoc("counter", state.counter + 1, state)
    ),

  decrement: intents.decrement
    .map((...intentArgs) => (state) =>
      R.assoc("counter", state.counter - 1, state)
    ),

  incrementIfOdd: intents.incrementIfOdd
    .map((...intentArgs) => (state) =>
      state.counter % 2
        ? R.assoc("counter", state.counter + 1, state)
        : state
    )
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
    intents.increment.next()
  })

  document.querySelector("#decrement").addEventListener("click", () => {
    intents.decrement.next()
  })

  document.querySelector("#incrementIfOdd").addEventListener("click", () => {
    intents.incrementIfOdd.next()
  })

  document.querySelector("#incrementAsync").addEventListener("click", () => {
    setTimeout(() => intents.increment.next(), 500)
  })
}

let root = document.querySelector("#root")
state.subscribe(state => {
  root.innerHTML = App(state)
  bindEvents()
})

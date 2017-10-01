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
    intents.increment.next()
  })

  document.querySelector("#incrementIfOdd").addEventListener("click", () => {
    intents.incrementIfOdd.next()
  })

  document.querySelector("#incrementAsync").addEventListener("click", () => {
    setTimeout(() => intents.increment.next(), 500)
  })
}

// Run
let root = document.querySelector("#root")
state.subscribe(state => {
  root.innerHTML = App(state)
  bindEvents()
})

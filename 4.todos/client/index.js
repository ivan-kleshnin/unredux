import {Component} from "react"
import connect from "./connect"

// Helpers
let lensify = (lens) => {
  if (lens instanceof Array) {
    lens = lens.reduce(
      (z, s) => R.compose(z, typeof s == "number" ? R.lensIndex(s) : R.lensProp(s)),
      R.id,
      lens
    )
  }
  return lens
}

R.viewX = R.curry((lens, obj) => R.view(lensify(lens), obj))
R.setX = R.curry((lens, val, obj) => R.set(lensify(lens), val, obj))
R.overX = R.curry((lens, fn, obj) => R.over(lensify(lens), fn, obj))

// User intents
let intents = {
  addTodo: new Subject(),
  toggleTodo: new Subject(),
  setFilter: new Subject(),
}

// State actions
let stateCycle = new ReplaySubject(1)

let actions = {
  addTodo: intents.addTodo.withLatestFrom(stateCycle, (text, state) => {
    return (state) => {
      let id = String(Object.values(state.todos).length + 1)
      return R.assocPath(["todos", id], {
        id,
        text,
        completed: false,
        addedAt: new Date().toISOString(),
      }, state)
    }
  }),

  toggleTodo: intents.toggleTodo.map(id => R.overX(["todos", id, "completed"], x => !x)),

  setFilter: intents.setFilter.map(filter => R.assoc("filter", filter)),
}

// State stream
let initialState = {
  todos: { // it's easier to have an object of models than an array of them, in general
    "1": {
      id: "1",
      text: "Write a TODO",
      completed: false,
      addedAt: new Date().toISOString(),
    }
  },
  filter: "all",
}

let state = Observable.merge(
  actions.addTodo,
  actions.toggleTodo,
  actions.setFilter,
)
 .startWith(initialState)
 .scan((state, fn) => fn(state))
 .do(state => {
   console.log("state spy:", state)
   stateCycle.next(state)
 })
 .distinctUntilChanged()
 .shareReplay(1)

// Derived state should act like normal (instead of some memoized shit), so you can
// depend on it in actions (unlike so in Redux!)
let filteredTodos = state.map((state) => {
  switch (state.filter) {
    case "all":
      return Object.values(state.todos)
    case "completed":
      return R.sortBy(t => t.addedAt, R.filter(t => t.completed, Object.values(state.todos)))
    case "active":
      return R.sortBy(t => t.addedAt, R.filter(t => !t.completed, Object.values(state.todos)))
    default:
      throw Error("Unknown filter: " + state.filter)
  }
})

// Rendering & Events
let AddTodo = (props) => {
  let input
  return <div>
    <form onSubmit={e => {
      e.preventDefault()
      if (!input.value.trim()) {
        return
      }
      intents.addTodo.next(input.value)
      input.value = ""
    }}>
      <input ref={node => {
        input = node
      }} />
      <button type="submit">
        Add Todo
      </button>
    </form>
  </div>
}

let TodoItem = (props) =>
  <li
    onClick={() => intents.toggleTodo.next(props.todo.id)}
    style={{textDecoration: props.todo.completed ? "line-through" : "none"}}
  >
    {props.todo.text}
  </li>

let TodoList = connect(
  {todos: filteredTodos},
  (props) =>
    <ul>
      {props.todos.map(todo =>
        <TodoItem key={todo.id} todo={todo}/>
      )}
    </ul>
)

let Footer = (props) =>
  <p>
    Show:
    {" "}
    <a onClick={() => intents.setFilter.next("all")}>
      All
    </a>
    {", "}
    <a onClick={() => intents.setFilter.next("active")}>
      Active
    </a>
    {", "}
    <a onClick={() => intents.setFilter.next("completed")}>
      Completed
    </a>
  </p>

let App = (props) =>
  <div>
    <AddTodo/>
    <TodoList/>
    <Footer/>
  </div>

ReactDOM.render(<App/>, document.getElementById("root"))

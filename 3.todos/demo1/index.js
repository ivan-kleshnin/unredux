import {Component} from "react"
import chan from "./chan"
import connect from "./connect"

// Actions =========================================================================================
let actions = {
  addTodo: chan(text => state => {
    let id = String(Object.values(state.todos).length + 1)
    return R.setL(["todos", id], {
      id,
      text,
      completed: false,
      addedAt: new Date().toISOString(),
    }, state)
  }),

  toggleTodo: chan(id => R.overL(["todos", id, "completed"], x => !x)),

  setFilter: chan(filter => R.setL(["filter"], filter)),
}

// State ===========================================================================================
let initialState = {
  todos: { // it's more convenient to have an object of models than an array of them, in general
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
 .distinctUntilChanged(R.equals)
 .do(s => {
   console.log("state:", s)
 })
 .shareReplay(1)

// Derived state should act like normal (instead of some memoized shit), so you can
// depend on it in actions (unlike so in Redux!)
let derived = {
  filteredTodos: state.map((state) => {
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
  }).distinctUntilChanged().shareReplay(1),
}

// Components ======================================================================================
let AddTodo = (props) => {
  let input
  return <div>
    <form onSubmit={e => {
      e.preventDefault()
      if (!input.value.trim()) {
        return
      }
      actions.addTodo(input.value)
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
    onClick={() => actions.toggleTodo(props.todo.id)}
    style={{textDecoration: props.todo.completed ? "line-through" : "none"}}
  >
    {props.todo.text}
  </li>

let TodoList = connect(
  {todos: derived.filteredTodos},
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
    <a id="all" href="#all" onClick={(e) => { e.preventDefault(); actions.setFilter("all"); }}>
      All
    </a>
    {", "}
    <a id="active" href="#active" onClick={(e) => { e.preventDefault(); actions.setFilter("active"); }}>
      Active
    </a>
    {", "}
    <a id="completed" href="#completed" onClick={(e) => { e.preventDefault(); actions.setFilter("completed"); }}>
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
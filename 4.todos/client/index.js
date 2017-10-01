import {Component} from "react"
import connect from "./connect"

let stateCycle = new ReplaySubject(1)

// User intents
let intents = {
  addTodo: new Subject(),
  setFilter: new Subject(),
}

// State actions
let actions = {
  addTodo: intents.addTodo.withLatestFrom(stateCycle, (text, state) => {
    return (state) => {
      return R.assoc("todos", R.append({
        id: state.todos.length + 1, // try to do that at Redux :)
        completed: false,
        text,
      }, state.todos), state)
    }
  }),

  setFilter: intents.setFilter.map((filter) => (state) => {
    return R.assoc("filter", filter, state)
  }),
}

// State stream
let initialState = {
  todos: [{
    id: "1",
    text: "Write a TODO",
    completed: false,
  }],
  filter: "all",
}

let state = Observable.merge(
  actions.addTodo,
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

// Derived state IS state (not some memoized shit), so you can
// depend on it actions (unlike so in Redux!)
let visibleTodos = state.map((state) => {
  switch (state.filter) {
    case "all":
      return state.todos
    case "completed":
      return state.todos.filter(t => t.completed)
    case "active":
      return state.todos.filter(t => !t.completed)
    default:
      throw Error("Unknown filter: " + filter)
  }
})

// Rendering & Events
function AddTodo(props) {
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

function TodoItem(props) {
  return <li
    onClick={() => intents.toggleTodo.next(props.todo.id)}
    style={{textDecoration: props.todo.completed ? "line-through" : "none"}}
  >
    {props.todo.text}
  </li>
}

let TodoList = connect(
  {state: state},
  (props) =>
    <ul>
      {props.state.todos.map(todo =>
        <TodoItem key={todo.id} todo={todo}/>
      )}
    </ul>
)

function Footer(props) {
  return <p>
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
}

function App(props) {
  return <div>
    <AddTodo/>
    <TodoList/>
    <Footer/>
  </div>
}

ReactDOM.render(<App/>, document.getElementById("root"))

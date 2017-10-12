import {Component} from "react"
import {chan} from "./chan"
import connect from "./connect"
import {historyStore, derive} from "./store"

// Actions =========================================================================================
let actions = {
  addTodo: chan($ => $
    .map(text => state => {
      let id = String(Object.values(state.todos).length + 1)
      return R.setL(["todos", id], {
        id,
        text,
        completed: false,
        addedAt: new Date().toISOString(),
      }, state)
    })
  ),

  toggleTodo: chan($ => $
    .map(id => R.overL(["todos", id, "completed"], x => !x))
  ),

  setFilter: chan($ => $
    .map(filter => R.setL(["filter"], filter))
  ),
}

let canUndo = (state) =>
  state.i > Math.max(0, R.findIndex(R.id, state.log))

let canRedo = (state) =>
  state.i < state.log.length - 1

let historyActions = {
  undo: chan($ => $.map(() => state =>
    R.overL(["i"], (i) => canUndo(state) ? i - 1 : i, state)
  )),

  redo: chan($ => $.map(() => state =>
    R.overL(["i"], (i) => canRedo(state) ? i + 1 : i, state)
  )),
}

// State ===========================================================================================
let initialState = {
  todos: {
    "1": {
      id: "1",
      text: "Write a TODO",
      completed: false,
      addedAt: new Date().toISOString(),
    }
  },
  filter: "all",
}

let state = historyStore(initialState, actions, historyActions, {
  length: 3,
  doFn: (s) => console.log("state:", s),
})

let derived = {
  filteredTodos: derive(state, (state) => {
    switch (state.filter) {
      case "all":
        return Object.values(state.todos)
      case "completed":
        return R.sort(R.ascend(R.prop("addedAt")), R.filter(t => t.completed, Object.values(state.todos)))
      case "active":
        return R.sort(R.ascend(R.prop("addedAt")), R.filter(t => !t.completed, Object.values(state.todos)))
      default:
        throw Error("Unknown filter: " + state.filter)
    }
  }),
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

let UndoRedo = (props) =>
  <div>
    <button onClick={() => historyActions.undo()}>Undo</button>
    {" "}
    <button onClick={() => historyActions.redo()}>Redo</button>
  </div>

let App = (props) =>
  <div>
    <AddTodo/>
    <TodoList/>
    <Footer/>
    <UndoRedo/>
  </div>

ReactDOM.render(<App/>, document.getElementById("root"))

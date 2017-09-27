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

import connect from "./connect"

// Helpers
let isOdd = (d) => d % 2

// App =============================================================================================
let stateCycle = new Subject()

// INTENTS
let intents = {
  addTodo: new Subject(),
  // decrement: new Subject(),
  // incrementIfOdd: new Subject(),
}

// ACTIONS
let actions = {
  addTodo: intents.addTodo.withLatestFrom(stateCycle, (text, state) => {
    return (state) => {
      return R.assoc("todos", R.append({
        id: state.todos.length + 1, // try to do that at Redux :)
        completed: false,
        text,
      }, state.todos), state)
    }
  })
}

// STATE
let initialState = {
  todos: [],
  visibilityFilter: "all",
}

let state = Observable.merge(
  actions.addTodo,
  // actions.decrement
)
 .startWith(initialState)
 .scan((state, fn) => fn(state))
 .distinctUntilChanged()
 .shareReplay(1)
 .do((state) => {
   stateCycle.next(state)
 })

// Derive state IS state (not some memoized shit), so you can
// depend on it actions (unlike so in Redux!)
let visibleTodos = state.map((state) => {
  switch (state.visibilityFilter) {
    case 'all':
      return state.todos
    case 'completed':
      return state.todos.filter(t => t.completed)
    case 'active':
      return state.todos.filter(t => !t.completed)
    default:
      throw Error('Unknown filter: ' + filter)
  }
})

// COMPONENTS
function AddTodo(props) {
  let input
  return <div>
    <form onSubmit={e => {
      e.preventDefault()
      if (!input.value.trim()) {
        return
      }
      intents.addTodo.next(input.value)
      input.value = ''
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

function _TodoList(props) {
  return <ul>
    {props.todos.map(todo =>
      <TodoItem key={todo.id} todo={todo}/>
    )}
  </ul>
}

let TodoList = connect({todos: state.pluck("todos")}, _TodoList)

function TodoItem(props) {
  return <li
    onClick={() => intents.toggleTodo.next(props.todo.id)}
    style={{textDecoration: props.todo.completed ? "line-through" : "none"}}
  >
    {props.todo.text}
  </li>
}

function Footer(props) {
  return <div>== Footer ==</div>
  //   <p>
  //   Show:
  //   {" "}
  //   <a onClick={() => intents.setFilter.next("all")}>
  //     All
  //   </a>
  //   {", "}
  //   <a onClick={() => intents.setFilter.next("active")}>
  //     Active
  //   </a>
  //   {", "}
  //   <a onClick={() => intents.setFilter.next("completed")}>
  //     Completed
  //   </a>
  // </p>
}

class App extends Component {
  render() {
    return <div>
      <AddTodo/>
      <TodoList/>
      <Footer/>
    </div>
  }
}

export default connect({counter: state.map(s => s.counter)}, App)

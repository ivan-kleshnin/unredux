import R from "ramda"
import {Observable} from "rxjs/Observable"
import {Subject} from "rxjs/Subject"
import {ReplaySubject} from "rxjs/ReplaySubject"

// Import RxJS Observable functions
import "rxjs/add/observable/combineLatest"
import "rxjs/add/observable/merge"

// Import RxJS Observable methods
import "rxjs/add/operator/distinctUntilChanged"
import "rxjs/add/operator/map"
import "rxjs/add/operator/scan"
import "rxjs/add/operator/shareReplay"
import "rxjs/add/operator/withLatestFrom"

import React, {Component} from "react"

import connect from "./connect"

// App =============================================================================================
let stateCycle = new ReplaySubject(1)

// INTENTS
let intents = {
  addTodo: new Subject(),
  setFilter: new Subject(),
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
  }),

  setFilter: intents.setFilter.map((filter) => (state) => {
    return R.assoc("filter", filter, state)
  }),
}

// STATE
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

// Derive state IS state (not some memoized shit), so you can
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

let TodoList = connect(
  {state: state},
  (props) =>
    <ul>
      {props.state.todos.map(todo =>
        <TodoItem key={todo.id} todo={todo}/>
      )}
    </ul>
)

function TodoItem(props) {
  return <li
    onClick={() => intents.toggleTodo.next(props.todo.id)}
    style={{textDecoration: props.todo.completed ? "line-through" : "none"}}
  >
    {props.todo.text}
  </li>
}

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

export default (props) =>
  <div>
    <AddTodo/>
    <TodoList/>
    <Footer/>
  </div>

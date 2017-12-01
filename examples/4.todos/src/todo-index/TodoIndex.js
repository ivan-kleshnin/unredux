import React from "react"
import PT from "prop-types"
import TodoItem from "./TodoItem"
import Footer from "./Footer"

export default function TodoIndex({todos}) {
  return <div>
    <ul>
      {todos.map(todo =>
        <TodoItem key={todo.id} todo={todo}/>
      )}
    </ul>
    <Footer/>
  </div>
}

TodoIndex.propTypes = {
  todos: PT.arrayOf(TodoItem.propTypes.todo).isRequired,
}


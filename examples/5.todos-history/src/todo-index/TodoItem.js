import React from "react"
import PT from "prop-types"

export default function TodoItem({todo}) {
  return <li data-key="item"
             data-val={todo.id}
             style={{textDecoration: todo.completed ? "line-through" : "none"}}>
    {todo.text}
  </li>
}

TodoItem.propTypes = {
  todo: PT.object.isRequired,
}

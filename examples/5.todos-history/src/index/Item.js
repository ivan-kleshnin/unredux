import React from "react"
import PT from "prop-types"

export default function Item(props) {
  return <li data-key="item"
             data-val={props.todo.id}
             style={{textDecoration: props.todo.completed ? "line-through" : "none"}}>
    {props.todo.text}
  </li>
}

Item.propTypes = {
  todo: PT.object.isRequired,
}

import React from "react"
import PT from "prop-types"
import Item from "./Item"
import Footer from "./Footer"

export default function Index(props) {
  return <div>
    <ul>
      {props.todos.map(todo =>
        <Item key={todo.id} todo={todo}/>
      )}
    </ul>
    <Footer/>
  </div>
}

Index.propTypes = {
  todos: PT.arrayOf(Item.propTypes.todo).isRequired,
}


import React from "react"
import PT from "prop-types"

export default function TodoForm({todo}) {
  return <form>
    <input name="text" value={todo.text}/>
    {" "}
    <button type="submit">Add Todo</button>
  </form>
}

TodoForm.propTypes = {
  todo: PT.object.isRequired,
}

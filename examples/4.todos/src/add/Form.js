import React from "react"
import PT from "prop-types"

export default function Form(props) {
  return <form>
    <input name="text" value={props.text}/>
    {" "}
    <button type="submit">Add Todo</button>
  </form>
}

Form.propTypes = {
  text: PT.string.isRequired,
}

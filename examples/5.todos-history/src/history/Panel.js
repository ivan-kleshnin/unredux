import React from "react"

export default function Panel(props) {
  return <div>
    <button data-key="undo">Undo</button>
    {" "}
    <button data-key="redo">Redo</button>
  </div>
}

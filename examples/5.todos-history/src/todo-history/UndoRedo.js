import React from "react"
import PT from "prop-types"

export default function UndoRedo({canUndo, canRedo}) {
  return <div>
    <button data-key="undo" disabled={canUndo ? null : true}>Undo</button>
    {" "}
    <button data-key="redo" disabled={canRedo ? null : true}>Redo</button>
  </div>
}

UndoRedo.propTypes = {
  canUndo: PT.bool.isRequired,
  canUndo: PT.bool.isRequired,
}

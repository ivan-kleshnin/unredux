import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import UndoRedo from "./UndoRedo"

export default (sources, key) => {
  let intents = {
    undo$: sources.DOM.fromKey("undo").listen("click").mapTo(true),
    redo$: sources.DOM.fromKey("redo").listen("click").mapTo(true),
  }

  let action$ = O.merge(
    intents.undo$.map(_ => D.undo),
    intents.redo$.map(_ => D.redo),
  )

  let Component = F.connect(
    {
      canUndo: sources.state$.map(s => s._flags.canUndo),
      canRedo: sources.state$.map(s => s._flags.canRedo),
    },
    (props) =>
      <UndoRedo {...props}/>
  )

  return {action$, Component}
}

import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import UndoRedo from "./UndoRedo"

export default (sources, key) => {
  let intents = {
    undo$: sources.DOM.fromKey("undo").listen("click").map(R.always(true)),
    redo$: sources.DOM.fromKey("redo").listen("click").map(R.always(true)),
  }

  let action$ = K.merge([
    intents.undo$.map(_ => D.undo),
    intents.redo$.map(_ => D.redo),
  ])

  let Component = F.connect(
    {
      canUndo: sources.state$.map(s => s._flags.canUndo),
      canRedo: sources.state$.map(s => s._flags.canRedo),
    },
    UndoRedo
  )

  return {action$, Component}
}

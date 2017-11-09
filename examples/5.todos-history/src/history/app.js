import {Observable as O} from "rxjs"
import * as D from "selfdb"
import Panel from "./Panel"

export default (sources, key) => {
  let intents = {
    undo$: sources.DOM.fromKey("undo").listen("click").mapTo(true),
    redo$: sources.DOM.fromKey("redo").listen("click").mapTo(true),
  }

  let action$ = O.merge(
    intents.undo$.map(_ => D.undo),
    intents.redo$.map(_ => D.redo),
  )

  let Component = Panel

  return {action$, Component}
}

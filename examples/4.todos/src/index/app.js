import * as R from "ramda"
import {Observable as O} from "rxjs"
import * as D from "selfdb"
import * as F from "framework"
import * as M from "../models"
import Index from "./Index"

export default (sources, key) => {
  let intents = {
    toggleTodo$: sources.DOM.fromKey("item").listen("click")
      .map(event => event.target.dataset.val),

    setFilter$: sources.DOM.fromKey("filter").listen("click")
      .do(event => event.preventDefault())
      .map(event => event.target.dataset.val),

    reset$: sources.DOM.fromKey("reset").listen("click")
      .do(event => event.preventDefault())
      .mapTo(true),
  }

  let state$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    D.withLog({key}),
  )(O.merge(
    D.init(M.makeIndex()),

    // Updates
    intents.setFilter$.map(filter => {
      let filterFn = R.id
      if (filter == "completed") {
        filterFn = M.isCompleted
      } else if (filter == "active") {
        filterFn = M.isActive
      }
      return R.set("filterFn", filterFn)
    }),
  )).$

  let todos$ = F.derive(
    {index: state$, todos: sources.state$.pluck("todos")},
    ({index, todos}) => {
      return R.pipe(
        R.values,
        R.filter(index.filterFn),
        R.sort(index.sortFn),
      )(todos)
    }
  )

  let action$ = O.merge(
    intents.toggleTodo$.map(id => R.over(["todos", id, "completed"], R.not)),
    intents.reset$.map(_ => R.fn("reset", () => M.makeRoot())),
  )

  let Component = F.connect(
    {todos: todos$},
    Index,
  )

  return {action$, Component}
}

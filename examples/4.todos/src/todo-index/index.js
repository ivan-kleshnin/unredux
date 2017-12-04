import * as F from "framework"
import K from "kefir"
import * as R from "ramda"
import {Observable as O} from "rxjs"
import * as D from "selfdb"
import * as M from "../models"
import TodoIndex from "./TodoIndex"

export let seed = {
  filterFn: R.id,
  sortFn: R.fn("sortByAddedAt", R.ascend(R.prop("addedAt"))),
}

export default (sources, key) => {
  let intents = {
    toggleTodo$: sources.DOM.fromKey("item").listen("click")
      .map(ee => ee.element.dataset.val),

    setFilter$: sources.DOM.fromKey("filter").listen("click")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(ee => ee.element.dataset.val),
  }

  let state$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    D.withLog({key}),
  )(
    D.init(seed),

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
  ).$

  let todos$ = D.derive(
    {
      todos: sources.state$.map(s => s.todos),
      index: state$,
    },
    ({index, todos}) => {
      return R.pipe(
        R.values,
        R.filter(index.filterFn),
        R.sort(index.sortFn),
      )(todos)
    }
  )

  let action$ = K.merge([
    intents.toggleTodo$.map(id => R.over(["todos", id, "completed"], R.not)),
  ])

  let Component = F.connect(
    {todos: todos$},
    TodoIndex,
  )

  return {action$, Component}
}

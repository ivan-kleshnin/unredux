import {connect, deriveObj} from "vendors/framework"
import K from "kefir"
import * as D from "kefir.db"
import {isCompleted, isActive} from "../models"
import TodoIndex from "./TodoIndex"

export let seed = {
  filterFn: R.id,
  sortFn: R.ascend(R.prop("addedAt")),
}

export default (sources, {key}) => {
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
    intents.setFilter$.map(filter => function setFilter(state) {
      let filterFn = R.id
      if (filter == "completed") {
        filterFn = isCompleted
      } else if (filter == "active") {
        filterFn = isActive
      }
      return R.set2("filterFn", filterFn, state)
    }),
  ).$

  let todos$ = deriveObj(
    {
      index: state$,
      todos: sources.state$.map(s => s.todos),
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
    intents.toggleTodo$.map(id => function toggleTodo(state) {
      return R.over2(["todos", id, "completed"], R.not, state)
    }),
  ])

  let Component = connect(
    {todos: todos$},
    TodoIndex,
  )

  return {action$, Component}
}

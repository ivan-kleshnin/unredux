import * as R from "ramda"
import {Observable as O} from "rxjs"
import * as D from "selfdb"
import * as F from "framework"
import Index from "./Index"

export default (sources, key) => {
  let intents = {
    toggleTodo$: sources.DOM.fromKey("item").listen("click")
      .map(event => event.target.dataset.val),

    setFilter$: sources.DOM.fromKey("filter").listen("click")
      .do(event => event.preventDefault())
      .map(event => event.target.dataset.val),
  }

  let seed = {
    filterFn: R.id,
    sortFn: R.fn("sortByAddedAt", R.ascend(R.prop("addedAt"))),
  }

  let state$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    D.withLog({name: key}),
  )(O.merge(
    F.init(seed),

    // Updates
    intents.setFilter$.map(filter => {
      let filterFn
      switch (filter) {
        case "completed":
          filterFn = function filterCompleted(t) { return t.completed }
          break
        case "active":
          filterFn = function filterActive(t) { return !t.completed }
          break
        default:
          filterFn = R.id
      }
      return R.set("filterFn", filterFn)
    }),
  )).$

  let todos$ = state$.combineLatest(sources.$.pluck("todos"), (index, todos) => {
    return R.pipe(
      R.values,
      R.filter(index.filterFn),
      R.sort(index.sortFn),
    )(todos)
  }).publishReplay(1).refCount()

  let $ = O.merge(
    intents.toggleTodo$.map(id => R.over(["todos", id, "completed"], R.not)),
  )

  let DOM = F.connect(
    {todos: todos$},
    Index,
  )

  return {$, DOM}
}

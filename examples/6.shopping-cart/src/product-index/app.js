import * as R from "ramda"
import {Observable as O} from "rxjs"
import * as D from "selfdb"
import React from "react"
import * as F from "framework"
import ProductIndex from "./ProductIndex"

export let seed = {
  filterFn: R.id,
  sortFn: R.ascend(R.prop("id")),
}

export default (sources, key) => {
  let intents = {
    buy$: sources.DOM.fromKey("productIndex").fromKey("buy").listen("click")
      .map(event => event.target.dataset.val),
  }

  let action$ = O.merge(
    intents.buy$.map(id => function buy(state) {
      if (id in state.cartPicks) {
        return R.over(["cartPicks", id], R.inc, state)
      } else {
        return R.set(["cartPicks", id], 1, state)
      }
    })
  )

  let index$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    D.withLog({key}),
  )(
    D.init(seed),
  ).$

  let products$ = F.derive(
    {
      table: sources.state$.pluck("products"),
      index: index$,
    },
    ({table, index}) => {
      // Implies the case when all products are preloaded or loaded at once,
      // or when the customer can tolerate reordering of upcoming items.
      return R.pipe(
        R.values,
        R.filter(index.filterFn),
        R.sort(index.sortFn),
      )(table)
    }
  )

  let Component = F.connect(
    {
      products: products$,
      cartPicks: sources.state$.pluck("cartPicks"),
    },
    ProductIndex,
  )

  return {action$, Component}
}

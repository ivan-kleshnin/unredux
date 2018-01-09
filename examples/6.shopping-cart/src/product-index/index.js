import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import ProductIndex from "./ProductIndex"

export let seed = {
  filterFn: R.id,
  sortFn: R.ascend(R.prop("id")),
}

export default (sources, key) => {
  let intents = {
    buy$: sources.DOM.fromKey("productIndex").fromKey("buy").listen("click")
      .map(ee => ee.element.dataset.val),
  }

  let index$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    D.withLog({key}),
  )(
    D.init(seed),
  ).$

  let products$ = D.derive(
    {
      products: sources.state$.map(s => s.products),
      index: index$,
    },
    ({products, index}) => {
      // Implies the case when all products are preloaded or loaded at once,
      // or when the customer can tolerate reordering of upcoming items.
      return R.pipe(
        R.values,
        R.filter(index.filterFn),
        R.sort(index.sortFn),
      )(products)
    }
  )

  let action$ = K.merge([
    intents.buy$.map(id => function buy(state) {
      if (id in state.cartPicks) {
        return R.over2(["cartPicks", id], R.inc, state)
      } else {
        return R.set2(["cartPicks", id], 1, state)
      }
    })
  ])

  let Component = F.connect(
    {
      products: products$,
      cartPicks: sources.state$.map(s => s.cartPicks),
    },
    ProductIndex,
  )

  return {action$, Component}
}

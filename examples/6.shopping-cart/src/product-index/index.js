import {connect, deriveObj} from "vendors/framework"
import K from "kefir"
import * as D from "kefir.db"
import ProductIndex from "./ProductIndex"

export let seed = {
  filterFn: R.id,
  sortFn: R.ascend(R.prop("id")),
}

export default (sources, {key}) => {
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

  let products$ = deriveObj(
    {
      index: index$,
      products: sources.state$.map(s => s.products),
    },
    ({index, products}) => {
      // Implies the case when all products are preloaded or loaded at once,
      // or when a customer can tolerate reordering of upcoming items.
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

  let Component = connect(
    {
      products: products$,
      cartPicks: sources.state$.map(s => s.cartPicks),
    },
    ProductIndex,
  )

  return {action$, Component}
}

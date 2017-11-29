import * as R from "ramda"
import {Observable as O} from "rxjs"
import * as D from "selfdb"
import React from "react"
import * as F from "framework"
import RR from "r2"
import productIndexApp from "../product-index/app"
import CartIndex from "./CartIndex"

export let seed = {
  // DB
  products: {},

  // Cart
  cartPicks: {},
  cartFilterFn: R.id,
  cartSortFn: R.ascend(R.prop("title")),
}

export default (sources, key) => {
  let intents = {
    cartInc$: sources.DOM.fromKey("cart").fromKey("inc").listen("click")
      .map(R.view(["element", "dataset", "val"])),

    cartDec$: sources.DOM.fromKey("cart").fromKey("dec").listen("click")
      .map(R.view(["element", "dataset", "val"])),

    cartCheckout$: sources.DOM.fromKey("cart").fromKey("checkout").listen("click")
      .mapTo(true),
  }

  let indexSinks = productIndexApp(sources, key + ".index")

  let state$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    D.withLog({key}),
  )(
    // Init
    D.init(seed),

    O.fromPromise(RR("./products.json").json)
      .map(products => function afterFetchProducts(state) {
        return R.set("products", products, state)
      }),

    // Cart actions
    intents.cartInc$.map(id => function cartInc(state) {
      if (state.products[id].inventory > state.cartPicks[id]) {
        return R.over(["cartPicks", id], R.inc, state)
      } else {
        return state
      }
    }),

    intents.cartDec$.map(id => function cartDec(state) {
      if (state.cartPicks[id] > 0) {
        return R.over(["cartPicks", id], R.dec, state)
      } else {
        return state
      }
    }),

    intents.cartCheckout$.map(_ => function checkout(state) {
      return R.pipe(
        R.over("products", (products) => {
          return R.map(product => {
            if (product.id in state.cartPicks) {
              let n = state.cartPicks[product.id]
              return R.over("inventory", R.flip(R.subtract)(n), product)
            } else {
              return product
            }
          }, products)
        }),
        R.set("cartPicks", {}),
      )(state)
    }),

    // Product-index actions
    indexSinks.action$,
  ).$

  let cart$ = state$.map(state => {
    let products = R.pipe(
      R.pick(R.keys(state.cartPicks)),
      R.values,
      R.filter(state.cartFilterFn),
      R.sort(state.cartSortFn),
    )(state.products)
    let picks = state.cartPicks
    return {products, picks}
  })

  let Cart = F.connect({cart: cart$}, CartIndex)

  let Component = () =>
    <div>
      <Cart/>
      <hr/>
      <indexSinks.Component/>
    </div>

  return {state$, Component}
}

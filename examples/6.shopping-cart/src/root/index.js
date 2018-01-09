import * as R from "@paqmind/ramda"
import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import productIndex from "../product-index"
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
      .map(ee => ee.element.dataset.val),

    cartDec$: sources.DOM.fromKey("cart").fromKey("dec").listen("click")
      .map(ee => ee.element.dataset.val),

    cartCheckout$: sources.DOM.fromKey("cart").fromKey("checkout").listen("click")
      .map(R.always(true)),
  }

  let indexSinks = productIndex(sources, key + ".index")

  let state$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    D.withLog({key}),
  )(
    // Init
    D.init(seed),

    K.fromPromise(A.get("./products.json"))
      .map(resp => resp.data)
      .mapErrors(err => {
        console.warn(err) // TODO
        return K.never()
      })
      .map(products => function afterFetchProducts(state) {
        return R.set2("products", products, state)
      }),

    // Cart actions
    intents.cartInc$.map(id => function cartInc(state) {
      if (state.products[id].inventory > state.cartPicks[id]) {
        return R.over2(["cartPicks", id], R.inc, state)
      } else {
        return state
      }
    }),

    intents.cartDec$.map(id => function cartDec(state) {
      if (state.cartPicks[id] > 0) {
        return R.over2(["cartPicks", id], R.dec, state)
      } else {
        return state
      }
    }),

    intents.cartCheckout$.map(_ => function checkout(state) {
      return R.pipe(
        R.over2("products", (products) => {
          return R.map(product => {
            if (product.id in state.cartPicks) {
              let n = state.cartPicks[product.id]
              return R.over2("inventory", R.flip(R.subtract)(n), product)
            } else {
              return product
            }
          }, products)
        }),
        R.set2("cartPicks", {}),
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

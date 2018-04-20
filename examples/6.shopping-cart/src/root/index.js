import A from "axios"
import {connect} from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import productIndex from "../product-index"
import CartIndex from "./CartIndex"

// SEED
export let seed = {
  // DB
  products: {},

  // Cart
  cartPicks: {},
  cartFilterFn: R.id,
  cartSortFn: R.ascend(R.prop("title")),
}

export default (sources, {key}) => {
  // INTENTS
  let intents = {
    cartInc$: sources.DOM.fromKey("cart").fromKey("inc").listen("click")
      .map(ee => ee.element.dataset.val),

    cartDec$: sources.DOM.fromKey("cart").fromKey("dec").listen("click")
      .map(ee => ee.element.dataset.val),

    cartCheckout$: sources.DOM.fromKey("cart").fromKey("checkout").listen("click")
      .map(R.always(true)),
  }

  let indexSinks = productIndex(sources, {key: key + ".index"})

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(seed),

    K.fromPromise(
      A.get("./products.json")
        .then(resp => resp.data)
        .catch(R.id)
    )
      .map(maybeData => function afterFetchProducts(state) {
        return maybeData instanceof Error
          ? state
          : R.set2("products", maybeData, state)
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

  let Cart = connect({cart: cart$}, CartIndex)

  // COMPONENT
  let Component = () =>
    <div>
      <Cart/>
      <hr/>
      <indexSinks.Component/>
    </div>

  return {state$, Component}
}

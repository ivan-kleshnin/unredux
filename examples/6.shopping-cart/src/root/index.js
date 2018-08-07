import {connect, isolateDOM} from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {fetchJSON} from "../helpers"
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

  let indexSinks = isolateDOM(productIndex, "index")(sources, {})

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(seed),

    // Data load
    K.stream(async (emitter) => {
      let reqResult = await fetchJSON("./products.json")
      if (reqResult instanceof Error) {
        console.warn(dataOrError.message) // Set your custom alerts here
        // if (maybeData.errors) {
        //   console.warn(maybeData.errors)
        // }
        return emitter.end()
      }

      let data = reqResult
      emitter.value(function afterFetch(state) {
        return R.set2("products", data, state)
      })
      emitter.end()
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

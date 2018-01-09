import * as R from "@paqmind/ramda"
import React from "react"
import PT from "prop-types"
import CartItem from "./CartItem"

export default function CartIndex({cart}) {
  return <div data-key="cart">
    <h3>Your Cart</h3>
    <div>
      {cart.products.length
        ? cart.products.map(product =>
            <CartItem key={product.id} product={product} quantity={cart.picks[product.id] || 0}/>
          )
        : <p><i>Add some products to the cart.</i></p>}
    </div>
    <div>
      Total: ${countTotal(arrToObj(cart.products), cart.picks)}
      {" "}
      <button data-key="checkout" disabled={!cart.products.length ? true : null}>Checkout</button>
    </div>
  </div>
}

CartIndex.propTypes = {
  cart: PT.shape({
    products: PT.arrayOf(CartItem.propTypes.product).isRequired,
    picks: PT.objectOf(PT.number).isRequired,
  }),
}

let arrToObj = R.pipe(R.map(m => ([m.id, m])), R.fromPairs)

let countTotal = (products, picks) => {
  return R.reduce((sum, [id, quantity]) => {
    return sum + (products[id].price * quantity)
  }, 0, R.toPairs(picks))
}

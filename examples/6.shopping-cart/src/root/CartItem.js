import * as R from "@paqmind/ramda"
import React from "react"
import PT from "prop-types"

export default function CartItem({product, quantity}) {
  let left = product.inventory - quantity
  return <p>
    <span style={{textDecoration: quantity ? "none" : "line-through"}}>
      {product.title} - &#36;{product.price} &times; {quantity}
    </span>
    {" "}
    <button data-key="inc" data-val={product.id} disabled={!left ? true : null}>
      +1
    </button>
    {" "}
    <button data-key="dec" data-val={product.id} disabled={!quantity ? true : null}>
      -1
    </button>
    {" "}
    ({left} in stock)
  </p>
}

// TODO replace with Tcomb types?! (tcomb-to-proptypes library is available)
CartItem.propTypes = {
  product: PT.shape({
    title: PT.string.isRequired,
    price: PT.number.isRequired,
    inventory: PT.number.isRequired
  }),
  quantity: PT.number.isRequired,
}

import React from "react"
import PT from "prop-types"

export default function ProductItem({product, cartQuantity}) {
  let left = product.inventory - cartQuantity
  return <p>
    {product.title} - &#36;{product.price}
    {" "}
    <button data-key="buy" data-val={product.id} disabled={!left ? true : null}>
      Buy
    </button>
    {" "}
    ({cartQuantity} selected, {left} in stock)
  </p>
}

ProductItem.propTypes = {
  product: PT.shape({
    title: PT.string.isRequired,
    price: PT.number.isRequired,
    inventory: PT.number.isRequired
  }),
  cartQuantity: PT.number.isRequired,
}

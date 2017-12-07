import React from "react"
import PT from "prop-types"
import ProductItem from "./ProductItem"

export default function ProductIndex({products, cartPicks}) {
  return <div data-key="productIndex">
    <h3>Products</h3>
    <div>
      {products.length
        ? products.map(product =>
          <ProductItem key={product.id} product={product} cartQuantity={cartPicks[product.id] || 0}/>
        )
        : <p><i>No products available.</i></p>
      }
    </div>
  </div>
}

ProductIndex.propTypes = {
  products: PT.arrayOf(ProductItem.propTypes.product).isRequired,
  cartPicks: PT.objectOf(PT.number).isRequired,
}


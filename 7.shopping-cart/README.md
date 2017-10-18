## Review some Redux shit

https://github.com/reactjs/redux/tree/master/examples/shopping-cart

### Gist #1

How many redux you need to <strike>change a light bulb</strike> implement a text-row div? Let's see:

```js
// Product.js
import React from 'react'
import PropTypes from 'prop-types'

const Product = ({ price, inventory, title }) => (
  <div>
    {title} - &#36;{price}{inventory ? ` x ${inventory}` : null}
  </div>
)

Product.propTypes = {
  price: PropTypes.number,
  inventory: PropTypes.number,
  title: PropTypes.string
}

export default Product
```

```js
// Product.spec.js
import React from 'react'
import { shallow } from 'enzyme'
import Product from './Product'

const setup = props => {
  const component = shallow(
    <Product {...props} />
  )

  return {
    component: component
  }
}

describe('Product component', () => {
  it('should render title and price', () => {
    const { component } = setup({ title: 'Test Product', price: 9.99 })
    expect(component.text()).toBe('Test Product - $9.99')
  })

  describe('when given inventory', () => {
    it('should render title, price, and inventory', () => {
      const { component } = setup({ title: 'Test Product', price: 9.99, inventory: 6 })
      expect(component.text()).toBe('Test Product - $9.99 x 6')
    })
  })
})
```

13 + 23 = 36 LOC (without empty lines). This is sick, man. Now let me refactor it for you:

```js
<div>
  {product.title} - &#36;{product.price}{product.inventory ? ` x ${product.inventory}` : null}
</div>
```

End of story. Copy-pasting this lines in multiple places is not different from copy-pasting this block:

```js
<Product
  title={product.title}
  price={product.price}
  inventory={product.inventory} />
```

Well, sure the latter is a tiny bit cleaner. But by my estimations, there should be 50+ places of
`<Product.../>` in codebase to pay it back. And it never happens so often. So there's absolutely
no reason to extract such tiny components prematurely. Two freaking files are gone!

Btw. they use `<Product/>` in cart like this:

```js
<Product
  title={product.title}
  price={product.price}
  quantity={product.quantity}
  key={product.id}
/>
```

Noticed `quantity` instead of `inventory`? All the `propTypes` and tests didn't help to prevent
the bug...

### Gist #2

```js
// ProductList.js
import React from 'react'
import PropTypes from 'prop-types'

const ProductsList = ({ title, children }) => (
  <div>
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
)

ProductsList.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired
}

export default ProductsList
```

```js
import React from 'react'
import { shallow } from 'enzyme'
import ProductsList from './ProductsList'

const setup = props => {
  const component = shallow(
    <ProductsList title={props.title}>{props.children}</ProductsList>
  )

  return {
    component: component,
    children: component.children().at(1),
    h3: component.find('h3')
  }
}

describe('ProductsList component', () => {
  it('should render title', () => {
    const { h3 } = setup({ title: 'Test Products' })
    expect(h3.text()).toMatch(/^Test Products$/)
  })

  it('should render children', () => {
    const { children } = setup({ title: 'Test Products', children: 'Test Children' })
    expect(children.text()).toMatch(/^Test Children$/)
  })
})
```

Is this for real? Does Facebook pay their developers on per-line basis?
Two files, four libraries and almost 50 lines of code were used to prove that two HTML tags render
their contents... :ambulance:

### Gist #3

```js
const initialState = {
  addedIds: [],
  quantityById: {}
}
```

Make dict of `{<id>: <quantity>}`. Then make an array of the same ids. Data backups for certainty,
I guess :D

### Gist #4

Just noticed another fun thing. Let's count how many times `Product.propTypes ` is repeated:

```js
// Product.js (#1)
Product.propTypes = {
  price: PropTypes.number,
  inventory: PropTypes.number,
  title: PropTypes.string
}
```

```js
// ProductItem.js (#2)
ProductItem.propTypes = {
  product: PropTypes.shape({ // I saw that somewhere...
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    inventory: PropTypes.number.isRequired // here it's called "inventory"
  }).isRequired,
  onAddToCartClicked: PropTypes.func.isRequired
}
```

```js
// Cart.js (here they forgot to expand products...)
Cart.propTypes = {
  products: PropTypes.array,
  total: PropTypes.string,
  onCheckoutClicked: PropTypes.func
}
```

```js
// CartContainer.js (#3)
CartContainer.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({ // dejavu?
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired // here the same field is called "quantity"
  })).isRequired,
  total: PropTypes.string,
  checkout: PropTypes.func.isRequired
}
```

```js
// ProductsContainer.js (#4)
ProductsContainer.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({ // the same shit once over again :scream:
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    inventory: PropTypes.number.isRequired
  })).isRequired,
  addToCart: PropTypes.func.isRequired
}
```

"Don't repeat yourself" – you say?! Dunno what would I did to my student for writing a code like this...

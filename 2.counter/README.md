# Content

```
$ export NODE_ENV=development (for Webpack)
$ npm run demo1
$ npm run demo2
```

## Demo1

### Concepts

* React connection via state

## Demo2

### Concepts

* React connection via container component

#### `combineLatestObj`

Useful to inject props. Does not support nesting (yet).

```js
let s1 = O.of(1)
let s2 = O.of(2)
let s3 = O.of(3)

let sc = combineLatestObj({s1, s2, s3})

sc.subscribe((data) => {
  console.log(data)
})

// => {s1: 1, s2: 2, s3: 3}
```

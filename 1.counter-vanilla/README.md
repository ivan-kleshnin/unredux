# Content

```
$ export NODE_ENV=development (for Webpack)
$ npm run demo1
$ npm run demo2
```

## Demo1

### Concepts

* Subject
* ReplaySubject
* State loop
* Intents
* Actions
* State reducer
* Observable operators

## Demo2

### Concepts

* Channel

#### Channel

Channel is a callable observable (or a subscribable function). The [implementation](./demo2/chan.js)
is pretty simple as well as the usage:

```js
let c = chan($ => $.map(x => y => x * y)))

c.subscribe(fn => {
  console.log(fn(10))
})

c(1) // => 10
c(2) // => 20
c(3) // => 30
```

Which is equivalent to the following:

```js
let s = new Subject()

let o = s.map(x => y => x * y)

o.subscribe(fn => {
  console.log(fn(10))
})

s.next(1) // => 10
s.next(2) // => 20
s.next(3) // => 30
```

Now imagine that `x` is an action argument, `y` is a state and `subscribe` is a demo hack to combine
them both, and you get pretty close to our action/state implementation.

*In terms of API, such callable channels are similar to [Flyd](https://github.com/paldepind/flyd)
micro-observables. No need to know that – just a remark.*

## Advanced notes

We've chosen this API for channel, because if you try to simplify

```js
chan($ => $.map(x => y => x * y)))
```

to

```js
chan(x => y => x * y)
```

(which is possible) you get a lurking problem pretty soon.

Suppose you want to add `do(x => console.log(x))` to the action.

With our API it's:

```js
chan($ => $.map(x => y => x * y).do(x => console.log(x))
```

With "simplified" API it's:

```js
chan(x => y => x * y).do(x => console.log(x))
// does not work
```

The channel is not callable anymore because the observable returned from `do` replaced our wrapped one.
You can try to proxy calls and wrap resulting observables, as we did.

```js
export let chan = (mapFn) => {
  let subj = new Subject()
  let obs = subj.map(mapFn)
  let linkToSubj = (obj) => {
    return new Proxy(() => obj, {
      get: (target, propName, _) => {
        let obs = target()
        return (typeof obs[propName] == "function")
          ? (...args) => {
            let res = obs[propName](...args)
            return res instanceof Observable
              ? linkToSubj(res) // observable methods making a new observable now make a new proxied observable
              : res             // other observable methods behave as usual
          }
          : obs[propName]
      },
      apply: (target, _, args) => {
        subj.next(...args)
      }
    })
  }
  return linkToSubj(obs)
}
```

This works for methods but fails for static calls like `Observable.merge`. Yet another prove
that metaprogramming just doesn't "work" in the end and should be avoided.

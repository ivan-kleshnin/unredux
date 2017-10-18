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

### Channel

Consider the following code:

```js
let actions = {
  foo: (new Subject()).map(x => x),
  bar: (new Subject()).map(x => x),
}

actions.foo.subscribe(console.log)
actions.bar.subscribe(console.log)

actions.foo.next("f1")
actions.foo.next("f2")

actions.bar.next("b1")
actions.bar.next("b2")

// foo: ---f1---f2------------->
// bar: -------------b1---b2--->
```

We'd like to omit `.next` method as actions never end and never get error manually. We'd like to
do the following:

```js
actions.foo("f1")
actions.bar("b1")
```

so we have to introduce a new concept. **Channel** is a callable observable (or a subscribable function).
The implementation is pretty simple:

```js
// chan :: Observable a
// chan :: a -> ()
let chan = (letFn) => {
  let subj = new Subject()
  let obs = letFn(subj)
  function channel(...callArgs) {
    return subj.next(callArgs[0]) // callArgs[1..n] are reserved
  }
  Object.setPrototypeOf(channel, obs)
  return channel
}
```

as well as the usage:

```js
let actions = {
  foo: chan($ => $),
  bar: chan($ => $),
}

actions.foo.subscribe(console.log)
actions.bar.subscribe(console.log)

actions.foo("f1")
actions.foo("f2")

actions.bar("b1")
actions.bar("b2")

// foo: ---f1---f2------------->
// bar: -------------b1---b2--->
```

*In terms of API, such callable channels are similar to [Flyd](https://github.com/paldepind/flyd)
micro-observables. No need to know that – just a remark.*

In this project, channels are used to define actions which, in turn, represent streams of state reducers.

```js
let c = chan($ => $.map(x => y => x * y)))
// where
//   x is an action argument
//   y is a state

c.subscribe(fn => {
  console.log(fn(10))
})

c(1) // => 1 * 10 = 10
c(2) // => 2 * 10 = 20
c(3) // => 3 * 10 = 30
```

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
export let chan = (letFn) => {
  let subj = new Subject()
  let obs = subj.map(letFn)
  let linkToSubj = (obj) => {
    return new Proxy(() => obj, {
      get: (target, propName, _) => {
        let obs = target()
        return R.is(Function, obs[propName])
          ? (...args) => {
            let res = obs[propName](...args)
            return R.is(O, res)
              ? linkToSubj(res) // observable methods making a new observable now make a new proxied observable
              : res             // other observable methods behave as usual
          }
          : obs[propName]
      },
      apply: (target, _, args) => {
        if (args.length <= 1) {
          return subj.next(args[0])
        } else {
          return subj.next(args)
        }
      }
    })
  }
  return linkToSubj(obs)
}
```

This works for methods but fails for static calls like `Observable.merge`. Yet another prove
that metaprogramming just doesn't "work" in the end and should be avoided.

The possibility to use "naked" subjects like:

```js
let actions = {
  foo: (new Subject()).map(x => x),
  bar: (new Subject()).map(x => x),
}
```

seems not so bad at first. Other stream libraries may not support such API. For example, `map` will
turn the subject into a vanilla, non-nextable observable (or whatever it's called there).
Well, even RxJS surrenders pretty soon:

```js
let actions = {
  foo: chan($ => $), // entry point A
}

let actions2 = {
  foo: chan($ => O.merge($, actions.foo.map(x => x + "!"))), // entry point B, observing A
}

actions2.foo.subscribe(console.log)

actions .foo("f1") // f1!
actions2.foo("f2") // f2
```

An attempt to emulate that on subjects fails:

```js
let actions = {
  foo: new Subject(), // entry point A
}

let actions2 = {
  foo: (new Subject()).merge(actions.foo.map(x => x + "!")), // entry point B or observing A – can't be both
}

actions2.foo.subscribe(console.log)

actions .foo.next("f1") // f1!
actions2.foo.next("f2") // ___ nothing: `merge` spoiled the second subject.
```

RxJS isn't smart enough to combine both subjects above. `actions2.foo` becomes either a separate
subject or a mirror of `actions.foo`.

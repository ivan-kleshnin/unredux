# Concepts

## BaobabJS

Reimplementation of https://github.com/Yomguithereal/baobab analogy in ~100 LOC.
Inspired by https://github.com/calmm-js/kefir.atom

#### Features

* auto immutable in development
* skips duplicates (see next)
* no id rotation needed (Ramda makes all necessary shallow copies, changing the identity)
* decent argument sanity checks

#### Design notes

Molecules are much more powerful than Baobab Facets/Monkeys, because they have Proactive features:
can be updated outside of (not only by) reactive dependency.

Unlike Baobab and Kefir.Atom, we provide a single modification method `over`. Why?
Because (in the absence of reactivity), extremely important metaprogramming features like logging
are still possible with decorators. Which, obviously, are applicable only to functions.

```js
let logging = (fnObj) => {
  return R.mapObjIndexed((reduceFn, key) => {
    return (...args) => {
      let mapFn = reduceFn(...args)
      if (R.is(Function, mapFn)) {
        console.log(`@ ${key}(${JSON.stringify(args).slice(1, -1)})`)
        return mapFn
      } else {
        throw Error(`reduceFn has to produce mapFn, got ${inspect(mapFn)}`)
      }
    }
  }, fnObj)
}
```

```js
let reducers = logging({
  increment: R.over(["counter"], R.inc),
  decrement: R.over(["counter"], R.dec),
  set:       R.set(["counter"]),
}

let state = atom({counter: 0})

state.$.subscribe(s => console.log("state:", s)) // {counter: 0}

state.over(reducers.increment())) // {counter: 1}
state.over(reducers.decrement())  // {counter: 0}
state.over(reducers.set(42))      // {counter: 42}
```

Which would be impossible to achieve with an API like:

```js
state.set(["counter"], 42) // no action name, the action is obscure
state.reset(["counter"])   // no action name, the action is obscure
```

The provided solution has a trade-off as well. The partial application (`reduceFn -> mapFn`) has to
be applied at once.


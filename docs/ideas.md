# Ideas

Random, more or less developed ideas.

## Async-Await notes

Did you know that async-await awaits for nested promises transparently?

```js
;(async () => {
  let r = await Promise.resolve(Promise.resolve("hi"))
  console.log(r) // "hi", not Promise { "hi" }
                 // so no need to await (await something)
})()
```

That's kinda curios.

## Trackable actions

Can be used to build Redux-like devtool.

```js
import * as R from "ramda"
import {Observable as O, ReplaySubject as RS, Subject as S} from "rxjs"

// chan :: Observable a
// chan :: a -> ()
let chan = (letFn) => {
  let subj = new S()
  let obs = letFn(subj)
  function channel(...callArgs) {
    return subj.next(callArgs[0]) // callArgs[1..n] are reserved
  }
  Object.setPrototypeOf(channel, obs)
  return channel
}

// mergeObj :: Object (Observable *) -> Observable *
let mergeObj = (obj) => {
  let values = R.values(obj) // streams
  return O.merge(...values)
}

// mergeObjTracking :: Object (Observable *) -> Observable {key :: String, value :: *}
let mergeObjTracking = (obj) => {
  obj = R.mapObjIndexed((value, key) => {
    return value.map(val => ({key, val}))
  }, obj)
  let values = R.values(obj) // streams
  return O.merge(...values)
}


let actions = {
  foo: chan(R.identity),
  bar: chan(R.identity)
}

let obs = mergeObjTracking(actions)
// `obs.pluck("val")` converts to vanilla `mergeObj` format

obs.subscribe(x => {
  console.log("action", JSON.stringify(x.key))
  console.log("  args:", JSON.stringify(x.val))
  console.log()
})

actions.foo("f1")
actions.foo("f2")

actions.bar("b1")
actions.bar("b2")

actions.foo(["f3a", "f3b"])

// key: ---foo---foo---bar---bar---foo-------->
// val: ---f1----f2----b1----b2----f3a, f3b--->
```

That's why obscure reducers aren't a great idea. And this feature is impossible to achieve
in CalmmJS which a) uses functional reducer approach b) merges actions and state into a single concept.
Redux which does only b) is not affected, but the feature can be implemented only in library code.

## Proactive state getter

Can be useful for optimistic updates and other kinds of multistep state interactions.

```js
let actions = {
  setCounter: chan($ => $
    .map(c => s => ({counter: c}))
  ),
}

let state = store({counter: 0}, actions)

state.get = () => {
  let r
  state.subscribe(x => {
    r = x
  }).unsubscribe()
  return r
}

state.subscribe(s => {
  console.log("reactive state:", s)
})

let c

actions.setCounter(1)
;({counter: c} = state.get()) // destructuring vs blocks... @_@
console.log("proactive state.counter:", c)

actions.setCounter(2)
;({counter: c} = state.get())
console.log("proactive state.counter:", c)

actions.setCounter(3)
;({counter: c} = state.get())
console.log("proactive state.counter:", c)

// reactive state:          {counter: 0}
// reactive state:          {counter: 1}
// proactive state.counter: 1
// reactive state:          {counter: 2}
// proactive state.counter: 2
// reactive state:          {counter: 3}
// proactive state.counter: 3
```

## Atom

Store with proactive capabilities.

```js
let atom = (seed, options) => {
  let actions = obscureActions

  let $ = store(seed, actions, options)

  let get = () => {
    let r
    $.subscribe(x => {
      r = x
    }).unsubscribe()
    return r
  }

  return {
    get,
    set: (...args) => { actions.set(...args); return get() },
    over: (...args) => { actions.over(...args); return get() },
    merge: (...args) => { actions.merge(...args); return get() },
    mergeDeep: (...args) => { actions.mergeDeep(...args); return get() },
    $,
  }
}

let a = atom({counter: 0})

a.$.subscribe(a => {
  console.log("a:", a) // A
})

// State updates seen in all possible ways:
//   A: reactively
//   B: passively
//   C: actively
console.log(a.set(["counter"], 1)) // B
console.log(a.get()) // C
console.log(a.set(["counter"], 2)) // B
console.log(a.get()) // C
```

<em>But this is not <strike>RESTful</strike> reactive!!!</em> – I think it's appropriate to give up reactivity in some cases.

For example, the following is a hell to achieve in CycleJS:

```
Single "Action" sequence:
  @ do something async
    wait for result
  @ change state
    wait for the change to apply
  @ do something async
    wait for result
  @ change state
    wait for the change to apply
```

Why/when you may need that? Optimistic updates, sophisticated *loading* indications,
some controlled communication with backend, some testing scenarios... It's kinda like one-way dataflow
in React: a good default which is nice to sidestep occasionally.

In short, when you need to achieve a **controlled** UI &harr; State &harr; Server **interaction**.
Control is (by definition) proactive, which is the opposite of reactive and requires different code
patterns. Taking control, you often need to "accumulate" more variables in scope. The obvious drawback
of entering a non-reactive zone, is that now it's responsibility to update variables. Library code
can only help you in that:

```js
// WORST control case
function (state) { // here and below `state` arg. is the "last snaphot" of a reactive store
  if (state.counter == 59) {
    actions.setCounter(0) // updates a store
  }
  // `state` is outdated here
  console.log(state.counter + 1) // 60 – bug!
  ...
}
```

```js
// BAD control case
function (state) {
  if (state.counter == 59) {
    actions.setCounter(0) // updates a store
  }
  // `state` is outdated here
  state = R.assoc("counter", state, 0) // manual sync, need to reproduce the above command
  // `state` is actual here
  console.log(state.counter + 1) // 1 – ok!
  ...
}
```

```js
// DECENT control case
function (state) {
  if (state.counter == 59) {
    actions.setCounter(0) // updates a store
  }
  // `state` is outdated here
  state = getState() // manual pull, the same pattern every time
  // `state` is actual here
  console.log(state.counter + 1) // 1 – ok!
  ...
}
```

```js
// GOOD control case
function (state) {
  if (state.counter == 59) {
    state = actions.setCounter(0) // updates both store and variable
  }
  // `state` is actual here
  console.log(state.counter + 1) // 1 – ok!
  ...
}
```

# 6. Concepts

Random notes to not forget. Will be better distributed by "lessons"/"examples" later.

## Trackable actions

Can be used to build Redux-like devtool.

```js
let R = require("ramda")
let {Observable: O, Subject} = require("rxjs")

// chan :: Observable a
// chan :: a -> ()
let chan = (mapFn) => {
  let subj = new Subject()
  let obs = mapFn(subj)
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

## Blueprints

### Motivation

A missing link between libraries and frameworks.

```
^ real-world product                              Apps
|                                      Starters
                          Frameworks
             Blueprints
 Libraries
<----------------------------------------------------->
 * extensibility                         * hypeability
 * reusability                           * 1/time to "working" code
 * simple                                * complex
 * hard                                  * easy
```

Starters imply a selected subset of frameworks and libraries.

TODO: replace the diagram with an image because the labels does not mean points, but overlapping circles.
Put a link to **Simple vs Easy** by Rich Hickey.

Libraries are harder to use but easier to extend. They keep "extension points" in the client code.
Whereas Frameworks hide the "extension points" from the programmer, usually leaving them only
to "plugins" (or similar rudiments).

```js
let app = new AwesomeFramework(options) // Senior

app.use(new DecentPlugin()) // Middle

app.run() // Junior
```

Frameworks, basically, separate programmers in 3 castes:

1. Tens of Thousands of **Framework Users**
2. Hundreds of **Plugin Writers**
3. A few **Framework Authors**

* Framework Users are believed to be able to copy-paste the "approved" solutions.
* Plugin writers are believed to be able to contribute to Framework itself occasionally.
* Framework Authors are believed to know everything better

The typical framework's lifecycle is well known:

```
|- Hype -> Feature Requests -> 100+ Issues -> Author's Retirement -> Decay -> Oblivion ->
<------------- Try again ---------------------------------------------------------------|
```

### Description

**Bluerpints** are my attempt to overcome the barrier level of typical library to make it
closer to the "real app", without becoming another **Framework** or even **App Starter**.

The blueprint should create an app-level code but leave all the extension points both available
and easily accessible by the Programmer.

```js
// "Detail View" blueprint
export default makeApp = (dependencies, options) => {
  // ACTIONS
  let makeActions = () =>
    ...

  // STATE
  let makeState = (actions, options={}) =>
    ...

  // ASYNC ACTIONS
  let makeAsyncActions = (state, actions) =>
    throw Error("not implemented") // some parts can be omitted

  return {makeActions, makeState, makeAsyncActions}
}
```

```js
import makeApp from "../blueprints/detail"
import * as main from "./main"

let {makeActions, makeState, makeAsyncActions} = makeBlueprint(main, {modelName: "User", collName: "users"})

export let actions = makeActions() // can reuse

actions.seed = O.of(1) // can reuse with modifications

export let state = makeState(actions, {
  doFn: (s) => console.log("# userDetail state:", s)
}).pluck(...) // can extend

export let asyncActions = makeMyOwnAsyncActions(state, actions) // can fully replace
```

**Blueprints** return transparent and mutable datastructures which then can be used, reused, modified
and recombined in all imaginable ways.

Consider the following Blueprint possibilities:

* You can use only a part of a blueprint.
* You can update or replace any part of a blueprint.
* You can disable or omit any part of a blueprint.
* You can extend a blueprint in non-predictable ways.
* You can combine fragments of two+ different blueprints.
* You can *look inside* a blueprint. Introspection is a no-brainer.

Now let's compare that with your typical Framework:

* You can't usually extract some framework's part. The framework constructor and return value are
usually obscure, fn-like datastructures.
* You totally can't update or replace *any part* of a framework. You are limited to what plugins can do.
* You totally can't disable or omit any part of a frawework. If you do that – it just stops working.
* You can't extend a framework in non-predictable ways. Even if you could – it would be a violation
of "best practices".
* You can't typically combine a fragment of one framework with a fragment of another Framework.
* You can't typically *look inside* a framework. Introspection is very limited.

Though, some low-level frameworks like Express have examples of successfull reusability the picture
is quite self-speaking.

The most of above framework problems can be fixed with the following steps.
1. Accept and return as many native JS datastructures as possible. Avoid classes and other OOP bullshit.
2. Keep the "glue code" on the client part, don't hide it somewhere deep in the library.
3. The app should be a formalized concept.

Let's look at the code layout again:

```js
// app = kinda (framework + foo + bar + baz + some extra code)

let app = Framework(options) // how to combine 2+ apps?

app.use(FooPlugin1()) // how to extend "plugin system" itself?
app.use(BarPlugin2())
app.use(BazPlugin3())

app.run() // frameworks runs the code
```

vs

```js
// app = foo + bar + baz (and nothing else) // App is just a namespace
                                            // of it's parts

let blueprint = makeBlueprint(options)      // Blueprint is just a namespace
let {makeFoo, makeBar, makeBaz} = blueprint // of factories of each application part

// makeFoo, makeBar, makeBaz -- factories that make app defaults!

// you tweak and combine that parts yourself
let foo = makeFoo()           // foo = {...} -- plain transparent object
foo.x = x                     // easy to change "features"

let bar = makeFoo(foo)        // bar = {...} -- plain transparent object
delete bar.y                  // easy to remove "features"

let baz = makeFoo(foo, bar)   // baz = {...} -- plain transparent object
baz.z = baz.z.do(console.log) // easy to add new "features"

run(foo, bar, baz)            // you run the code
```

In the classic OOP scheme: `app = framework core + plugins + app code`.
And actually, it's often not even specified. You can't usually separate apps
into smaller apps(!) and test them separately.

In the "blueprint" scheme: `appXYZ = partX + partY + partZ` (specific to architecture).
It's strictly specified and every app has the same structure. You not only CAN but
it's expected to separate apps into smaller apps(!) and test them separately.

TODO: list the following articles:
* https://staltz.com/unidirectional-user-interface-architectures.html
* https://staltz.com/some-problems-with-react-redux.html

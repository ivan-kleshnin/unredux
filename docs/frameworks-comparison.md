# Frameworks Comparison

## Agenda

[Synopsis](https://github.com/ivan-kleshnin/dataflows)

### Types of state management

Passive PULL-PULL (passive input, reactive output):

```js
let state = new State()
state.set(foo)        // pull input
let foo = state.get() // pull output
```

Hybrid PULL-PUSH (passive input, reactive output):

```js
let state = new State()

state.subscribe(doSomething) // push output: ==foo==bar==>

state.set(foo) // pull input
state.set(bar) //
```

Reactive PUSH-PUSH (reactive input, reactive output):

```js
let actions = O.of(foo, bar) // push input

let state = new State(actions)

state.subscribe(doSomething) // push output: ==foo==bar==>
```

#### Reactive view + External Hybrid state + Proactive actions

`Action => State <- View => Action`

* ReactJS (default approach)

```
// View => Action:
onClick = {() => handleAdd(2)}

// Action => State
function handleAdd(v) {
  state.over(["counter"], R.add(v))
  // or
  // this.setState({counter: R.add(this.state.counter, v)})
}

// State <- View
// implicit DOM reconcilation
```

#### Reactive view + External Hybrid state (no explicit actions)

`State <- View => State`

* Angular
* CalmmJS
* Cycle-React
* MobX (default approach)
* Flux
* Redux
* VueJS
* (... thousands of them)

```js
// View => Action
onClick = {() => state.over("counter", R.add(2))}

// State <- View
// implicit DOM reconcilation
```

#### Reactive view + Reactive state + Proactive actions

`Action <- State <- View => Action`

* Earlier versions of this project
* *(Not aware of other examples)*

```js
// View => Action
onClick = {() => actions.add(2)}

// Action => State
let state = State(O.merge(
  actions.inc,
  actions.add,
  // ...
))
```

#### Reactive view + Reactive state + Reactive actions

`Intent <- State <- View <- Intent`

* CycleJS
* Unredux
* *(Not aware of other examples)*

```js
// View <- Intent
let intents = {
  inc: DOM.fromKey("inc").listen("click"),
  dec: DOM.fromKey("dec").listen("click"),
}

// Intent <- State
let state = State(O.merge(
  intents.inc(_ => R.inc),
  intents.add(v => R.add(v)),
  // ...
))
```

## How Unredux looks like in comparison to _

### [Cycle-react](https://github.com/pH200/cycle-react)

Architecture is very React-like. Imperative state changes: https://github.com/pH200/cycle-react/blob/master/examples/web/todomvc/todo-model.js#L22.
Imperative intents: https://github.com/pH200/cycle-react/blob/master/examples/web/todomvc/todo-view.js#L57-L64.

### [CalmmJS](https://github.com/calmm-js)

Redux-like. Allows multiple stores. Obscure actions. Magic observable injections into React.

### [CycleJS](https://github.com/cyclejs/cyclejs/)

The dataflow design of Unredux was inspired by CycleJS. I think CycleJS is based on two great and
one bad ideas. The great ideas are: reactive dataflow and isolation approach. The bad idea is drivers.

I believe the Driver concept is broken on the very fundamental level. CycleJS drivers are said to
"remove side effects from your code". And they really do it but not in the sense you want.

Haskell(\*s) + "do" syntax: *write code that looks like imperative, but is actually pure*.
CycleJS + drivers: *write code that looks like pure, but is actually imperative*.

And not, this is not caused by monad vs observable API distinction. This is a conceptual difference.

Haskell approach is very grounded: side effects are sequential by nature so it's convenient to express
them so. Meanwhile we don't want to break the language purity so we express them as lambdas under
the carpet. For example, effectful function may have a type like `a -> RealWorld -> (b, RealWorld)` and
be called like

```hs
do {
  x1 <- doThis
  x2 <- doThat
}
```

Note that you not only express natural sequences sequntially. You also can accumulate the action
results in scope!

Now CycleJS' approach allows you to isolate side-effects in the library code so you can test your app
without mocking. Sounds good, but the HUGE drawback is that you can no longer express effectful
sequences sequentially. It's trivial to make a one-off side effect and DOM stuff is mostly like that.
It's already hard to express two sequential effects (think optimistic updates where you affect STATE and SERVER)
and HTTP stuff is mostly like that. In pseudo-code:

```
make doThis
take response of doThis
  make doThat
take response of doThat
  final

request doThis
request doThat
```

And it's a complete spaghettified nightmare to express 3+ steps.

I wonder why CycleJS community is so concerned about drivers. Most drivers, with a few exceptions,
incapsulate fairly trivial code. They simply can't take complex premises to do something more useful
than hiding subscription lines. The fact is: the app's IO layer is often **less** predictable
than app's logic layer so side-effects in CycleJS are 2nd class by design, except for DOM where it's
*render that* one-off effects.

Going further, anything with 2+ effect types can't be exressed as driver, and will be classified as...
middleware? Nothing of that is even mentioned in the docs. `cycle-onionify` and `isolate` are
"secret" examples of middlewares.

Now state management is the biggest unsolved frontend topic since 2014 and it is all about multiple
effect sources and targets: memory, localStorage, REST, etc. CycleJS is not prepared to them "by design".

TODO describe the lack of lifecycle events

Our decision is to ditch the drivers completely. When it's about *hard testing vs hard development* choice
I will always choose the first. The benefit of unit tests is overrated, the pain of messy development
is underrated. CycleJS will force you to manually marshal N+ effectful streams from your components.
And, without a compiler help, it's not trivial at all (TypeScript won't help you because effects are still
untyped).

In Unredux, most components will have 1 or 2 streams: `$ (state-action)` (like in Cycle-Onionify)
and `DOM` (like in basic CycleJS). HTTP, logging, etc are kept inside the components. Their
resources can still be handled and properly released via `DOM` stream or React lifecycle events.

# Content

```
$ export NODE_ENV=development (for Webpack)
$ npm run demo1
$ npm run demo2
```

## Demo1

### Lenses

TODO

## Demo2

### Store

The current store implementation of:

```js
// store :: (State, Actions) -> Observable State
export let store = (seed, actions) => {
  ...

  return mergeObj(actions)
   .startWith(seed)
   .scan((state, fn) => {
      if (typeof fn != "function") {
        throw Error(`invalid fn ${fn} dispatched`)
      } else {
        return fn(state)
      }
   })
   ...
}
```

requires initial state as an argument. Strictly speaking, we could pass that argument
via actions. Let's try that, removing the argument from the implementation:

```diff
- // store :: (State, Actions) -> Observable State
+ // store :: (Actions) -> Observable State
- export let store = (seed, actions) => {
+ export let store = (actions) => {
  ...

  return mergeObj(actions)
-   .startWith(seed)
   .scan((state, fn) => {
      if (typeof fn != "function") {
        throw Error(`invalid fn ${fn} dispatched`)
      } else {
        return fn(state)
      }
   })
   ...
}
```

and changing the client code:

```diff
- let state = store(seed, actions)
+ let state = store(R.merge(actions, {seed: O.of(seed)}))
```

Believe me or not – everything will keep working. So isn't that a great idea? An opportunity to remove
a signature argument is always tempting. I don't think it's so great because:

1. Argument is dropped but the action declaration gets an additional complexity.
2. Actions now require `seed` to be declared before them (hurting the cohesion).
3. You get an additional complexity in more complex store implementations (e.g. stores with history)
4. Because a change from sync to async can't make it easier...
5. The action name can be anything: from `seed` to `init`. But the store implementations
will still need to know that name to extract the seed (to wrap or update it somehow). This can
be solved by name convention (or either by index concention, first event = initial).
6. Typing problem (see below).

So basically we just traded an argument for a name convention and got all the additional
complexity "for free". Which does not look like a solid deal, if you ask me.

For a demo of 3. compare the following:

```js
export let historyStore = (seed, stateActions, historyActions) => {
  ...

  seed = {
    log: normalizeLog([seed]), // [null, null, <state>]
    i: options.length - 1,     //  0     1     2!
  } // handle non-reactive seed

  stateActions = ...

  ...
}
```

with

```js
export let historyStore = (stateActions, historyActions) => {
  ...

  let seed = actions.seed // :: Observable Action

  stateActions = R.map(..., stateActions) // doing some stuff with each item

  stateActions.seed = seed.map(s => ({
    log: normalizeLog([s]), // [null, null, <state>]
    i: options.length - 1,  //  0     1     2!
  }) // handle reactive seed

  ...
}
```

Now let's expand #6. The `store` abstraction is intentionlly designed to look like `reduce` (or `scan`).
Passing an initial state via actions is like passing a `reduce` accumulator via an array. It messes
the typing in our case:

```js
reduce(fn, z, xs)      // :: (z, a) -> z, z, Array a -> z
// vs
reduce1(fn, [z, ...xs]) // :: (z, z) -> z, Array z -> z
```

The second version requires accumulator to have the same type as an array item which is not always
possible. And with `store`, in particular, it's not possible as actions are observables of state
reducers (`Observable (State -> State)`) and initial value is just a state (`State`). `z` and `a` don't match.

```js
// type Actions = Object (State -> State)
// vs
// type ActionsWTF = Object ((State -> State) | State) -- in the case of "simple API"

// action :: Actions
let actions = ...
```

The last possible appproach (of a "reasonable" set) is used in [Cycle-Onionify](https://github.com/staltz/cycle-onionify).
Instead of initial state we drop-in the initial "constant" reducer. Now the typing is fine:

```js
// actions :: Actions
let actions = {
  seed: O.of(R.setL(seed)), // Observable ((z, a) -> State) -- z and State does not match here...
  ...
}

let store = (actions) => {
  return mergeObj(actions)
   .startWith(null) // -- any value, is ignored in initial reducer
   .scan((state, fn) => {
      if (typeof fn != "function") {
        throw Error(`invalid fn ${fn} dispatched`)
      } else {
        return fn(state)
      }
   })
   ...
}
```

but the points 1–5 still appply.

I have a hard time choosing between those three. Both **extra argument** and **async initial state**
are leaky abstractions. I'm not big on simplifying client APIs at the cost of pouring an additional
complexity into libraries. Partially, because I think we all should write more libraries.

For now, I decided to settle myself on the "explicit argument" version.

### Derived state

TODO

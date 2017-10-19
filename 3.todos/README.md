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

### Store API design

The current store implementation of:

```js
// store :: (State, Actions) -> Observable State
export let store = (seed, actions) => {
  ...
  return mergeObj(actions)
   .startWith(seed)
   .scan((state, fn) => {
      if (R.is(Function, fn)) {
        return fn(state)
      } else {
        throw Error(`invalid fn ${fn} dispatched`)
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
      if (R.is(Function, fn)) {
        return fn(state)
      } else {
        throw Error(`invalid fn ${fn} dispatched`)
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
// type Actions = Object (State -> State) -- the first "Complex" case
// vs
// type ActionsWTF = Object ((State -> State) | State) -- the second "Simple" case

// action :: Actions
let actions = ...
```

The last possible appproach (of a "reasonable" set) is used in [Cycle-Onionify](https://github.com/staltz/cycle-onionify).
Instead of initial state we drop-in the initial "constant" reducer. Now the typing is fine:

```js
// actions :: Actions
let actions = {
  seed: O.of(R.setL(seed)), // Observable ((z, a) -> State) -- except z and State mismatch here
  ...
}

let store = (actions) => {
  return mergeObj(actions)
   .startWith(null) // -- any value, is ignored in initial reducer
   .scan((state, fn) => {
      if (R.is(Function, fn)) {
        return fn(state)
      } else {
        throw Error(`invalid fn ${fn} dispatched`)
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

**Update**

Couldn't stop myself and tried all 3 APIs. That `seed` "wants" to be separated from other actions
in many cases:

```
// historyStore :: (Actions, Actions, HiStoreOptions?) -> Observable State
export let historyStore = ({seed, ...stateActions}, historyActions, options={}) => {
  options = R.merge({
    length: 3,
    cmpFn: R.equals,
  }, options)

  let normalizeLog = (log) =>
    R.takeLast(options.length, [...R.repeat(null, options.length), ...log])

  let normalizeI = (i) =>
    (i > options.length - 1 ? options.length - 1 : i)

  seed = seed.map(fn => state => ({
    log: normalizeLog([fn(state)]), // [null, null, <state>]
    i: options.length - 1,          //  0     1     2!
  }))

  stateActions = R.map($ => $
    .map(fn => hs => {
      if (hs.i < options.length - 1) {
        hs = {
          log: normalizeLog(R.slice(0, hs.i + 1, hs.log)),
          i: options.length - 1,
        }
      }
      return R.setL(["log"], tailAppend(fn(hs.log[hs.i]), hs.log), hs)
    })
  , stateActions)

  return store({seed, ...stateActions, ...historyActions}, {...options, cmpFn: R.F})
    .map(state => state.log[state.i])
    .distinctUntilChanged(options.cmpFn)
}
```

So it totally doable... but seems to add more problems than solve.
For example, try to merge seeds from blueprints (TODO explanations?):

```js
// 1) Separate Seed API: let seed = {...}
let seeds = R.merge(seed1, seed2)
// The problem does not even exist...

// 2) "Naive" API: {seed: O.of(seed)}
let mergeObs = (k, o1, o2) => {
  if (R.is(O, o1) && R.is(O, o2)) {
    return O.zip(o1, o2).map(([o1, o2]) => {
      return R.merge(o1, o2)
    })
  } else {
    throw Error(`unexpected name clash for the key "${k}"`)
  }
}
R.mergeWithMergeObsFlipped = R.flip(R.mergeWithKey(mergeObs))

let actions = R.pipe(
  R.mergeWithMergeObsFlipped({foo: "foo", seed: O.of({foo: "foo"})}), // sets {seed: O.of(() => seed1) ...}
  R.mergeWithMergeObsFlipped({foo: "bar", seed: O.of({bar: "bar"})}), // sets {seed: O.of(() => R.merge(seed1, seed2)) ...}
  // ...
)({})

actions.seed.subscribe(x => {
  console.log(x)
})

// works but @_@

// 3) "Staltz'" API: {seed: O.of(() => seed)}
let mergeObs = (o1, o2) => {
  if (R.is(O, o1) && R.is(O, o2)) {
    return O.zip(o1, o2).map(([o1, o2]) => {
      return () => R.merge(o1(), o2())
    })
  } else {
    throw Error(`unexpected name clash for the key "${k}"`)
  }
}
R.mergeWithMergeObsFlipped = R.flip(R.mergeWith(mergeObs))

let actions = R.pipe(
  R.mergeWithMergeObsFlipped({seed: O.of(() => ({foo: "foo"}))}), // sets {seed: O.of(() => seed1) ...}
  R.mergeWithMergeObsFlipped({seed: O.of(() => ({bar: "bar"}))}), // sets {seed: O.of(() => R.merge(seed1, seed2)) ...}
  // ...
)({})

actions.seed.subscribe(x => {
  console.log(x(null))
})

// works but @_@
```

Still considering all options, but now I'm even more inclined to a simple separate seed.
Async seed just shifts the complexity to library code as I initially predicted.

**Update**

The last possible option is to accept `initialState` as an option key. That won't work
because all options have a default value and initial state can't have one. Store does not and can
not know whether you expect `null`, `{}` or something else in this regard.

### Derived state

Derived state is a part of an application state that 1) is calculated on base of the main state
2) contains something you don't want to persist (in most cases).

For example, a list of filtered articles (assuming that frontend has access to the full list of them
at once) is a state derived from the reactive collection of articles and the (half-reactive) set of
current filters, sorts and pagination. Another example is a "detail" page (which can be seen
conceptually as an index filtered by a single id and so containing 1 or 0 items). Detail page can
derived from those two data points.

Data derivation is similar in purpose to the graph links Falcor uses. It frees you from a constant
threat of data unsync. I think data derivation is more powerful because it allows to describe
more dependencies in a declarative way.

Consider the following:

```js
let users = {"1": {...}, "2": {...}, ...]
let currentUser = users["1"]
```

Now changes in `users` will be automatically represented in `currentUser`. This is the principle
Falcor uses (kinda simplified but relevant for the purpose of this explanation).

The problem with the above is `["1"]`. Current user has a "hardcoded" key and the key itself can't
be derived from anything. It has to be changed in a non-reactive way.

Now consider the following:

```js
let users$     // a stream of users "collection"
let currentId$

let currentUser = deriveDetailView(users$, currentId$)
```

This time `currentUser` can be recalculated whenever one of `users[currentId]` or `currentId` changes.
It's fully reactive in the case when you take that from URL and need manual set actions otherwise
(because then your logic is custom and can't be predicted).

The division between URL-controlled and state-controlled indexes, detail and edit pages were already
present at [React-Ultimate](https://github.com/Paqmind/react-ultimate) but that time I failed to
capture a single universal mechanics. Probably because I thought of derived states as necessary
stateless and strictly formula-based.

Now I've changed my mind and I believe derived states can be store-based. The formula I use now were
given above, but worth repeating: derived state is a part of an application state that 1) is calculated
on base of the *main* state 2) contains something you don't want to persist (in most cases).
Main state hereby, is a state that can (or should) be persisted.

You don't want to persist current page id, filters, sorts **by default** because they
a) can be taken directly from URL in some cases
b) can not be persisted to the main backend storage

You can find the exceptions to the previous points but they are rare and the point of this project
is to review the approaches to the common cases, not to cover all cases which is obviously impossible.

If you want to persist the last filters + sorts + pagination into localStorage – nothing prevents
you from doing it separately. The point of having the main state here is to represent the server-side
data (tables/collections) as close as possible and without any duplication.

# Content

```
$ export NODE_ENV=development (for Webpack)
$ npm run demo1
$ npm run demo2
```

## Demo1

### Concepts

#### Standard actions

We discovered that almost all state updates can be trivially expressed with the following reducers:

```js
let reducers = {
  // set :: State -> State -> State
  // set :: (String, a) -> State -> State
  set: args => state => {
    if (args instanceof Array) {
      let [path, val] = args
      return R.setL(path, val, state)
    } else {
      let val = args
      return val
    }
  },

  // over :: (State -> State) -> State -> State
  // over :: (String, (a -> b)) -> State -> State
  over: args => state => {
    if (args instanceof Array) {
      let [path, fn] = args
      return R.overL(path, fn, state)
    } else {
      let fn = args
      return fn(state)
    }
  },

  // merge :: a -> State -> State
  // merge :: (String, a) -> State -> State
  merge: args => state => {
    if (args instanceof Array) {
      let [path, stateFragment] = args
      return R.overL(path, R.mergeFlipped(stateFragment), state)
    } else {
      let stateFragment = args
      return R.merge(state, stateFragment)
    }
  },

  // mergeDeep :: a -> State -> State
  // mergeDeep :: (String, a) -> State -> State
  mergeDeep: args => state => {
    if (args instanceof Array) {
      let [path, stateFragment] = args
      return R.overL(path, R.mergeDeepFlipped(stateFragment), state)
    } else {
      let stateFragment = args
      return R.mergeDeep(state, stateFragment)
    }
  },
}
```

Where `merge` is very close to React's `setState` in effect. As you can see, all four reducers have
similar polymorphic APIs for convenience. Let's see them in practice:

```js
let makeActions = (reducers) => {
  return R.mapObjIndexed((reducer, key) =>
    chan($ => $.map(reducer))
  , reducers)
}

let actions = makeActions(reducers)

mergeObj(actions).subscribe(fn => {
  console.log(JSON.stringify(fn({data: {counter: 2}}), null, 2)) // imitate fn(currentState)
})

actions.set(["data", "counter"], 3) // {data: {counter: 3}}
actions.set({data: {counter: 3}})   // {data: {counter: 3}} -- same as above

actions.over(["data", "counter"], c => c + 2)           // {data: {counter: 4}}
actions.over(["data"], s => ({counter: s.counter + 2})) // {data: {counter: 4}} -- same as above

actions.merge(["data"], {counter: 1})   // {counter: 1} -- keeps other "counter" keys
actions.merge({data: {counter: 1}})     // {counter: 1} -- drops other "counter" keys
actions.mergeDeep({data: {counter: 1}}) // {counter: 1} -- keeps other "counter" keys
```

Few notes. `set` and `over` are typical lens operations and hopefully are self-speaking.
`mergeDeep(data)` is useful because `merge(path, data)` can affect only one path at once
All cases of `mergeDeep(path, data)` should be possible to emulate with `mergeDeep(data)`,
but we keep it for consistency.

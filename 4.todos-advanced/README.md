# Content

```
$ export NODE_ENV=development (for Webpack)
$ npm run demo1
$ npm run demo2
```

## Demo1

### Concepts

* History reducer

## Demo2

### Concepts

* Local storage

---

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
3. You get a lot of additional complexity in more complex store implementations (e.g. stores with history)
4. Because a change from sync to async can't make it easier...
5. The action name can be anything: from `seed` to `init`. But the store implementations
will still need to know that name to extract the seed (to wrap or update it somehow). This can
be solved by name convention.

So basically we just traded an argument for a name convention and got all the additional
complexity "for free". Which is a pretty lame if you ask me.

For a demo of 3. compare the following:

```js
export let historyStore = (seed, stateActions, historyActions) => {

  seed = {
    log: normalizeLog([seed]), // [null, null, <state>]
    i: options.length - 1,     //  0     1     2!
  }

  stateActions = ...

  ...
}
```

with

```js
export let historyStore = (stateActions, historyActions) => {
  ...

  let seed = actions.seed // :: Observable Action

  stateActions = ...

  stateActions.seed = stateActions.map(s => ({
    log: normalizeLog([seed]), // [null, null, <state>]
    i: options.length - 1,     //  0     1     2!
  })

  ...
}
```

Async initial state is a leaky abstraction.

P.S.

Just noted that [Cycle-Onionify](https://github.com/staltz/cycle-onionify) has made the opposite
API decision in almost the same case. Unlike many my colleagues, I'm not big on simplifying client
APIs at the cost of extra complexity pouring into libraries. Probably, because I think we all should
write much more libraries.

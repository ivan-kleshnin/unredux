# Content

```
$ export NODE_ENV=development (for Webpack)
$ npm run demo1
$ npm run demo2
```

## Demo1

### Concepts

* Lenses

## Demo2

### Concepts

* Store
* Derived state

---

The current store implementation of:

```js
// store :: (State, Actions, StoreOptions?) -> Observable State
export let store = (seed, actions, options={}) => {
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
- // store :: (State, Actions, StoreOptions?) -> Observable State
+ // store :: (Actions, StoreOptions?) -> Observable State
- export let store = (seed, actions, options={}) => {
+ export let store = (actions, options={}) => {
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

1. Argument is dropped but the action declaration gets additional complexity.
2. Actions now require `seed` to be declared before them (hurting the code cohesion).
3. You get a lot of additional complexity in more complex store implementations (e.g. stores with history)
4. Because when you change sync for async it's always more complex.
5. The action name can be anything: from `seed` to `init`. But the store implementations
will still need to know that name to extract the seed (to wrap or update it somehow). This can
be solved by name convention.

So basically we just traded an argument for a name convention and got all the additional
complexity "for free". Which is a pretty lame decision, if you ask me. 

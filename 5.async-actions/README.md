# Content

```
$ export NODE_ENV=development (for Webpack)
$ npm run demo1
$ npm run demo2
```

## Demo1

app = reactive Actions + reactive State + reactive Async Actions

Names and terms are under consideration.

### Obscure reducers

You may discover that most state updates can be trivially expressed with the following reducers:

```js
let obscureReducers = {
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

Let's check them in practice:

```js
let actions = R.map(fn => chan($ => $.map(fn)), obscureReducers)

mergeObj(obscureActions).subscribe(fn => {
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

`set` and `over` are typical lens operations  and hopefully are self-speaking. `merge` is conceptually
close to React's `setState`. `mergeDeep(data)` is useful because `merge(path, data)` can affect only
one path at once. All cases of `mergeDeep(path, data)` should be possible to emulate with
`mergeDeep(data)`, but we keep here both for consistency.

There is a problem with that approach though, which can be negligible or catastrophic, depending on
the type of app you develop. Those reducers are **obscure** and therefore some introspecting options will
be blocked for you.

Suppose you have the following action layout:

```js
let actions = {
  setUser: chan($ => $
    .map(user => state => R.setL(["users", user.id], user, state)
  ),
  // ...
}
```

and now you need to intercept `setUser` tasks to do some additional effects, like logging or type
checking. It's very simple:

```js
let actions = {
  setUser: chan($ => $
    .map(user => state => R.setL(["users", user.id], user, state)
    .do(console.log) // !!!
  ),
}
```

Now suppose you have the following layout instead:

```js
let actions = {
  set: chan($ => $.map(obscureReducers.set)),
  // ...
}
```

and you need to intercept `setUser`-like tasks again. Your next step...?

```js
let actions = {
  set: chan($ => $
    .map(obscureReducers.set)
    .do(???) // oh wait, other "set" actions are using this channel...
  ),         // and "set-user" effects can also be fired through `over`, `merge`, `mergeDeep`...
  // ...
}
```

The closures are obscure which leaves you no clear way to hook into actions.
You can desperately apply `fn` to a fake state instance to see "what it was". You can also subscribe
to state updates and try to react post-factum, which will undermine you for cases where you actually
wanted to prevent those changes... What will you do? Some kind of transaction-based mechanics with rollbacks?!
The old wisdom that some things are easier to prevent than to deal with is totally applicable here.

So our current recommendation is to use `obscureReducers` only for the simplest cases, as a quick and dirty solution.

### Observable actions

Which kind of logic you can want to drop into action streams? There are many: logging, validation, model creations
(`userFragment -> user`), delaying, throttling, some reactive post-actions like cache-cleaning, etc. etc.
So it's important to make all that both possible and easy. That's why we keep the current API
for `chan`, accepting the fact it may perplex some people at first.

The absence of actions is the reason pure React/Baobab/etc. are hard to work with. You can only
modify state and subscribe to its updates. When you want to apply some logic *before* every change
of particular type – your only option is to go and put those checks in **every place** you trigger them.

```js
onX(() => {preAction().then(action).then(postAction)})
// ...
onY(() => {preAction().then(action).then(postAction)})
```

Your immediate instict will be to move `preAction` and `postAction` codes into `action`.
But that will bring you three serious problems.

The first one is testing. You made three functions separate at first not by chance – they represent
three relatively independent logics which you'd like to test separately. So you'll kinda be torn apart
about what to tolerate: extra DRY or extra Coupling.

Second. You'll need to repeat the process (and the dilemma solving) every time you create new action
requiring the same pre-action.

```js
let actionXY = () => {
  preActionX()
  // ...
}

let actionXZ = () => {
  preActionX() // a sense of dejavu...
  // ...
}
```

Third. Observables are much more powerful than Promises. You can apply cancellation, retry, etc.
high-level logics to Observables with no fuss. And you'll need to juggle with async manually applying
that to promises.

```js
let actions = {
  setUser: chan($ => $
    // <-- put preAction logic/effects here
    .map(reduceFn)
    // <-- put postAction logic/effects here
  ),
}
```

The bottom line: **keep actions observable**.

--

Pure React, Redux, CalmmJS and most other libraries don't follow this principle and suffer from the
lack of reactivity. They could argue it's worth to drop reactivity *in this particular place* as a
reasonable trade-off, making pros and cons clear. But since they remain silent, it's possible to
conclude they just didn't try other approaches.

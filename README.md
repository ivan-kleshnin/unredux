# Unredux

**WIP**

## Problems

### 1. RxJS vs MostJS

RxJS seems to be dead. No activity on repo.

### 2. Lenses

```js
let actions = {
  increment: intents.increment.map(() => (state) => R.assoc("counter", state.counter + 1, state)),
  decrement: intents.decrement.map(() => (state) => R.assoc("counter", state.counter + 1, state)),
  incrementIfOdd: intents.incrementIfOdd.map(() => (state) => {
    return R.assoc("counter", state.counter % 2 ? state.counter + 1 : state.counter, state)
  }),
}
```

raw approach is too noisy. Solutions:

* wrap Ramda lenses (too verbose by default)?
* use Partial.Lenses (too big)?
* use Rx-Utils (what about MostJS)?

### 3. Connection

```js
 componentDidMount() {
    this.$ = state.subscribe((state) => {
      console.log("setting state:", state)
      this.setState(state)
    })
  }

  componentWillUnmount() {
    this.$.unsubscribe()
  }
```

style leads to `initialState` being used twice. Need to replace that with container approach.

let noop = (x) => null

// (State, Object (Observable (State -> State)), () -> null) -> Observable State
export let store = (initialState, actions, spyFn=noop) => {
  actions = Object.values(actions) // converts objects, leaves arrays untouched
  return Observable.merge(...actions)
   .startWith(initialState)
   .scan((state, fn) => {
      if (typeof fn != "function") {
        throw Error(`invalid fn ${fn} dispatched`)
      } else {
        return fn(state)
      }
   })
   .distinctUntilChanged(R.equals)
   .do(spyFn)
   .shareReplay(1)
}

// Observable State, (State -> State) -> Observable State
export let derive = (state, deriveFn) => {
  return state
    .map(deriveFn)
    .distinctUntilChanged()
    .shareReplay(1)
}


// type Actions = Object (Observable (State -> State)

// (State, Actions, a -> b) -> Observable State
export let store = (initialState, actions, mapFn=R.id) => {
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
   .map(mapFn)
   .distinctUntilChanged(R.equals)
   .shareReplay(1)
}

// (Observable State, (State -> State)) -> Observable State
export let derive = (state, deriveFn) => {
  return state
    .map(deriveFn)
    .distinctUntilChanged()
    .shareReplay(1)
}


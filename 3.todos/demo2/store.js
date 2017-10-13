let {mergeObj} = require("./utils")

// type Actions = Object (Observable (State -> State)

// type StoreOptions = {doFn :: a -> null, mapFn :: a -> b, letFn :: Observable a -> Obserbable b}
// (State, Actions, StoreOptions) -> Observable State
export let store = (seed, actions, options) => {
  options = R.merge({
    letFn: R.id,
    mapFn: R.id,
    doFn:  R.id,
  }, options)

  return mergeObj(actions)
   .startWith(seed)
   .scan((state, fn) => {
      if (typeof fn != "function") {
        throw Error(`invalid fn ${fn} dispatched`)
      } else {
        return fn(state)
      }
   })
   .let(options.letFn) // inject observable
   .map(options.mapFn) // inject value to map
   .do (options.doFn)  // inject value
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


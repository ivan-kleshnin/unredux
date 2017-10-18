let {mergeObj} = require("./utils")

// type Reducer = State -> State
// type Action = Observable Reducer
// type Actions = Object Action
// type DoFn = a -> ()
// type MapFn = a -> b
// type LetFn = Observable a -> Observable b

// type StoreOptions = {doFn :: DoFN, mapFn :: MapFN, letFn :: LetFn}

// store :: (State, Actions, StoreOptions?) -> Observable State
export let store = (seed, actions, options={}) => {
  options = R.merge({
    letFn: R.id,
    mapFn: R.id,
    doFn:  R.id,
    cmpFn: R.equals,
  }, options)

  return mergeObj(actions)
   .startWith(seed)
   .scan((state, fn) => {
      if (R.is(Function, fn)) {
        return fn(state)
      } else {
        throw Error(`invalid fn ${JSON.stringify(fn)} dispatched`)
      }
   })
   .let(options.letFn) // inject observable
   .map(options.mapFn) // inject value to map
   .do (options.doFn)  // inject value
   .distinctUntilChanged(options.cmpFn)
   .shareReplay(1)
}

// derive :: (Observable State, (State -> State)) -> Observable State
export let derive = (state, deriveFn) => {
  return state
    .map(deriveFn)
    .distinctUntilChanged()
    .shareReplay(1)
}

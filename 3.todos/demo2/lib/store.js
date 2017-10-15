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
   .throttleTime(10, undefined, {leading: true, trailing: true}) // RxJS throttle is half-broken a.t.m. (https://github.com/ReactiveX/rxjs/search?q=throttle&type=Issues)
   .let(options.letFn) // inject observable
   .map(options.mapFn) // inject value to map
   .do (options.doFn)  // inject value
   .distinctUntilChanged(R.equals)
   .shareReplay(1)
}

// derive :: (Observable State, (State -> State)) -> Observable State
export let derive = (state, deriveFn) => {
  return state
    .map(deriveFn)
    .distinctUntilChanged()
    .shareReplay(1)
}

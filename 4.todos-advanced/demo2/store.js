let {mergeObj} = require("./utils")

// type Actions = Object (Observable (State -> State)

// type StoreOptions = {doFn :: a -> null, mapFn :: a -> b, letFn :: Observable a -> Obserbable b}
// (State, Actions, StoreOptions) -> Observable State
export let store = (initialState, actions, options) => {
  options = R.merge({
    letFn: R.id,
    mapFn: R.id,
    doFn:  R.id,
  }, options)

  return mergeObj(actions)
   .startWith(initialState)
   .scan((state, fn) => {
      if (typeof fn != "function") {
        throw Error(`invalid fn ${fn} dispatched`)
      } else {
        return fn(state)
      }
   })
   .throttleTime(10) // RxJS throttle is half-broken a.t.m. (https://github.com/ReactiveX/rxjs/search?q=throttle&type=Issues)
   .let(options.letFn) // inject observable
   .map(options.mapFn) // inject value to map
   .do (options.doFn)  // inject value
   .distinctUntilChanged(R.equals)
   .shareReplay(1)
}

// type HiStoreOptions = StoreOptions with {length :: Number}
// (State, Actions, Actions, HiStoreOptions) -> Observable State
export let historyStore = (initialState, stateActions, historyActions, options) => {
  stateActions = R.values(stateActions)     // converts objects, leaves arrays untouched
  historyActions = R.values(historyActions) // ...
  options = R.merge({
    letFn: R.id,
    mapFn: state => state.log[state.i],
    doFn:  R.id,
    length: 3,
  }, options)

  let normalizeLog = (log) =>
    R.takeLast(options.length, [...R.repeat(null, options.length), ...log])

  let normalizeI = (i) =>
    (i > options.length - 1 ? options.length - 1 : i)

  initialState = {
    log: normalizeLog([initialState]), // [null, null, <state>]
    i: options.length - 1,              //  0     1     2!
  }

  stateActions = stateActions.map(channel => channel.map(fn => hs => {
    if (hs.i < options.length - 1) {
      hs = R.merge(hs, {
        log: normalizeLog(R.slice(0, hs.i + 1, hs.log)),
        i: options.length - 1,
      })
    }
    return R.setL(["log"], tailAppend(fn(hs.log[hs.i]), hs.log), hs)
  }))

  return store(initialState, stateActions.concat(historyActions), options)
}

// (Observable State, (State -> State)) -> Observable State
export let derive = (state, deriveFn) => {
  return state
    .map(deriveFn)
    .distinctUntilChanged()
    .shareReplay(1)
}

let tailAppend = R.curry((x, xs) => {
  return R.append(x, R.tail(xs))
})

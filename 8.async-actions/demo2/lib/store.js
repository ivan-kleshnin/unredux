let {chan, mergeObj} = require("./utils")

// type Actions = Object (Observable (State -> State)

// type StoreOptions = {doFn :: a -> (), mapFn :: a -> b, letFn :: Observable a -> Obserbable b, cmpFn :: a -> a -> Boolean}
// (State, Actions, StoreOptions?) -> Observable State
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
   .distinctUntilChanged(options.cmpFn)
   .shareReplay(1)
}

export let canUndo = (state) =>
  state.i > Math.max(0, R.findIndex(R.id, state.log))

export let canRedo = (state) =>
  state.i < state.log.length - 1

// type HiStoreOptions = StoreOptions with {length :: Number}
// (State, Actions, HiStoreOptions?) -> Observable State
export let historyStore = (seed, stateActions, options={}) => {
  options = R.merge({
    length: 3,
    cmpFn: R.F,
  }, options)

  let normalizeLog = (log) =>
    R.takeLast(options.length, [...R.repeat(null, options.length), ...log])

  let normalizeI = (i) =>
    (i > options.length - 1 ? options.length - 1 : i)

  seed = R.merge({
    log: normalizeLog([seed]), // [null, null, <state>]
    i: options.length - 1,     //  0     1     2!
  }, seed)

  stateActions = R.map(channel => channel.map(fn => hs => {
    if (hs.i < options.length - 1) {
      hs = R.merge(hs, {
        log: normalizeLog(R.slice(0, hs.i + 1, hs.log)),
        i: options.length - 1,
      })
    }
    return R.setL(["log"], tailAppend(fn(hs.log[hs.i]), hs.log), hs)
  }), R.values(stateActions))

  let historyActions = {
    undo: chan($ => $.map(() => state =>
      R.overL(["i"], (i) => canUndo(state) ? i - 1 : i, state)
    )),

    redo: chan($ => $.map(() => state =>
      R.overL(["i"], (i) => canRedo(state) ? i + 1 : i, state)
    )),
  }

  let historyState = store(
    seed,
    stateActions.concat(R.values(historyActions)),
    options
  )

  let state = historyState
    .map(state => state.log[state.i])
    .distinctUntilChanged(R.equals)

  return {
    historyActions,
    historyState,
    state,
    $: state,
  }
}

let tailAppend = R.curry((x, xs) => {
  return R.append(x, R.tail(xs))
})

// (Observable State, (State -> State)) -> Observable State
export let derive = (state, deriveFn) => {
  return state
    .map(deriveFn)
    .distinctUntilChanged()
    .shareReplay(1)
}

// Object (* -> State -> State)
export let obscureReducers = {
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

// Object (Observable (State -> State))
export let obscureActions = R.map(reducer =>
  chan($ => $.map(reducer))
, obscureReducers)

import * as R from "ramda"
import {O} from "rxjs"
import {chan, mergeObj} from "./utils"

// type Reducer = State -> State
// type Action = Observable Reducer
// type Actions = Object Action
// type DoFn = a -> ()
// type MapFn = a -> b
// type LetFn = Observable a -> Observable b

// type StoreOptions = {doFn :: DoFN, mapFn :: MapFN, letFn :: LetFn}
// type HiStoreOptions = extend StoreOptions {length :: Number}

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

export let canUndo = (state) =>
  state.i > Math.max(0, R.findIndex(R.id, state.log))

export let canRedo = (state) =>
  state.i < state.log.length - 1

// historyActions :: Actions
export let historyActions = {
  undo: chan($ => $.map(() => state =>
    R.over(["i"], (i) => canUndo(state) ? i - 1 : i, state)
  )),

  redo: chan($ => $.map(() => state =>
    R.over(["i"], (i) => canRedo(state) ? i + 1 : i, state)
  )),
}

// historyStore :: (State, Actions, Actions, HiStoreOptions?) -> Observable State
export let historyStore = (seed, stateActions, historyActions, options={}) => {
  options = R.merge({
    length: 3,
    cmpFn: R.equals,
  }, options)

  let normalizeLog = (log) =>
    R.takeLast(options.length, [...R.repeat(null, options.length), ...log])

  let normalizeI = (i) =>
    (i > options.length - 1 ? options.length - 1 : i)

  seed = {
    log: normalizeLog([seed]), // [null, null, <state>]
    i: options.length - 1,     //  0     1     2!
  }

  stateActions = R.map($ => $.map(fn => hs => {
    if (hs.i < options.length - 1) {
      hs = {
        log: normalizeLog(R.slice(0, hs.i + 1, hs.log)),
        i: options.length - 1,
      }
    }
    return R.set(["log"], tailAppend(fn(hs.log[hs.i]), hs.log), hs)
  }), stateActions)

  let allActions = R.merge(stateActions, historyActions)

  return store(seed, allActions, {...options, cmpFn: R.F})
    .map(state => state.log[state.i])
    .distinctUntilChanged(options.cmpFn)
}

let tailAppend = R.curry((x, xs) => {
  return R.append(x, R.tail(xs))
})

// derive :: (Observable State, (State -> State)) -> Observable State
export let derive = (state, deriveFn) => {
  return state
    .map(deriveFn)
    .distinctUntilChanged()
    .shareReplay(1)
}

// obscureReducers :: Object (* -> State -> State)
export let obscureReducers = {
  // set :: State -> State -> State
  // set :: (String, a) -> State -> State
  set: args => state => {
    if (R.is(Array, args)) {
      let [path, val] = args
      return R.set(path, val, state)
    } else {
      let val = args
      return val
    }
  },

  // over :: (State -> State) -> State -> State
  // over :: (String, (a -> b)) -> State -> State
  over: args => state => {
    if (R.is(Array, args)) {
      let [path, fn] = args
      return R.over(path, fn, state)
    } else {
      let fn = args
      return fn(state)
    }
  },

  // merge :: a -> State -> State
  // merge :: (String, a) -> State -> State
  merge: args => state => {
    if (R.is(Array, args)) {
      let [path, stateFragment] = args
      return R.over(path, R.mergeFlipped(stateFragment), state)
    } else {
      let stateFragment = args
      return R.merge(state, stateFragment)
    }
  },

  // mergeDeep :: a -> State -> State
  // mergeDeep :: (String, a) -> State -> State
  mergeDeep: args => state => {
    if (R.is(Array, args)) {
      let [path, stateFragment] = args
      return R.over(path, R.mergeDeepFlipped(stateFragment), state)
    } else {
      let stateFragment = args
      return R.mergeDeep(state, stateFragment)
    }
  },
}

// obscureActions :: Object (Observable (State -> State))
export let obscureActions = R.map(reducer =>
  chan($ => $.map(reducer))
, obscureReducers)

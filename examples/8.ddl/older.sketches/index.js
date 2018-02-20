D.deriveMaybe = (query$, state$, mapFn) => {
  return D.deriveObj({
    state: state$,
    _gate: query$.map(R.isEmpty),
  },
    ({state, _gate}) =>
      _gate ? mapFn(state) : null
  )
}

D.deriveObjMaybe = (query$, state$s, mapFn) => {
  return D.deriveObj({
    _gate: query$.map(R.isEmpty),
    ...state$s,
  },
    ({_gate, ...states}) =>
      _gate ? mapFn(states) : null
  )
}


D.deriveArrMaybe = (query$, state$s, mapFn) => {
  return D.deriveArr([
    query$.map(R.isEmpty),
    ...state$s,
  ],
    (_gate, ...states) => {
      return _gate ? mapFn(...states) : null
    }
  )
}

let queryToLens = (query) => [query[0], query[1][0]]

export let deriveObj = (streamObj, mapFn) => {
  return K.combine(
    R.map($ => $.skipDuplicates(), streamObj)
  )
  .debounce(1)
  .map(mapFn)
  .skipDuplicates(R.equals)
  .toProperty()
}

D.deriveArr = (state$s, mapFn) => {
  return D.deriveObj(state$s, (args) => mapFn(...args))
}

D.deriveMaybe = (query$, state$, mapFn) => {
  return D.deriveObj({
    state: state$,
    _gate: query$.map(R.isEmpty),
  },
    ({state, _gate}) =>
      _gate ? mapFn(state) : null
  )
}

D.deriveObjMaybe = (query$, state$s, mapFn) => {
  return D.deriveObj({
    _gate: query$.map(R.isEmpty),
    ...state$s,
  },
    ({_gate, ...states}) =>
      _gate ? mapFn(states) : null
  )
}

D.deriveArrMaybe = (query$, state$s, mapFn) => {
  return D.deriveArr([
    query$.map(R.isEmpty),
    ...state$s,
  ],
    ([_gate, ...states]) =>
      _gate ? mapFn(states) : null
  )
}

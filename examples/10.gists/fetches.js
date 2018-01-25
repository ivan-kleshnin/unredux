// INTENTS
let intents = {
  fetchFoo$: sources.state$
    .map(s => R.isEmpty(R.view2(fooLens, s) || {}))
    .filter(Boolean)
    .skipDuplicates(),

  fetchBar$: sources.state$
    .map(s => R.isEmpty(R.view2(barLens, s) || {}))
    .filter(Boolean)
    .skipDuplicates(),
}

// FETCHES
let fetches = {
  foo$: intents.fetchFoo$
    .flatMapConcat(need => K.fromPromise(
      A.get(`???`).then(resp => resp["???"]).catch(R.id)
    )),

  bar$: intents.fetchBar$
    .flatMapConcat(need => K.fromPromise(
      A.get(`???`).then(resp => resp["???"]).catch(R.id)
    )),
}

// ACTIONS
fetches.foo$.map(data => {
  return function afterGET(state) {
    return data instanceof Error
      ? state
      : R.set2(fooLens, data, state)
  }
})

fetches.bar$.map(data => {
  return function afterGET(state) {
    return data instanceof Error
      ? state
      : R.set2(barLens, data, state)
  }
})

export let filterFetches = (obj) => {
  return R.pipe(
    R.toPairs,
    R.filter(([k, _]) => R.startsWith("fetch", k)),
    R.fromPairs,
  )(obj)
}

export let safeInc = R.pipe(R.defaultTo(0), R.inc)
export let safeDec = R.pipe(R.defaultTo(0), R.dec)

let actions$ = K.merge([
  K.merge(R.values(filterFetches(intents))).map(R.K(R.over2(loadingLens, safeInc))),
  K.merge(R.values(fetches)).delay(1).map(R.K(R.over2(loadingLens, safeDec))),
])

//                   | state._loading[appName] = undefined
// intents.fetchFoo$ | state._loading[appName] = 1
// intents.fetchBar$ | state._loading[appName] = 2
// fetches.bar$      | state._loading[appName] = 1
// fetches.foo$      | state._loading[appName] = 0
//

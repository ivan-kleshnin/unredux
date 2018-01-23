// FETCH
let fetchStart = {
  foo$: sources.state$
    .map(s => R.isEmpty(R.view2(fooLens, s) || {}))
    .filter(Boolean)
    .toProperty(),

  bar$: sources.state$
    .map(s => R.isEmpty(R.view2(barLens, s) || {}))
    .filter(Boolean)
    .toProperty(),
}

let fetchEnd = {
  foo$: fetchStart.foo$
    .flatMapConcat(need => {
      return K.fromPromise(need
        ? A.get(`???`).then(resp => resp["???"]).catch(R.id)
        : nullP
      )
    }),

  bar$: fetchStart.bar$
    .flatMapConcat(need => {
      return K.fromPromise(need
        ? A.get(`???`).then(resp => resp["???"]).catch(R.id)
        : nullP
      )
    }),
}

// ACTIONS
fetchEnd.foo$.map(data => {
  return function afterGET(state) {
    return data == null || data instanceof Error
      ? state
      : R.set2(fooLens, data, state)
  }
})

fetchEnd.bar$.map(data => {
  return function afterGET(state) {
    return data == null || data instanceof Error
      ? state
      : R.set2(barLens, data, state)
  }
})

let actions$ = K.merge([
  K.constant(R.set2(loadingLens, 0)),
  K.merge(R.values(fetchStart)).map(R.K(R.over2(loadingLens, R.inc))),
  K.merge(R.values(fetchEnd)).delay(1).map(R.K(R.over2(loadingLens, R.dec))),
])

// state._loading.appName = 0
// fetchStart.foo$ -> +1
// fetchStart.bar$ -> +1 | c = 2
// fetchEnd.foo$ -> -1   | c = 1
// fetchEnd.bar$ -> -1   | c = 0
// 0

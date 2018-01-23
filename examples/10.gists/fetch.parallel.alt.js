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
    .flatMapConcat(needFoo => {
      return K.fromPromise(needFoo
        ? A.get(`???`).then(resp => resp["???"]).catch(R.id)
        : nullP
      )
    }),

  bar$: fetchStart.bar$
    .flatMapConcat(needBar => {
      return K.fromPromise(needBar
        ? A.get(`???`).then(resp => resp["???"]).catch(R.id)
        : nullP
      )
    }),
}

// ACTIONS
fetchEnd.foo$.map(maybeFoo => {
  return function afterGET(state) {
    return maybeFoo == null || maybeFoo instanceof Error
      ? state
      : R.set2(fooLens, maybeFoo, state)
  }
})

fetchEnd.bar$.map(maybeBar => {
  return function afterGET(state) {
    return maybeBar == null || maybeBar instanceof Error
      ? state
      : R.set2(barLens, maybeBar, state)
  }
})

let actions$ = K.merge([
  K.constant(R.set2(loadingLens, 0)),
  R.merge(R.values(fetchStart)).map(R.K(R.over2(loadingLens, R.inc))),
  R.merge(R.values(fetchEnd)).delay(1).map(R.K(R.over2(loadingLens, R.dec))),
])

// state._loading.appName = 0
// fetchStart.foo$ -> +1
// fetchStart.bar$ -> +1 | c = 2
// fetchEnd.foo$ -> -1   | c = 1
// fetchEnd.bar$ -> -1   | c = 0
// 0

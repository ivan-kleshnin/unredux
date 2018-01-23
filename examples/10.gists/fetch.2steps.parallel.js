/**
 * Demo of parallel one-step load.
 * To abstract this code into library one'll need:
 *    1. Naming conventions for local structures
 *    2. Formalized REST API: URL and response format
 * I'm still undecided whether it's the best to abstract
 *   * fetch by the number of steps
 *   * fetchModel vs fetchModels vs __
 *   * ???
 * or even attempt to recreate GraphQL/Relay or Falcor functionality.
 * The latter two simply push a significant chunk of complexity to Backend IMO
 * and they don't support the simplest sequential fetches like:
 *  1) fetch ids of index models
 *  2) fetch models with that ids
 * due to their "declarative" natures @_@
 */

function Promise_allObj(obj) {
  return new Promise((resolve, reject) => {
    let rs = {}
    let keys = R.keys(obj)
    for (let k of keys) {
      obj[k]
        .catch(reject)
        .then(v => {
          rs.push([k, v])
          if (rs.length == keys.length) {
            resolve(R.fromPairs(rs))
          }
      })
    }
  })
}

K.fromPromiseObj = R.compose(K.fromPromise, Promise_allObj)

let anyObj = (xs) => R.any(Boolean, R.values(needs))

let nullP = Promise.resolve(null)

/**
 * Task: fetch ids, then models with that ids, with the same
 * parallel-friendly dataflow as in the previous example.
 */

// FETCH
let fetch = {}
fetch.start$ = sources.state$
  .map(s => {
    return {
      needIds: true, // or SSR-drived condition
    }
  })
  .filter(anyObj)
  .skipDuplicates(R.equals)

fetch.end$ = fetch.start$
  .flatMapConcat(({needIds}) => {
    return K.fromPromiseObj({
      maybeIds: needIds
        ? A.get(`???`).then(resp => resp["???"]).catch(R.id)
        : nullP,
    })
  })
  .combine([], [state$])
  .flatMapConcat(([{maybeIds}, state]) => {
    return K.fromPromiseObj({
      maybeModels: maybeIds == null || maybeIds instanceof Error
        ? maybeIds
        : do {
          let presentIds = R.keys(R.view2(baseLens, state))
          let missingIds = R.difference(maybeIds, presentIds)
          A.get(`???`).then(resp => resp["???"]).catch(R.id)
        },
    })
  })

// ACTIONS
fetch.end$.map(({maybeModels}) => {
  return function afterGET(state) {
    return R.pipe(
      maybeModels == null || maybeModels instanceof Error
        ? R.id
        : R.set2(metaLens, maybeMeta),
    )(state)
  }
})

fetch.start$.map(R.K(R.set2(loadingLens, true)))
fetch.end$.delay(1).map(R.K(R.set2(loadingLens, false)))

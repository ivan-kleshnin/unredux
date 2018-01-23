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
  let keys = R.keys(obj)
  let resolveP, rejectP
  let rs = []
  for (let k of keys) {
    let p = obj[k]
    p
      .catch(rejectP)
      .then(v => {
        rs.push([k, v])
        if (rs.length == keys.length) {
          resolveP(R.fromPairs(rs))
        }
    })
  }
  return new Promise((resolve, reject) => {
    resolveP = resolve
    rejectP = reject
  })
}

K.fromPromiseObj = R.compose(K.fromPromise, Promise_allObj)

let anyObj = (xs) => R.any(Boolean, R.values(needs))

let nullP = Promise.resolve(null)

/**
 * Task: fetch foo, bar, baz in parallel
 */

// FETCH
let fetch = {}
fetch.start$ = sources.state$
  .map(s => {
    let foo = R.view2(fooLens, s) || {}
    let bar = R.view2(barLens, s) || {}
    let baz = R.view2(bazLens, s) || {}
    return {
      needFoo: R.isEmpty(foo),
      needBar: R.isEmpty(bar),
      needBaz: R.isEmpty(baz),
    }
  })
  .filter(anyObj)
  .skipDuplicates(R.equals)

fetch.end$ = fetch.start$
  .flatMapConcat(({needFoo, needBar, needBaz}) => {
    return K.fromPromiseObj({
      maybeFoo: needFoo
        ? A.get(`???`).then(resp => resp["???"]).catch(R.id)
        : nullP,

      maybeBar: needBar
        ? A.get(`???`).then(resp => resp["???"]).catch(R.id)
        : nullP,

      maybeBaz: needBaz
        ? A.get(`???`).then(resp => resp["???"]).catch(R.id)
        : nullP,
    })
  })

// ACTIONS
fetch.end$.map(({maybeFoo, maybeBar, maybeBaz}) => {
  return function afterGET(state) {
    return R.pipe(
      maybeFoo == null || maybeFoo instanceof Error
        ? R.id
        : R.set2(fooLens, maybeFoo),

      maybeBar == null || maybeBar instanceof Error
        ? R.id
        : R.set2(barLens, maybeBar),

      maybeBaz == null || maybeBaz instanceof Error
        ? R.id
        : R.set2(bazLens, maybeBaz),
    )(state)
  }
})

fetch.start$.map(R.K(R.set2(loadingLens, true)))
fetch.end$.delay(1).map(R.K(R.set2(loadingLens, false)))

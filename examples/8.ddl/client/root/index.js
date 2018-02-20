import * as R from "@paqmind/ramda"
import A from "axios"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import U from "urlz"
import * as B from "../blueprints"
import * as F from "../framework"
import router from "../router"
import {
  isModelsQuery, isIndexQuery,
  collapseModelsQueries, collapseIndexQueries,
  whatAreMissing, whatIsMissing,
} from "../ddl"

// SEED
export let seed = {
  // DOCUMENT
  url: "",

  // DATA
  tables: {
    posts: {
      // "f7f169a537": {id: "f7f169a537", title: "Fluent API debunked"}, //, userId: "94243b11b1"
    },

    users: {
      // "94243b11b1": {id: "94243b11b1"}, // , fullname: "Jack"
    },
  },

  indexes: {
    // "foo": {},
    // "bar": {},
  },

  // META
  loading: {},
}

export default (sources, key) => {
  let url$ = D.derive(sources.state$, ["url"])

  // ROUTING ---------------------------------------------------------------------------------------
  let contentSinks$ = url$
    .filter(Boolean)
    .map(url => {
      let {mask, params, payload: app} = router.doroute(url)
      let sinks = app({...sources, props: {mask, params, router}})
      return R.merge({action$: K.never(), load$: K.never()}, sinks)
    })

  // INTENTS
  let intents = {
    navigateTo$: sources.DOM.from("a").listen("click")
      .filter(ee => !ee.element.dataset.ui)
      .flatMapConcat(ee => {
        let urlObj = U.parse(ee.element.href)
        if (urlObj.protocol && urlObj.host != document.location.host) {
          // External link
          return K.never()
        } else {
          // Internal link
          if (urlObj.pathname == document.location.pathname && urlObj.hash) {
            // Anchor link
            // do nothing, rely on default browser behavior
          } else {
            // Page link or Reset-Anchor link (foo#hash -> foo)
            ee.event.preventDefault() // take control on browser
            window.scrollTo(0, 0)     //
          }
          window.history.pushState({}, "", urlObj.relHref)
          return K.constant(urlObj.relHref)
        }
      }),

    navigateHistory$: D.isBrowser
      ? K.fromEvents(window, "popstate")
          .map(data => U.relHref(document.location.href)) // TODO scroll to hash (how?!)
      : K.never()
  }

  // LOAD
  let _load$ = K.pool()
  let load$ = K.merge([
    _load$,
    contentSinks$.flatMapLatest(x => x.load$)
  ]).filter(R.length) // --mq1--mq2--mq3--iq1-->

  /// Trying to deprecate this /////////////////////////////////////////////////////////////////////
  // let load$ = contentSinks$.flatMapLatest(x => x.load$).filter(R.length) // --[mq1, mq2]--[mq3]--[iq1]-->

  // TODO consider removal of this step and requiring to load: --mq1--mq2--mq3--iq1--> instead
  // Spread multiple queries into a stream
  // let rawQuery$ = load$.flatMap(F.spread) // --mq1--mq2--mq3--iq1-->
  //////////////////////////////////////////////////////////////////////////////////////////////////

  // Buffer queries for 100ms, up to 20 items per buffer
  let rawModelsQueries$ = load$.filter(isModelsQuery).bufferWithTimeOrCount(100, 20).filter(R.length) // --[mq1, mq2, mq3]-->
  let rawIndexQueries$ = load$.filter(isIndexQuery).bufferWithTimeOrCount(100, 20).filter(R.length)   // --[iq1]-->

  // Collapse the collapsible queries
  let collapsedModelsQueries$ = rawModelsQueries$.map(collapseModelsQueries) // --[mq1, mq3]-->
  let collapsedIndexQueries$ = rawIndexQueries$.map(collapseIndexQueries)    // --[iq1]-->

  // Spread all collapsed queries into a stream
  let modelsQuery$ = collapsedModelsQueries$.flatMap(F.spread) // --mq1--mq3-->
  let indexQuery$ = collapsedIndexQueries$.flatMap(F.spread)   // --iq1-->

  let fetchModelsIntent$ = sources.state$.sampledBy(modelsQuery$, (state, query) => {
    return whatIsMissing(query, state)[0] // TODO ugly API
  }).filter(R.length)

  let fetchIndexIntent$ = indexQuery$ // TODO first render after SSR should be prevented here (possibly)

  let fetchModels$ = fetchModelsIntent$.flatMapConcat(query => {
    let [tableName, ids, fields] = query
    let apiURL = fields.length
       ? `/api/${tableName}/${R.join(",", ids)}/${R.join(",", fields)}/`
       : `/api/${tableName}/${R.join(",", ids)}/`
    return K.fromPromise(
      A.get(apiURL)
        .then(resp => resp.data.models)
        .catch(R.id)
        .then(resp => ({query, resp}))
    )
  })

  let fetchIndex$ = fetchIndexIntent$.flatMapConcat(query => {
    let [tableName, cond, fields] = query
    // TODO filters, sort
    let apiURL = fields.length
      ? `/api/${tableName}/${cond.offset}~${cond.limit}/${R.join(",", fields)}/`
      : `/api/${tableName}/${cond.offset}~${cond.limit}/`
    return K.fromPromise(
      A.get(apiURL)
        .then(resp => R.pluck("id", resp.data.models))
        .catch(R.id)
        .then(resp => ({query, resp}))
    )
  })

  let loadAction$ = K.merge([
    fetchModelsIntent$.map(([tableName, ..._]) => R.over2(["loading", tableName], B.safeInc)),
    fetchIndexIntent$.map(([tableName, ..._]) => R.over2(["loading", tableName], B.safeInc)),

    fetchModels$.map(({query, resp}) => function afterModelsGET(state) {
      let [tableName, ids, fields] = query
      // console.log("afterModelsGET!")
      if (resp instanceof Error) {
        return R.pipe(
          R.over2(["loading", tableName], B.safeDec),
          // raise popups here
        )(state)
      } else {
        let models = resp
        return R.pipe(
          R.over2(["tables", tableName], R.mergeDeepFlipped(models)),
          R.over2(["loading", tableName], B.safeDec),
        )(state)
      }
    }),

    fetchIndex$.map(({query, resp}) => function afterIndexGET(state) {
      let [tableName, cond, fields] = query
      // console.log("afterIndexGET!")
      if (resp instanceof Error) {
        return R.pipe(
          R.over2(["loading", tableName], B.safeDec),
          // raise popups here
        )(state)
      } else {
        let ids = resp
        let models = R.fromPairs(R.zip(ids, ids.map(id => ({id}))))
        // _load$.plug(K.constant([tableName, ids, fields])) // side-effect: auto load initialization!
        return R.pipe(
          R.over2(["tables", tableName], R.mergeDeepFlipped(models)),
          R.over2(["indexes", B.hashIndexQuery(query)], B.updateIndex(cond.offset, ids)),
          R.over2(["loading", tableName], B.safeDec),
        )(state)
      }
    })
  ])

  // STATE -----------------------------------------------------------------------------------------
  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key, input: false, output: true}),
  )(
    // Init
    // D.init(seed),
    D.initAsync(sources.state$),

    // Navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set2("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set2("url", url))),

    // Content
    contentSinks$.flatMapLatest(x => x.action$),

    // Load
    loadAction$,
  ).$

  // COMPONENT -------------------------------------------------------------------------------------
  let Component = F.connect2(
    {
      url: url$,
      Content: contentSinks$.map(x => x.Component),
    },
    ({url, Content}) => {
      return <div>
        <div className="page-content">
          <Content/>
        </div>
      </div>
    }
  )

  return {state$, Component}
}

import * as R from "@paqmind/ramda"
import A from "axios"
import {connect, derive, isolate, spread} from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import Route from "route-parser"
import U from "urlz"
import {
  collapseModelsQueries, collapseIndexQueries,
  desugarModelsQuery, desugarIndexQuery,
  isModelsQuery, isIndexQuery,
  hashIndexQuery, makeGlobalIndex,
  safeInc, safeDec,
  whatIsMissingByMQ, whatIsMissingByIQ,
} from "../blueprints"
import router from "../router"

// SEED
export let seed = {
  // DOCUMENT
  url: "",

  // DATA
  tables: {
    // Testing scenarios (all isolated from each other)
    "0a/posts": {},
    "0a/users": {},

    "0b/posts": {},
    "0b/users": {},

    "1a/posts": {},
    "1a/users": {},

    "2a/posts": {},
    "2a/users": {},

    "3a/posts": {},
    "3a/users": {},

    "4a/posts": {},
    "4a/users": {},

    "4b/posts": {},
    "4b/users": {},

    "5a/posts": {},
    "5a/users": {},

    "5b/posts": {},
    "5b/users": {},

    "6a/posts": {},
    "6a/users": {},

    "7/posts": {},
    "7/users": {},
  },

  indexes: {
    // e.g.
    // "posts.null.null": {ids: {}, total: null},
    // "users.null.null": {ids: {}, total: null},
  },

  // META
  loading: {},
}

export default (sources, key) => {
  let url$ = derive(sources.state$, "url")

  // ROUTING
  let contentSinks$ = url$
    .filter(Boolean)
    .map(url => {
      let {mask, params, payload: app} = router.doroute(url)
      app = isolate(app, key + mask, ["DOM", "Component"])
      let sinks = app({...sources, props: {mask, params, router}})
      return R.merge({action$: K.never(), load$: K.never()}, sinks)
    })

  // INTENTS
  let intents = {
    navigateTo$: sources.DOM.from("a").listen("click")
      .filter(ee => !ee.element.dataset.ui) // skip <a data-ui .../> links
      .flatMapConcat(ee => {
        let urlObj = U.parse(ee.element.href)
        if (urlObj.protocol && urlObj.host != document.location.host) {
          // External link
          return K.never()
        }
        else if (ee.event.shiftKey || navigator.platform.match("Mac") ? ee.event.metaKey : ee.event.ctrlKey) {
          // Holding Shift or Ctrl/Cmd
          return K.never()
        }
        else {
          // Internal link
          if (urlObj.pathname == document.location.pathname && urlObj.hash) {
            // Anchor link
            // do nothing, rely on default browser behavior
          } else {
            // Page link or Reset-Anchor link (foo#hash -> foo)
            ee.event.preventDefault() // take control of browser
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
  let load$ = contentSinks$.flatMapLatest(x => x.load$).filter(R.length)
    .skipDuplicates(R.equals) // --mq1--mq2--mq3--iq1-->

  // Buffer queries for 100ms, up to 20 items per buffer
  let rawModelsQueries$ = load$
    .filter(isModelsQuery)
    .map(([tableName, ids, fields]) =>
      [tableName, R.filter(Boolean, ids), R.filter(Boolean, fields)]
    )
    .filter(([tableName, ids, fields]) =>
      tableName && ids.length && fields.length
    )
    .map(desugarModelsQuery)
    .bufferWithTimeOrCount(100, 20)
    .filter(R.length) // --[mq1, mq2, mq3]-->

  let rawIndexQueries$ = load$
    .filter(isIndexQuery)
    .map(desugarIndexQuery)
    .bufferWithTimeOrCount(100, 20)
    .filter(R.length) // --[iq1]-->

  // Collapse the collapsible queries
  let collapsedModelsQueries$ = rawModelsQueries$.map(collapseModelsQueries) // --[mq1, mq3]-->
  let collapsedIndexQueries$ = rawIndexQueries$.map(collapseIndexQueries)    // --[iq1]-->

  // Spread all collapsed queries into a stream
  let modelsQuery$ = collapsedModelsQueries$.flatMap(spread) // --mq1--mq3-->
  let indexQuery$ = collapsedIndexQueries$.flatMap(spread)   // --iq1-->

  let fetchModelsIntent$ = sources.state$.sampledBy(modelsQuery$, whatIsMissingByMQ).filter(R.length)

  let fetchIndexIntent$ = sources.state$.sampledBy(indexQuery$, whatIsMissingByIQ).filter(R.length)

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
    let [tableName, cond] = query
    let apiURL = `/api/${tableName}/${cond.offset}~${cond.limit}/id/`
    return K.fromPromise(
      A.get(apiURL, {params: {filters: cond.filters, sort: cond.sort}}) // TODO test
        .then(({data}) => ({ids: R.pluck("id", data.models), total: data.total}))
        .catch(R.id)
        .then(resp => ({query, resp}))
    )
  })

  let loadAction$ = K.merge([
    fetchModelsIntent$.map(([tableName, ..._]) => R.over2(["loading", tableName], safeInc)),
    fetchIndexIntent$.map(([tableName, ..._]) => R.over2(["loading", tableName], safeInc)),

    fetchModels$.map(({query, resp}) => function afterModelsGET(state) {
      let [tableName, ids, fields] = query
      if (resp instanceof Error) {
        return R.pipe(
          R.over2(["loading", tableName], safeDec),
          // raise popups here
        )(state)
      } else {
        let models = resp // R.fromPairs(R.zip(ids, R.map(id => resp[id] || null, ids)))
        return R.pipe(
          R.over2(["tables", tableName], R.mergeDeepFlipped(models)),
          R.over2(["loading", tableName], safeDec),
        )(state)
      }
    }),

    fetchIndex$.map(({query, resp}) => function afterIndexGET(state) {
      let [tableName, {offset}, fields] = query
      if (resp instanceof Error) {
        return R.pipe(
          R.over2(["loading", tableName], safeDec),
          // raise popups here
        )(state)
      } else {
        let {ids, total} = resp
        let models = R.fromPairs(R.zip(ids, R.map(id => ({id}), ids)))
        let indexKey = hashIndexQuery(query)
        return R.pipe(
          R.over2(["tables", tableName], R.mergeDeepFlipped(models)),
          R.over2(["indexes", indexKey], R.defaultTo({table: {}, total: 0})),
          R.over2(["indexes", indexKey], R.mergeDeepFlipped(makeGlobalIndex(offset, resp))),
          R.over2(["loading", tableName], safeDec),
        )(state)
      }
    })
  ])

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key, input: false, output: true}),
  )(
    // Init
    D.init(seed),
    D.initAsync(sources.state$),

    // Navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set2("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set2("url", url))),

    // Content
    contentSinks$.flatMapLatest(x => x.action$),

    // Load
    loadAction$,
  ).$

  // COMPONENT
  let Component = connect(
    {
      url: url$,
      Content: contentSinks$.map(x => x.Component),
    },
    ({url, Content}) => {
      return <div>
        {new Route("/").match(U.pathname(url))
          ? null
          : <p><a href="/">Back to Home</a></p>
        }
        <div className="page-content">
          <Content/>
        </div>
      </div>
    }
  )

  return {state$, Component}
}

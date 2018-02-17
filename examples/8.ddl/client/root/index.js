import * as R from "@paqmind/ramda"
import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import U from "urlz"
import MainMenu from "../common/MainMenu"
import router from "../router"
import * as B from "../blueprints"
import {
  isModelsQuery, isIndexQuery,
  collapseModelsQueries, collapseIndexQueries,
  whatsMissing,
} from "../ddl"

let connect = F.connect(() => "Root.NoData", () => "Root.Loading")

// SEED
export let seed = {
  // DOCUMENT
  url: "/posts/f7f169a537/",

  // DATA
  posts: {
    "f7f169a537": {id: "f7f169a537", title: "Fluent API debunked"}, //, userId: "94243b11b1"
  },

  users: {
    "94243b11b1": {id: "94243b11b1"}, // , fullname: "Jack"
  },

  // META
  _loading: {},
}

export default (sources, key) => {
  let urlLens = ["url"]

  let url$ = D.derive(sources.state$, urlLens)

  // ROUTING ---------------------------------------------------------------------------------------
  let contentSinks$ = url$
    .map(url => {
      let {mask, params, payload: app} = router.doroute(url)
      app = F.isolate(app, key + mask, ["DOM", "Component"])
      let sinks = app({...sources, props: {mask, params, router}})
      return R.merge({action$: K.never()}, sinks)
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
  /**
   * idsNeed = {
   *   posts: {
   *     ids: ["f7f169a537"],
   *   },
   * }
   *
   * indexNeed = {
   *   posts: {
   *     offset:0, limit: 10,
   *   },
   * }
   */

  let spread = (xs) => K.sequentially(0, xs)

  let load$ = contentSinks$.flatMapLatest(x => x.load$).filter(R.length) // --[mq1, mq2]--[mq3]--[iq1]-->

  // Spread multiple queries into a stream
  let rawQuery$ = load$.flatMap(spread) // --mq1--mq2--mq3--iq1-->

  // Buffer queries for half a second, up to 20 items per buffer
  let rawModelsQueries$ = rawQuery$.filter(isModelsQuery).bufferWithTimeOrCount(500, 20).filter(R.length) // --[mq1, mq2, mq3]-->
  let rawIndexQueires$ = rawQuery$.filter(isIndexQuery).bufferWithTimeOrCount(500, 20).filter(R.length)   // --[iq1]-->

  // Collapse the collapsible queries
  let collapsedModelsQueries$ = rawModelsQueries$.map(collapseModelsQueries) // --[mq1, mq3]-->
  let collapsedIndexQueries$ = rawIndexQueires$.map(collapseIndexQueries)    // --[iq1]-->

  // Spread all collapsed queries into a stream
  let modelsQuery$ = collapsedModelsQueries$.flatMap(spread) // --mq1--mq3-->
  let indexQuery$ = collapsedIndexQueries$.flatMap(spread)   // --iq1-->

  let fetchModelsIntent$ = sources.state$.sampledBy(modelsQuery$, (state, query) => {
    return whatsMissing([query], state)[0] // TODO ugly API
  }).filter(R.length)

  let fetchIndexIntent$ = indexQuery$ // TODO first render after SSR should be prevented here (possibly)

  let fetchModels$ = fetchModelsIntent$.flatMap(([tableName, ids, fields]) => {
    // TODO fields
    let apiURL = fields.length
       ? `/api/${tableName}/${R.join(",", ids)}/${R.join(",", fields)}/`
       : `/api/${tableName}/${R.join(",", ids)}/`
    return K.fromPromise(
      A.get(apiURL).then(resp => [tableName, resp.data.models, fields]).catch(R.id)
    )
  })

  let fetchIndex$ = fetchIndexIntent$.flatMap(([tableName, cond, fields]) => {
    // TODO cond
    let apiURL = fields.length
      ? `/api/${tableName}/~/${R.join(",", fields)}/`
      : `/api/${tableName}/~/`
    return K.fromPromise(
      A.get(apiURL).then(resp => [tableName, R.pluck("id", resp.data.models), fields]).catch(R.id)
    )
  })

  let loadAction$ = K.merge([
    fetchModelsIntent$.map(([tableName, ..._]) => R.over2(["_loading", tableName], B.safeInc)),
    fetchModels$.delay(1).map(([tableName, ..._]) => R.over2(["_loading", tableName], B.safeDec)),

    fetchIndexIntent$.map(([tableName, ..._]) => R.over2(["_loading", tableName], B.safeInc)),
    fetchIndex$.delay(1).map(([tableName, ..._]) => R.over2(["_loading", tableName], B.safeDec)),

    fetchModels$.map(([tableName, maybeModels, _]) => function afterGETAuto(state) {
      // console.log("afterGETAuto! maybeModels:", maybeModels)
      if (maybeModels instanceof Error) {
        return state // you can raise a popup warning here
      } else {
        return R.over2(tableName, R.mergeDeepFlipped(maybeModels), state)
      }
    }),

    fetchIndex$.map(([tableName, maybeIds, _]) => function afterGETAuto(state) {
      console.log("maybeIds:", maybeIds)
      if (maybeIds instanceof Error) {
        return state // you can raise a popup warning here
      } else {
        let maybeModels = R.fromPairs(R.zip(maybeIds, maybeIds.map(id => ({id}))))
        return R.over2(tableName, R.mergeDeepFlipped(maybeModels), state)
      }
    })
  ])

  // STATE -----------------------------------------------------------------------------------------
  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    // Init
    D.init(seed),
    // D.initAsync(sources.state$),

    // Navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set2("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set2("url", url))),

    // Content
    contentSinks$.flatMapLatest(x => x.action$),

    // Load
    loadAction$,
  ).$

  // COMPONENT -------------------------------------------------------------------------------------
  let Component = connect(
    {
      url: url$,
      Content: contentSinks$.map(x => x.Component),
    },
    ({url, Content}) => {
      return <div>
        <div className="page-header">
          <p>
            Current URL: {url}
          </p>
          <MainMenu/>
        </div>
        <div className="page-content">
          <Content/>
        </div>
      </div>
    }
  )

  return {state$, Component}
}

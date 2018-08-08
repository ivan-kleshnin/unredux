import {connect, derive, deriveObj} from "vendors/framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {fetchJSON} from "common/helpers"
import {makeFilterFn, makeSortFn} from "common/home"
import {incLoading, decLoading} from "../blueprints"
import PostIndex from "./PostIndex"

// SEED
export let seed = {
  filters: {
    id: "",
    title: "",
    tags: "",
    isPublished: false,
    publishDateFrom: "",
    publishDateTo: "",
  },
  sort: "+id",
}

export default (sources, {key, params}) => {
  let baseLens = ["posts"]
  let loadingLens = ["loading"]

  let deriveState = derive(sources.state$.throttle(50))
  let posts$ = deriveState(baseLens)
  let loading$ = deriveState(loadingLens).map(Boolean)

  // INTENTS
  let intents = {
    // DOM
    changeFilterId$: sources.DOM.fromName("filters.id").listen("input")
      .map(ee => ee.element.value),

    changeFilterTitle$: sources.DOM.fromName("filters.title").listen("input")
      .map(ee => ee.element.value),

    changeFilterTags$: sources.DOM.fromName("filters.tags").listen("input")
      .map(ee => ee.element.value),

    changeFilterIsPublished$: sources.DOM.fromName("filters.isPublished").listen("click")
      .map(ee => ee.element.checked),

    changeFilterPublishDateFrom$: sources.DOM.fromName("filters.publishDateFrom").listen("input")
      .map(ee => ee.element.value),

    changeFilterPublishDateTo$: sources.DOM.fromName("filters.publishDateTo").listen("input")
      .map(ee => ee.element.value),

    changeSort$: sources.DOM.fromName("sort").listen("click")
      .map(ee => ee.element.value),
  }

  // STATE
  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    // Init
    D.init(seed),

    // Form
    intents.changeFilterId$.map(x => R.set2(["filters", "id"], x)),
    intents.changeFilterTitle$.map(x => R.set2(["filters", "title"], x)),
    intents.changeFilterTags$.map(x => R.set2(["filters", "tags"], x)),
    intents.changeFilterIsPublished$.map(x => R.set2(["filters", "isPublished"], x)),
    intents.changeFilterPublishDateFrom$.map(x => R.set2(["filters", "publishDateFrom"], x)),
    intents.changeFilterPublishDateTo$.map(x => R.set2(["filters", "publishDateTo"], x)),

    intents.changeSort$.map(x => R.set2("sort", x)),
  ).$

  let indexPosts$ = deriveObj(
    {
      index: index$.debounce(200),
      table: posts$,
    },
    ({index, table}) => {
      if (!table) return null
      let filterFn = makeFilterFn(index.filters)
      let sortFn = makeSortFn(index.sort)
      return R.pipe(
        R.values,
        R.filter(filterFn),
        R.sort(sortFn),
      )(table)
    }
  )

  // COMPONENT
  let Component = connect(
    {
      index: index$,
      posts: indexPosts$,
      loading: loading$,
    },
    PostIndex
  )

  // ACTIONS
  let action$ = K.merge([
    posts$
      .filter(posts => {
        // Use local `offset` and `limit` here to detect missing posts
        return !posts || R.keys(posts).length < 12
      })
      .flatMapConcat(posts => K.stream(async (emitter) => {
        // We intentionally use special loading strategy here to demonstrate how 2+ requests will
        // interoperate. Check 8.dll example for more conventional fetching and caching approach.
        // Here we always fetch ids and then models if necessary.
        emitter.value(function fetchStarted(state) {
          return incLoading(state)
        })

        let reqResult = await fetchJSON(`/api/posts/~/id/`)
        if (reqResult instanceof Error) {
          console.warn(reqResult.message)
          emitter.value(function fetchFailed(state) {
            // + Set your custom alerts here
            return decLoading(state)
          })
        } else {
          let ids = R.pluck("id", reqResult.models)
          let missingIds = R.difference(ids, R.keys(posts))
          if (missingIds.length) {
            let reqResult2 = await fetchJSON(`/api/posts/${R.join(",", missingIds)}/`)
            if (reqResult2 instanceof Error) {
              console.warn(reqResult2.message)
              // + Set your custom alerts here
              emitter.value(function fetchFailed(state) {
                return decLoading(state)
              })
            } else {
              let {models: posts, total} = reqResult2
              emitter.value(function fetchSucceeded(state) {
                return R.pipe(
                  R.over2(["posts"], R.mergeFlipped(posts)),
                  decLoading,
                )(state)
                // TODO total
              })
            }
          } else {
            emitter.value(function fetchSucceeded(state) {
              return decLoading(state)
            })
          }
        }

        return emitter.end()
      })),

    K.constant(function initPage(state) {
      return R.set2(["document", "title"], `Home`, state)
    }),
  ])

  return {Component, action$}
}

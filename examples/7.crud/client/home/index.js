import * as R from "@paqmind/ramda"
import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/home"
import * as B from "../blueprints"
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

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts"]
  let loadingLens = ["_loading", key]

  let loading$ = D.deriveOne(sources.state$, loadingLens).map(Boolean)

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

    fetch: {
      base$: do {
        if (D.isBrowser && key in window.state._loading) { // If there was SSR, skip,
          delete window.state._loading[key]                // but only once.
          K.never()
        } else {
          K.constant(true)
        }
      }
    }
  }

  // FETCHES
  let fetches = {
    base$: intents.fetch.base$
      .flatMapConcat(_ => K.fromPromise(
        A.get(`/api/${baseLens[0]}/~/id/`)
         .then(resp => R.pluck("id", resp.data.models))
         .catch(R.id)
      ))
      .flatMapConcat(maybeIds => {
        return maybeIds instanceof Error
          ? K.constant(maybeIds)
          : sources.state$.take(1)
              .map(s => R.keys(R.view2(baseLens, s)))
              .map(R.difference(maybeIds))
              .flatMapConcat(needIds => {
                return needIds.length
                  ? K.fromPromise(
                      A.get(`/api/${baseLens[0]}/${R.join(",", needIds)}/`)
                       .then(resp => resp.data.models)
                       .catch(R.id)
                    )
                  : K.constant({})
              })
      })
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

  let posts$ = D.derive(
    {
      table: sources.state$.map(s => s.posts),
      index: index$.debounce(200),
    },
    ({table, index}) => {
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
  let Component = F.connect(
    {
      loading: loading$,
      index: index$,
      posts: posts$,
    },
    PostIndex
  )

  // ACTION
  let action$ = K.merge([
    fetches.base$
      .map(maybeModels => function afterGET(state) {
        return maybeModels instanceof Error
          ? state
          : R.over2(baseLens, R.mergeFlipped(maybeModels), state)
      }),

    K.merge(R.values(intents.fetch)).map(R.K(R.over2(loadingLens, B.safeInc))),
    K.merge(R.values(fetches)).delay(1).map(R.K(R.over2(loadingLens, B.safeDec))),
  ])

  return {Component, action$}
}

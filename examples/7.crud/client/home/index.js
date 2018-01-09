import * as R from "@paqmind/ramda"
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

  // FETCH
  let fetchStart$ = do {
    if (D.isBrowser && key in window.state._loading) { // If there was SSR, skip,
      delete window.state._loading[key]                // but only once.
      K.never()
    } else {
      K.constant(true)
    }
  }

  let fetchEnd$ = fetchStart$
    .thru(B.fetchIds(baseLens))
    .thru(B.postFetchIds(baseLens, sources.state$))
    .thru(B.fetchModels(baseLens))

  // STATE
  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(seed),

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
      loading: D.deriveOne(sources.state$, ["_loading", key]),
      index: index$,
      posts: posts$,
    },
    PostIndex
  )

  // ACTION (external)
  let action$ = K.merge([
    fetchEnd$
      .thru(B.postFetchModels(baseLens)),

    fetchStart$.map(_ => R.set2(["_loading", key], true)),
    fetchEnd$.delay(1).map(_ => R.set2(["_loading", key], false)),
  ])

  return {Component, action$}
}

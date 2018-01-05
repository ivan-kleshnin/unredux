import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/home"
import * as B from "../blueprints"
import Loading from "../common/Loading"
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
  loading: false,
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

  // HTTP
  let prefetchStart$ = K.constant(true).toProperty()

  let prefetchEnd$ = prefetchStart$
    .thru(B.fetchIds(baseLens))

  let fetchStart$ = sources.state$
    .sampledBy(prefetchEnd$, (state, requiredIds) => {
      let presentIds = R.keys(R.view(baseLens, state))
      let missingIds = R.difference(requiredIds, presentIds)
      return missingIds
    })
    .filter(R.length)

  let fetchEnd$ = fetchStart$
    .thru(B.fetchModels(baseLens))

  // STATE
  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(seed),

    intents.changeFilterId$.map(x => R.set(["filters", "id"], x)),
    intents.changeFilterTitle$.map(x => R.set(["filters", "title"], x)),
    intents.changeFilterTags$.map(x => R.set(["filters", "tags"], x)),
    intents.changeFilterIsPublished$.map(x => R.set(["filters", "isPublished"], x)),
    intents.changeFilterPublishDateFrom$.map(x => R.set(["filters", "publishDateFrom"], x)),
    intents.changeFilterPublishDateTo$.map(x => R.set(["filters", "publishDateTo"], x)),

    intents.changeSort$.map(x => R.set("sort", x)),

    D.ifBrowser(
      K.merge([
        prefetchStart$.skip(1), prefetchEnd$.skip(1).delay(1),
        fetchStart$, fetchEnd$.delay(1)
       ]).map(_ => R.over(["loading"], R.not))
    ),
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
      index: index$,
      posts: posts$,
    },
    ({index, posts}) => index.loading
      ? <Loading/>
      : <PostIndex index={index} posts={posts}/>
  )

  // ACTION (external)
  let action$ = K.merge([
    fetchEnd$
      .thru(B.postFetchModels(baseLens)),
  ])

  return {Component, action$}
}

import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/home"
import PostIndex from "./PostIndex"

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

  let intents = {
    // HTTP
    fetch$: sources.state$.sampledBy(K
      .fromPromise(A.get("/api/posts/~/id").then(resp => resp.data.models))
      .map(models => R.pluck("id", models)),
      (state, requiredIds) => {
        let presentIds = R.keys(R.view(baseLens, state))
        let missingIds = R.difference(requiredIds, presentIds)
        return missingIds
      })
      .filter(R.length)
      .flatMapConcat(ids => K
        .fromPromise(A.get(`/api/posts/${R.join(",", ids)}`))
        .map(resp => resp.data.models)
      ),

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

  let Component = F.connect(
    {
      index: index$,
      posts: posts$,
    },
    PostIndex,
  )

  let action$ = K.merge([
    intents.fetch$.map(posts => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(posts), state)
      }
    }).flatMapErrors(err => {
      console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
      return K.never() // TODO add alert box
    }),
  ])

  return {Component, action$}
}

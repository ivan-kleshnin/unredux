import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/home"
import PostIndex from "./PostIndex"

///
let smartDebounce = (time) => ($) =>
  O.merge($.take(1), $.skip(1).debounceTime(time))
///

export let seed = {
  filter: {
    id: "",
    title: "",
    tags: "",
    isPublished: false,
  },
  sort: "+id",
}

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts"]

  let intents = {
    // HTTP
    fetch$: sources.state$.sampledBy(K
      .fromPromise(A.get("/api/posts/~/id"))
      .map(resp => R.pluck("id", resp.data.models))
      .mapErrors(err => {
        console.warn(err) // TODO
        return K.never()
      }),
      (state, requiredIds) => {
        let presentIds = R.keys(R.view(baseLens, state))
        let missingIds = R.difference(requiredIds, presentIds)
        return missingIds
      })
      .filter(R.length)
      .flatMapLatest(ids => K.fromPromise(A.get(`/api/posts/${R.join(",", ids)}`)))
      .map(resp => resp.data.models)
      .mapErrors(err => {
        console.warn(err) // TODO
        return K.never()
      }),

    // DOM
    changeFilterId$: sources.DOM.fromName("filter.id").listen("input")
      .map(ee => ee.element.value),

    changeFilterTitle$: sources.DOM.fromName("filter.title").listen("input")
      .map(ee => ee.element.value),

    changeFilterTags$: sources.DOM.fromName("filter.tags").listen("input")
      .map(ee => ee.element.value),

    changeFilterIsPublished$: sources.DOM.fromName("filter.isPublished").listen("click")
      .map(ee => ee.element.checked),

    changeSort$: sources.DOM.fromName("sort").listen("click")
      .map(ee => ee.element.value),
  }

  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(seed),

    intents.changeFilterId$.map(x => R.set(["filter", "id"], x)),
    intents.changeFilterTitle$.map(x => R.set(["filter", "title"], x)),
    intents.changeFilterTags$.map(x => R.set(["filter", "tags"], x)),
    intents.changeFilterIsPublished$.map(x => R.set(["filter", "isPublished"], x)),

    intents.changeSort$.map(x => R.set("sort", x)),
  ).$.debounce(200)

  let posts$ = D.derive(
    {
      table: sources.state$.map(s => s.posts),
      index: index$,
    },
    ({table, index}) => {
      let sortFn = makeSortFn(index.sort)
      let filterFn = makeFilterFn(index.filter)
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
    }),
  ])

  return {Component, action$}
}

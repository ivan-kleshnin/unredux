import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/home"
import {whatsMissing} from "../ddl"
import PostIndex from "./PostIndex"

let queryToLens = (query) => [query[0], query[1][0]]

let postQueryFn = (params) => ["posts", [params.id], ["id", "title", "userId"]]
let userQueryFn = (post) =>  ["users", [post.userId], ["id", "fullname"]]

let connect = F.connect(() => "NoData", () => "Loading")

let deriveQueryAndData = (state$, dep$s, queryFn, dataFn) => {
  let deps$ = D.deriveObj(dep$s, R.id)

  let query$ = state$
    .sampledBy(deps$, (state, deps) => {
      // console.log("eval query$")
      return R.any(R.isNil, deps)
        ? []
        : whatsMissing(queryFn(...deps), state)
    })
    .toProperty()

  let data$ = state$
    .sampledBy(deps$, Array.of)
    .combine(query$.map(R.isEmpty))
    .debounce(1) // suppress extra events from a diamond case
    .map(([[state, deps], gate]) => {
      return !gate || R.any(R.isNil, deps)
        ? null
        : dataFn(...deps)
    })
    .skipDuplicates() // suppress consequent null events
    .toProperty()

  return [query$.filter(R.length), data$]
}

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
  let loadingLens1 = ["_loading", "posts"] // TODO try Traversals from partial.lenses
  let loadingLens2 = ["_loading", "users"] // |

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

  // DATA & LOAD
  let loading$ = K.combine([
    D.derive(sources.state$, loadingLens1),
    D.derive(sources.state$, loadingLens2),
  ]).map(R.any(Boolean))

  // STATE
  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    // Init
    D.init(seed),

    // Form
    // intents.changeFilterId$.map(x => R.set2(["filters", "id"], x)),
    // intents.changeFilterTitle$.map(x => R.set2(["filters", "title"], x)),
    // intents.changeFilterTags$.map(x => R.set2(["filters", "tags"], x)),
    // intents.changeFilterIsPublished$.map(x => R.set2(["filters", "isPublished"], x)),
    // intents.changeFilterPublishDateFrom$.map(x => R.set2(["filters", "publishDateFrom"], x)),
    // intents.changeFilterPublishDateTo$.map(x => R.set2(["filters", "publishDateTo"], x)),

    // intents.changeSort$.map(x => R.set2("sort", x)),
  ).$

  let posts$ = D.deriveObj(
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

  // LOAD
  let load$ = K.merge([
    K.constant({
      posts: {offset: 0, limit: 10},
    }),

    K.constant({
      posts: {ids: ["514dec473e"]},
    }),

    // TEMP: emulate post detail visit /////////////////////////////////////////////////////////////
    K.constant({
      posts: {ids: ["f7f169a537"]},
    }),

    K.constant({
      posts: {ids: ["514dec473e"]},
    }),
    ////////////////////////////////////////////////////////////////////////////////////////////////
  ])

  return {Component, load$}
}

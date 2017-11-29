import A from "axios"
import * as F from "framework"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import {makeFilterFn, makeSortFn} from "common/home"
import PostIndex from "./PostIndex"

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
    fetch$: O.fromPromise(A.get("/api/posts/~/id"))
      .map(resp => R.pluck("id", resp.data.models))
      .catch(err => {
        console.warn(err) // TODO
        return O.of()
      })
      .withLatestFrom(sources.state$, (requiredIds, state) => {
        let presentIds = R.keys(R.view(baseLens, state))
        let missingIds = R.difference(requiredIds, presentIds)
        return missingIds
      })
      .filter(R.length)
      .concatMap(ids => A.get(`/api/posts/${R.join(",", ids)}`))
      .map(resp => resp.data.models)
      .catch(err => {
        console.warn(err) // TODO
        return O.of()
      })
      .share(),

    // DOM
    changeFilterId$: sources.DOM.fromName("filter.id").listen("input")
      .map(R.view(["element", "value"])),

    changeFilterTitle$: sources.DOM.fromName("filter.title").listen("input")
      .map(R.view(["element", "value"])),

    changeFilterTags$: sources.DOM.fromName("filter.tags").listen("input")
      .map(R.view(["element", "value"])),

    changeFilterIsPublished$: sources.DOM.fromName("filter.isPublished").listen("click")
      .map(R.view(["element", "value"])),

    changeSort$: sources.DOM.fromName("sort").listen("click")
      .map(R.view(["element", "value"])),
  }

  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(seed),

    intents.changeFilterId$.map(x => R.set(["filter", "id"], x)),
    intents.changeFilterTitle$.map(x => R.set(["filter", "title"], x)),
    intents.changeFilterTags$.map(x => R.set(["filter", "tags"], x)),
    intents.changeFilterIsPublished$.map(_ => R.over(["filter", "isPublished"], R.not)),

    intents.changeSort$.map(x => R.set("sort", x)),
  ).$

  let posts$ = D.derive(
    {
      table: sources.state$.pluck("posts"),
      index: index$.debounceTime(200),
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

  let action$ = O.merge(
    intents.fetch$.map(posts => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(posts), state)
      }
    }),
  )

  return {action$, Component}
}

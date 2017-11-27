import A from "axios"
import * as F from "framework"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import * as M from "common/models"
import PostIndex from "./PostIndex"

export let seed = {
  filter: {
    new: false,
    hit: false,
    title: "",
  },
  sort: "+id",
}

let makeFilterFn = (filter) => {
  return (post) => {
    if (filter.new && !post.new) {
      return false
    }
    if (filter.hit && !post.hit) {
      return false
    }
    if (filter.title && !R.startsWith(filter.title, post.title)) {
      return false
    }
    return true
  }
}

let makeSortFn = (sort) => {
  let [ascDesc, propName] = [sort[0], R.drop(1, sort)]
  let dirFn = ascDesc == "+" ? R.ascend : R.descend
  let propFn = R.prop(propName)
  return dirFn(propFn)
}

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts"]

  let intents = {
    // HTTP
    fetch$: O.fromPromise(A.get("/api/posts/~/id"))
      .map(resp => R.pluck("id", resp.data.data))
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
      .map(resp => resp.data.data)
      .catch(err => {
        console.warn(err) // TODO
        return O.of()
      })
      .share(),

    // DOM
    changeNewFilter$: sources.DOM.fromName("filter.new").listen("click")
      .map(event => event.target.value),

    changeHitFilter$: sources.DOM.fromName("filter.hit").listen("click")
      .map(event => event.target.value),

    changeTitleFilter$: sources.DOM.fromName("filter.title").listen("input")
      .map(event => event.target.value),

    changeSort$: sources.DOM.fromName("sort").listen("click")
      .map(event => event.target.value),
  }

  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(seed),

    intents.changeNewFilter$.map(_ => R.over(["filter", "new"], R.not)),
    intents.changeHitFilter$.map(_ => R.over(["filter", "hit"], R.not)),
    intents.changeTitleFilter$.map(x => R.set(["filter", "title"], x)),

    intents.changeSort$.map(x => R.set("sort", x)),
  ).$

  let posts$ = D.derive(
    {
      table: sources.state$.pluck("posts"),
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

  let action$ = O.merge(
    intents.fetch$.map(posts => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(posts), state)
      }
    }),
  )

  return {action$, Component}
}

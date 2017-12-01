import A from "axios"
import * as F from "framework"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import {makeFilterFn, makeSortFn} from "common/user-index"
import UserIndex from "./UserIndex"

///
let smartDebounce = (time) => ($) =>
  O.merge($.take(1), $.skip(1).debounceTime(time))
///

export let seed = {
  filter: {
    id: "",
    fullname: "",
    dob: "",
    role: "",
  },
  sort: "+id",
}

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["users"]

  let intents = {
    // HTTP
    fetch$: O.fromPromise(A.get("/api/users/~/id"))
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
      .concatMap(ids => A.get(`/api/users/${R.join(",", ids)}`))
      .map(resp => resp.data.models)
      .catch(err => {
        console.warn(err) // TODO
        return O.of()
      })
      .share(),

    // DOM
    changeFilterId$: sources.DOM.fromName("filter.id").listen("input")
      .map(R.view(["element", "value"])),

    changeFilterFullname$: sources.DOM.fromName("filter.fullname").listen("input")
      .map(R.view(["element", "value"])),

    changeFilterDob$: sources.DOM.fromName("filter.dob").listen("input")
      .map(R.view(["element", "value"])),

    changeFilterRole$: sources.DOM.fromName("filter.role").listen("input")
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
    intents.changeFilterFullname$.map(x => R.set(["filter", "fullname"], x)),
    intents.changeFilterDob$.map(x => R.set(["filter", "dob"], x)),
    intents.changeFilterRole$.map(x => R.set(["filter", "role"], x)),

    intents.changeSort$.map(x => R.set("sort", x)),
  ).$

  let users$ = D.derive(
    {
      table: sources.state$.pluck("users"),
      index: index$.let(smartDebounce(200)),
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
      users: users$,
    },
    UserIndex,
  )

  let action$ = O.merge(
    intents.fetch$.map(users => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(users), state)
      }
    }),
  )

  return {Component, action$}
}

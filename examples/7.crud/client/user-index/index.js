import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/user-index"
import UserIndex from "./UserIndex"

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
    fetch$: sources.state$.sampledBy(K
      .fromPromise(A.get("/api/users/~/id"))
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
      .flatMapLatest(ids => K.fromPromise(A.get(`/api/users/${R.join(",", ids)}`)))
      .map(resp => resp.data.models)
      .mapErrors(err => {
        console.warn(err) // TODO
        return K.never()
      }),

    // DOM
    changeFilterId$: sources.DOM.fromName("filter.id").listen("input")
      .map(ee => ee.element.value),

    changeFilterFullname$: sources.DOM.fromName("filter.fullname").listen("input")
      .map(ee => ee.element.value),

    changeFilterDob$: sources.DOM.fromName("filter.dob").listen("input")
      .map(ee => ee.element.value),

    changeFilterRole$: sources.DOM.fromName("filter.role").listen("input")
      .map(ee => ee.element.value),

    changeSort$: sources.DOM.fromName("sort").listen("click")
      .map(ee => ee.element.value),
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
  ).$.debounce(200)

  let users$ = D.derive(
    {
      table: sources.state$.map(s => s.users),
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
      users: users$,
    },
    UserIndex,
  )

  let action$ = K.merge([
    intents.fetch$.map(users => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(users), state)
      }
    }),
  ])

  return {Component, action$}
}

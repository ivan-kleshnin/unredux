import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/user-index"
import UserIndex from "./UserIndex"

export let seed = {
  filters: {
    id: "",
    role: "",
    fullname: "",
    ageFrom: "",
    ageTo: "",
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
      .map(resp => resp.data.models)
      .map(models => R.pluck("id", models)),
      (state, requiredIds) => {
        let presentIds = R.keys(R.view(baseLens, state))
        let missingIds = R.difference(requiredIds, presentIds)
        return missingIds
      })
      .filter(R.length)
      .flatMapConcat(ids => K
        .fromPromise(A.get(`/api/users/${R.join(",", ids)}`))
        .map(resp => resp.data.models)
      ),

    // DOM
    changeFilterId$: sources.DOM.fromName("filters.id").listen("input")
      .map(ee => ee.element.value),

    changeFilterRole$: sources.DOM.fromName("filters.role").listen("input")
      .map(ee => ee.element.value),

    changeFilterFullname$: sources.DOM.fromName("filters.fullname").listen("input")
      .map(ee => ee.element.value),

    changeFilterAgeFrom$: sources.DOM.fromName("filters.ageFrom").listen("input")
      .map(ee => ee.element.value),

    changeFilterAgeTo$: sources.DOM.fromName("filters.ageTo").listen("input")
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
    intents.changeFilterRole$.map(x => R.set(["filters", "role"], x)),
    intents.changeFilterFullname$.map(x => R.set(["filters", "fullname"], x)),
    intents.changeFilterAgeFrom$.map(x => R.set(["filters", "ageFrom"], x)),
    intents.changeFilterAgeTo$.map(x => R.set(["filters", "ageTo"], x)),

    intents.changeSort$.map(x => R.set("sort", x)),
  ).$

  let users$ = D.derive(
    {
      table: sources.state$.map(s => s.users),
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
      users: users$,
    },
    UserIndex,
  )

  let action$ = K.merge([
    intents.fetch$.map(users => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(users), state)
      }
    }).flatMapErrors(err => {
      console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
      return K.never() // TODO add alert box
    }),
  ])

  return {Component, action$}
}

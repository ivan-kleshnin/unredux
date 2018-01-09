import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/user-index"
import * as B from "../blueprints"
import UserIndex from "./UserIndex"

// SEED
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

  // INTENTS
  let intents = {
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
    intents.changeFilterRole$.map(x => R.set2(["filters", "role"], x)),
    intents.changeFilterFullname$.map(x => R.set2(["filters", "fullname"], x)),
    intents.changeFilterAgeFrom$.map(x => R.set2(["filters", "ageFrom"], x)),
    intents.changeFilterAgeTo$.map(x => R.set2(["filters", "ageTo"], x)),

    intents.changeSort$.map(x => R.set2("sort", x)),
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

  // COMPONENT
  let Component = F.connect(
    {
      loading: D.deriveOne(sources.state$, ["_loading", key]),
      index: index$,
      users: users$,
    },
    UserIndex
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

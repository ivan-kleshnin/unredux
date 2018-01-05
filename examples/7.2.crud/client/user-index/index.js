import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {makeFilterFn, makeSortFn} from "common/user-index"
import * as B from "../blueprints"
import Loading from "../common/Loading"
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
  loading: false,
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
    intents.changeFilterRole$.map(x => R.set(["filters", "role"], x)),
    intents.changeFilterFullname$.map(x => R.set(["filters", "fullname"], x)),
    intents.changeFilterAgeFrom$.map(x => R.set(["filters", "ageFrom"], x)),
    intents.changeFilterAgeTo$.map(x => R.set(["filters", "ageTo"], x)),

    intents.changeSort$.map(x => R.set("sort", x)),

    D.ifBrowser(
      K.merge([
        prefetchStart$.skip(1), prefetchEnd$.skip(1).delay(1),
        fetchStart$, fetchEnd$.delay(1)
       ]).map(_ => R.over(["loading"], R.not))
    ),
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
      index: index$,
      users: users$,
    },
    ({index, users}) => index.loading
      ? <Loading/>
      : <UserIndex index={index} users={users}/>
  )

  // ACTION (external)
  let action$ = K.merge([
    fetchEnd$
      .thru(B.postFetchModels(baseLens)),
  ])

  return {Component, action$}
}

import A from "axios"
import {connect, derive, deriveObj} from "framework"
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

export default (sources, {key, params}) => {
  let baseLens = ["users"]
  let loadingLens = ["_loading", key]

  let deriveState = derive(sources.state$.throttle(50))
  let loading$ = deriveState(loadingLens).map(Boolean)

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

    fetch: {
      base$: K.constant(true),
    }
  }

  // FETCHES
  let fetches = {
    base$: intents.fetch.base$
      .flatMapConcat(_ => K.fromPromise(
        A.get(`/api/${baseLens[0]}/~/id/`)
         .then(resp => R.pluck("id", resp.data.models))
         .catch(R.id)
      ))
      .flatMapConcat(maybeIds => {
        return maybeIds instanceof Error
          ? K.constant(maybeIds)
          : sources.state$.take(1)
              .map(s => R.keys(R.view2(baseLens, s)))
              .map(R.difference(maybeIds))
              .flatMapConcat(missingIds => {
                return missingIds.length
                  ? K.fromPromise(
                      A.get(`/api/${baseLens[0]}/${R.join(",", missingIds)}/`)
                       .then(resp => resp.data.models)
                       .catch(R.id)
                    )
                  : K.constant({})
              })
      })
  }

  // STATE
  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    // Init
    D.init(seed),

    // Form
    intents.changeFilterId$.map(x => R.set2(["filters", "id"], x)),
    intents.changeFilterRole$.map(x => R.set2(["filters", "role"], x)),
    intents.changeFilterFullname$.map(x => R.set2(["filters", "fullname"], x)),
    intents.changeFilterAgeFrom$.map(x => R.set2(["filters", "ageFrom"], x)),
    intents.changeFilterAgeTo$.map(x => R.set2(["filters", "ageTo"], x)),

    intents.changeSort$.map(x => R.set2("sort", x)),
  ).$

  let users$ = deriveObj(
    {
      index: index$.debounce(200),
      table: sources.state$.map(s => s.users),
    },
    ({index, table}) => {
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
  let Component = connect(
    {
      loading: loading$,
      index: index$,
      users: users$,
    },
    UserIndex
  )

  // ACTIONS
  let action$ = K.merge([
    K.constant(function initPage(state) {
      return R.set2(["document", "title"], `Users`, state)
    }),

    fetches.base$
      .map(maybeModels => function afterGET(state) {
        return maybeModels instanceof Error
          ? state
          : R.over2(baseLens, R.mergeFlipped(maybeModels), state)
      }),

    K.merge(R.values(intents.fetch)).map(_ => R.fn("setLoading", R.over2(loadingLens, B.safeInc))),
    K.merge(R.values(fetches)).delay(1).map(_ => R.fn("unsetLoading", R.over2(loadingLens, B.safeDec))),
  ])

  return {Component, action$}
}

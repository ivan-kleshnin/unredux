import * as F from "framework"
import * as D from "selfdb"
import RR from "r2"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import UserIndex from "./UserIndex"
///
import {inspect} from "util"

export let makeSeed = () => ({
  filterFn: R.id,
  sortFn: R.ascend(R.prop("id")),
})

let lensToUrl = (lens) => {
  // ["users"]      -> /users/data.json
  // ["users", "1"] -> /users/1/data.json
  return "/" + R.join("/", lens) + "/data.json"
}

let fetchModel = (lens) => ($) => {
  return $
    .concatMap(_ => (async () => {
      let url = lensToUrl(lens)
      console.log(`fetching ${url}...`)
      let model = await RR(url).json
      return model
    })())
    .catch(err => {
      console.warn(err) // TODO fix error swallowing @_@
    })
    .share()
}

let fetchModels = (lenses) => {
  return ($) => {
    return $
      .concatMap(_ => (async () => {
        let models = {}
        for (let lens of lenses) {
          let url = lensToUrl(lens)
          console.log(`fetching ${url}...`)
          let model = await RR(url).json
          models[model.id] = model
        }
        return models
      })())
      .catch(err => {
        console.warn(err) // TODO fix error swallowing @_@
      })
      .share()
  }
}

let fetchingModel = ($) => {
  return $
    .map(lens => O.of(true).let(fetchModel(lens)))
    .switch()
    .share()
}

let fetchingModels = ($) => {
  return $
    .map(lenses => O.of(true).let(fetchModels(lenses)))
    .switch()
    .share()
}

export default (sources, key) => {
  let baseLens = ["users"]

  let intents = {
    fetch$: O.of(true)
      .let(fetchModel(baseLens))
      .withLatestFrom(sources.state$, (requiredIds, state) => {
        // Find missing ids
        let presentIds = R.keys(R.view(baseLens, state))
        let missingIds = R.difference(requiredIds, presentIds)
        return R.map(missingId => R.append(missingId, baseLens), missingIds)
      })
      .let(fetchingModels)
  }

  let action$ = O.merge(
    intents.fetch$.map(users => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(users), state)
      }
    }),
  )

  let index$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    // D.withLog({key}),
  )(
    D.init(makeSeed()),
  ).$

  let users$ = F.derive(
    {
      table: sources.state$.pluck("users"),
      index: index$,
    },
    ({table, index}) => {
      return R.pipe(
        R.values,
        R.filter(index.filterFn),
        R.sort(index.sortFn),
      )(table)
    }
  )

  let Component = F.connect(
    {
      users: users$,
    },
    UserIndex,
  )

  return {action$, Component}
}

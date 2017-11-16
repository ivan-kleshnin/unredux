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

export default (sources, key) => {
  let intents = {}

  let baseLens = ["users"]

  let fetch$ = O.of(true)
    .concatMap(() => {
      // Fetch user ids
      let url = lensToUrl(baseLens)
      console.log(`fetching ${url}`)
      return RR(url).json
    })
    .withLatestFrom(sources.state$, (requiredIds, state) => {
      // Find missing ids
      let presentIds = R.keys(R.view(baseLens, state))
      let missingIds = R.difference(requiredIds, presentIds)
      return R.map(missingId => R.append(missingId, baseLens), missingIds)
    })
    .concatMap(async (lenses) => {
      // Fetch users
      let users = {}
      for (let lens of lenses) {
        let url = lensToUrl(lens)
        console.log(`fetching ${url}`)
        let user = await RR(url).json
        users[user.id] = user
      }
      return users
    })
    .catch(err => {
      console.warn(err) // TODO do something about error swallowing @_@
    })
    .share()

  let action$ = O.merge(
    fetch$.map(users => {
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

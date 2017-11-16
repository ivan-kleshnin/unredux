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

  let fetch$ = O.of(baseLens)
    .concatMap(async (lens) => {
      let url = lensToUrl(lens)
      return [lens, await RR(url).json]
    })
    .filter(R.pipe(R.snd, R.length))
    .withLatestFrom(sources.state$, async ([lens, requiredIds], state) => {
      let presentIds = R.keys(R.view(lens, state))
      let missingIds = R.difference(requiredIds, presentIds)
      let data = {}
      for (let missingId of missingIds) {
        let url = lensToUrl(R.append(missingId, lens))
        console.log(`fetching ${url}`)
        let _data = await RR(url).json
        data[_data.id] = _data
      }
      console.log("data:", data)
      return function afterFetch(state) {
        return R.over(lens, R.mergeFlipped(data), state)
      }
    }).switch()

  let action$ = O.merge(
    fetch$,
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

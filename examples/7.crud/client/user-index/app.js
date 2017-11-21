import * as F from "framework"
import * as D from "selfdb"
import RR from "r2"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"

import * as M from "../../common/models"
import UserIndex from "./UserIndex"

export let makeSeed = () => ({
  filterFn: R.id,
  sortFn: R.ascend(R.prop("id")),
})

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["users"]

  let intents = {
    fetch$: O.fromPromise(RR.get("http://localhost:3000/users/~/id").json)
      .catch(err => {
        console.warn(err) // TODO
      })
      .withLatestFrom(sources.state$, (requiredIds, state) => {
        let presentIds = R.keys(R.view(baseLens, state))
        let missingIds = R.difference(requiredIds, presentIds)
        return missingIds
      })
      .concatMap(ids => RR.get(`http://localhost:3000/users/${R.join(",", ids)}`).json)
      .catch(err => {
        console.warn(err) // TODO
      })
      .share()
  }

  let action$ = O.merge(
    intents.fetch$.map(users => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(M.arrToObj(users)), state)
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

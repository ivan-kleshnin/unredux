import A from "axios"
import * as F from "framework"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import UserDetail from "./UserDetail"

export let makeSeed = (id) => ({
  id,
})

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["users", params.id]

  let intents = {
    fetch$: sources.state$
      .filter(s => !R.view(baseLens, s))
      .concatMap(_ => A.get(`http://localhost:3000/api/users/${params.id}`))
      .catch(err => {
        console.warn(err) // TODO
      })
      .map(resp => {
        return resp.data.data[params.id]
      })
      .share()
  }

  let action$ = O.merge(
    intents.fetch$.map(user => {
      return function afterFetch(state) {
        return R.set(baseLens, user, state)
      }
    }),
  )

  let detail$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(makeSeed(params.id)),
  ).$

  let user$ = F.derive(
    {
      table: sources.state$.pluck("users"),
      detail: detail$,
    },
    ({table, detail}) => {
      return table[detail.id]
    }
  )

  let Component = F.connect(
    {
      user: user$,
    },
    UserDetail,
  )

  return {action$, Component}
}

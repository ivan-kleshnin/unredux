import * as F from "framework"
import * as D from "selfdb"
import RR from "r2"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import UserDetail from "./UserDetail"

export let makeSeed = (id) => ({
  id,
})

let lensToUrl = (lens) => {
  // ["users"]      -> /users/data.json
  // ["users", "1"] -> /users/1/data.json
  return "/" + R.join("/", lens) + "/data.json"
}

export default (sources, key) => {
  let intents = {}

  let baseLens = ["users", sources.props.params.id]

  let fetch$ = O.of(baseLens)
    .withLatestFrom(sources.state$, (lens, state) => {
      return [lens, R.view(lens, state)]
    })
    .filter(R.complement(R.snd))
    .map(R.fst)
    .withLatestFrom(sources.state$, async (lens, state) => {
      let url = lensToUrl(lens)
      console.log(`fetching ${url}`)
      let data = await RR(url).json
      return function afterFetch(state) {
        return R.set(lens, data, state)
      }
    }).switch()

  let action$ = O.merge(
    fetch$,
  )

  let detail$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(makeSeed(sources.props.params.id)),
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

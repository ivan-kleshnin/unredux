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

  let fetch$ = sources.state$
    .filter(s => !R.view(baseLens, s))
    .concatMap(() => {
      // Fetch user
      let url = lensToUrl(baseLens)
      console.log(`fetching ${url}`)
      return RR(url).json
    })
    .catch(err => {
      console.warn(err) // TODO do something about error swallowing @_@
    })
    .share()

  let action$ = O.merge(
    fetch$.map(user => {
      return function afterFetch(state) {
        return R.set(baseLens, user, state)
      }
    }),
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

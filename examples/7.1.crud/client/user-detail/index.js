import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import Loading from "../common/Loading"
import UserDetail from "./UserDetail"

// SEED
export let seed = {
  loading: false,
}

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["users", params.id]

  // HTTP
  let fetchStart$ = sources.state$
    .filter(s => !R.view(baseLens, s))

  let fetchEnd$ = fetchStart$
    .flatMapConcat(_ => K
      .fromPromise(A.get(`/api/users/${params.id}/`))
      .map(resp => resp.data.models[params.id])
    )

  // STATE
  let detail$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(seed),

    D.ifBrowser(
      fetchStart$.merge(fetchEnd$.delay(1)).map(_ => R.over(["loading"], R.not))
    ),
  ).$

  // COMPONENT
  let Component = F.connect(
    {
      loading: D.deriveOne(detail$, ["loading"]),
      user: D.deriveOne(sources.state$, baseLens),
    },
    ({loading, user}) => loading
      ? <Loading/>
      : <UserDetail user={user}/>
  )

  // ACTION (external)
  let action$ = K.merge([
    fetchEnd$.map(user => {
      if (user) {
        return function afterGET(state) {
          return R.set(baseLens, user, state)
        }
      } else {
        return R.id // TODO add alert box
      }
    }).flatMapErrors(err => {
      console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
      return K.never() // TODO add alert box
    }),
  ])

  return {Component, action$}
}

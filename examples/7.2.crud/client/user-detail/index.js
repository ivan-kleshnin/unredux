import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import * as B from "../blueprints"
import UserDetail from "./UserDetail"

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["users", params.id]

  // FETCH
  let fetchStart$ = sources.state$
    .filter(s => !R.view(baseLens, s))

  let fetchEnd$ = fetchStart$
    .thru(B.fetchModel(baseLens))

  // COMPONENT
  let Component = F.connect(
    {
      loading: D.deriveOne(sources.state$, ["_loading", key]),
      user: D.deriveOne(sources.state$, baseLens),
    },
    UserDetail
  )

  // ACTION (external)
  let action$ = K.merge([
    fetchEnd$
      .thru(B.postFetchModel(baseLens)),

    fetchStart$.map(_ => R.set(["_loading", key], true)),
    fetchEnd$.delay(1).map(_ => R.set(["_loading", key], false)),
  ])

  return {Component, action$}
}

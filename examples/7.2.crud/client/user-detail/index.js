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

  let intents = {
    fetch$: sources.state$
      .filter(s => !R.view(baseLens, s))
      .thru(B.fetchModel(baseLens)),
  }

  let user$ = D.deriveOne(sources.state$, baseLens)

  let Component = F.connect(
    {
      user: user$,
    },
    UserDetail,
  )

  let action$ = K.merge([
    intents.fetch$.thru(B.postFetchModel(baseLens)),
  ])

  return {Component, action$}
}

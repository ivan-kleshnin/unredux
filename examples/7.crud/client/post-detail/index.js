import * as R from "@paqmind/ramda"
import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import * as B from "../blueprints"
import PostDetail from "./PostDetail"

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts", params.id]
  let loadingLens = ["_loading", key]

  let loading$ = D.deriveOne(sources.state$, loadingLens).map(Boolean)
  let post$ = D.deriveOne(sources.state$, baseLens)

  // INTENTS
  let intents = {
    fetch: {
      base$: post$.filter(R.not),
    }
  }

  // FETCHES
  let fetches = {
    base$: intents.fetch.base$
      .flatMapConcat(_ => K.fromPromise(
        A.get(`/api/${baseLens[0]}/${baseLens[1]}/`)
         .then(resp => resp.data.models[baseLens[1]])
         .catch(R.id)
      )),
  }

  // COMPONENT
  let Component = F.connect(
    {
      loading: loading$,
      post: post$,
    },
    PostDetail
  )

  // ACTION
  let action$ = K.merge([
    fetches.base$
      .map(maybeModel => function afterGET(state) {
        return maybeModel instanceof Error
          ? state
          : R.set2(baseLens, maybeModel, state)
      }),

    K.merge(R.values(intents.fetch)).map(R.K(R.over2(loadingLens, B.safeInc))),
    K.merge(R.values(fetches)).delay(1).map(R.K(R.over2(loadingLens, B.safeDec))),
  ])

  return {Component, action$}
}

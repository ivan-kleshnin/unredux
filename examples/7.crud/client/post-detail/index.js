import * as R from "@paqmind/ramda"
import A from "axios"
import {connect, derive} from "framework"
import K from "kefir"
import React from "react"
import {safeDec, safeInc} from "../blueprints"
import PostDetail from "./PostDetail"

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts", params.id]
  let loadingLens = ["_loading", key]

  let deriveState = derive(sources.state$.throttle(50))
  let loading$ = deriveState(loadingLens).map(Boolean)
  let post$ = deriveState(baseLens)

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
  let Component = connect(
    {
      loading: loading$,
      post: post$,
    },
    PostDetail
  )

  // ACTIONS
  let action$ = K.merge([
    fetches.base$
      .map(maybeModel => function afterGET(state) {
        return maybeModel instanceof Error
          ? state
          : R.set2(baseLens, maybeModel, state)
      }),

    K.merge(R.values(intents.fetch)).map(R.K(R.over2(loadingLens, safeInc))),
    K.merge(R.values(fetches)).delay(1).map(R.K(R.over2(loadingLens, safeDec))),
  ])

  return {Component, action$}
}

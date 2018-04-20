import A from "axios"
import {connect, derive} from "framework"
import K from "kefir"
import React from "react"
import * as B from "../blueprints"
import PostDetail from "./PostDetail"

export default (sources, {key, params}) => {
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
    K.constant(function initPage(state) {
      return R.set2(["document", "title"], `Post ${params.id}`, state)
    }),

    fetches.base$
      .map(maybeModel => function afterGET(state) {
        return maybeModel instanceof Error
          ? state
          : R.set2(baseLens, maybeModel, state)
      }),

    K.merge(R.values(intents.fetch)).map(_ => R.fn("setLoading", R.over2(loadingLens, B.safeInc))),
    K.merge(R.values(fetches)).delay(1).map(_ => R.fn("unsetLoading", R.over2(loadingLens, B.safeDec))),
  ])

  return {Component, action$}
}

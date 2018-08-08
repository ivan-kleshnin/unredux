import {connect, derive} from "vendors/framework"
import K from "kefir"
import React from "react"
import {fetchJSON} from "common/helpers"
import {incLoading, decLoading} from "../blueprints"
import PostDetail from "./PostDetail"

export default (sources, {key, params}) => {
  let baseLens = ["posts", params.id]
  let loadingLens = ["loading"]

  let deriveState = derive(sources.state$.throttle(50))
  let post$ = deriveState(baseLens)
  let loading$ = deriveState(loadingLens).map(Boolean)

  // COMPONENT
  let Component = connect(
    {
      post: post$,
      loading: loading$,
    },
    PostDetail
  )

  // ACTIONS
  let action$ = K.merge([
    post$
      .filter(R.not)
      .flatMapConcat(_ => K.stream(async (emitter) => {
        emitter.value(function fetchStarted(state) {
          return incLoading(state)
        })

        let reqResult = await fetchJSON(`/api/${baseLens.join("/")}/`)
        if (reqResult instanceof Error) {
          console.warn(reqResult.message)
          emitter.value(function fetchFailed(state) {
            // + Set your custom alerts here
            return decLoading(state)
          })
        } else {
          let post = reqResult.models[params.id]
          emitter.value(function fetchSucceeded(state) {
            return R.pipe(
              R.set2(baseLens, post),
              decLoading,
            )(state)
          })
        }

        return emitter.end()
      })),
  ])

  return {Component, action$}
}

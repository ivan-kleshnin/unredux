import A from "axios"
import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import PostDetail from "./PostDetail"

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts", params.id]

  let intents = {
    fetch$: sources.state$
      .filter(s => !R.view(baseLens, s))
      .flatMapConcat(_ => K
        .fromPromise(A.get(`/api/posts/${params.id}`))
        .map(resp => resp.data.models[params.id])
      ),
  }

  let detail$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init({id: params.id}),
  ).$

  let post$ = D.derive(
    {
      table: sources.state$,
      detail: detail$,
    },
    ({table, detail}) => {
      return table[detail.id]
    }
  )

  let Component = F.connect(
    {
      post: post$,
    },
    PostDetail,
  )

  let action$ = K.merge([
    intents.fetch$.map(post => {
      if (post) {
        return function afterGET(state) {
          return R.set(baseLens, post, state)
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

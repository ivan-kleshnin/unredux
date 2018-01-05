import * as F from "framework"
import K from "kefir"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import * as B from "../blueprints"
import Loading from "../common/Loading"
import PostDetail from "./PostDetail"

// SEED
export let seed = {
  loading: false,
}

export default (sources, key) => {
  let {params} = sources.props
  let baseLens = ["posts", params.id]

  // HTTP
  let fetchStart$ = sources.state$
    .filter(s => !R.view(baseLens, s))

  let fetchEnd$ = fetchStart$
    .thru(B.fetchModel(baseLens))

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
      post: D.deriveOne(sources.state$, baseLens),
    },
    ({loading, post}) => loading
      ? <Loading/>
      : <PostDetail post={post}/>
  )

  // ACTION (external)
  let action$ = K.merge([
    fetchEnd$
      .thru(B.postFetchModel(baseLens)),
  ])

  return {Component, action$}
}

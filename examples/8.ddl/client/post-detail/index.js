import * as R from "@paqmind/ramda"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import * as B from "../blueprints"
import {whatIsMissing} from "../ddl"
import * as F from "../framework"
import PostDetail from "./PostDetail"

let deriveLoading = (state$, tableNames) =>
  K.combine(
    R.map(tableName => D.derive(state$, ["loading", tableName]), tableNames)
  ).map(R.any(Boolean)).toProperty()

let deriveModel = (state$, id$, queryFn) => {
  return D.deriveArr(
    [state$, id$.delay(1)],
    (state, id) => {
      if (id) {
        let query = queryFn(id)
        let missing = whatIsMissing(query, state)
        if (!missing.length) {
          let tableName = query[0]
          return state.tables[tableName][id]
        } else {
          return null
        }
      } else {
        return null
      }
    }
  ).filter(Boolean)
}

let deriveProp = (state$, prop) =>
  D.derive(state$, R.prop(prop))

let postModelQuery = (id) => ["posts", [id], ["id", "title", "userId"]]
let userModelQuery = (id) => ["users", [id], ["id", "fullname", "email"]]

export default (sources, key) => {
  let {params} = sources.props
  let postLens = ["posts", params.id]

  // DATA & LOAD
  let postId$ = K.constant(params.id)
  let post$ = deriveModel(sources.state$, postId$, postModelQuery)
  let userId$ = deriveProp(post$, "userId")
  let user$ = deriveModel(sources.state$, userId$, userModelQuery)

  let load$ = K.merge([
    postId$.map(postModelQuery),
    userId$.map(userModelQuery),
  ])

  // COMPONENT
  let Component = F.connect2(
    {
      // loading: loading$,
      post: post$,
      user: user$,
    },
    PostDetail
  )

  return {load$, Component}
}

// TODO optional fields

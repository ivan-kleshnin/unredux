import * as R from "@paqmind/ramda"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import * as B from "../blueprints"
import {whatIsMissing} from "../ddl"
import * as F from "../framework"
import PostIndex from "./PostIndex"

let deriveLoading = (state$, tableNames) =>
  K.combine(
    R.map(tableName => D.derive(state$, ["loading", tableName]), tableNames)
  ).map(R.any(Boolean)).toProperty()

let deriveIndex = (state$, index$, queryFn) => {
  return D.deriveArr(
    [state$, index$],
    (state, index) => {
      let query = queryFn(index)
      return B.indexToArray(R.view2(B.hashIndexQuery(query), state.indexes))
    }
  )
}

let deriveModelsObj = (state$, ids$, queryFn) => {
  return D.deriveArr(
    [state$, ids$.delay(1)],
    (state, ids) => {
      if (ids.length) {
        let query = queryFn(ids)
        let missing = whatIsMissing(query, state)
        if (!missing.length) {
          let tableName = query[0]
          return state.tables[tableName]
        } else {
          return null
        }
      } else {
        return null
      }
    }
  ).filter(Boolean)
}

let deriveModelsArr = (state$, ids$, queryFn) => {
  return ids$.sampledBy(deriveModelsObj(state$, ids$, queryFn), R.props)
}

let derivePluck = (state$, prop) =>
  D.derive(state$, R.pluck(prop))

let derivePluckUniq = (state$, prop) =>
  derivePluck(state$, prop).map(R.uniq)

let postIndexQuery = ({offset = 0, limit = 10}) => ["posts", {offset, limit}]
let postModelsQuery = (ids) => ["posts", ids, ["id", "title", "userId"]]
let userModelsQuery = (ids) => ["users", ids, ["id", "fullname", "email"]]

// SEED
export let seed = {
  offset: 0,
  limit: 2,
}

export default (sources, key) => {
  let {params} = sources.props

  // INTENTS
  let intents = {
    loadNext$: sources.DOM.fromKey("loadNext").listen("click").map(R.K(true)),
  }

  // STATE
  let index$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    // Init
    D.init(seed),

    intents.loadNext$.map(_ => s => R.over2("offset", R.add(s.limit), s))
  ).$

  // DATA & LOAD
  let postIds$ = deriveIndex(sources.state$, index$, postIndexQuery)
  let posts$ = deriveModelsArr(sources.state$, postIds$, postModelsQuery)
  let userIds$ = derivePluckUniq(posts$, "userId")
  let users$ = deriveModelsObj(sources.state$, userIds$, userModelsQuery)

  let load$ = K.merge([
    index$.map(postIndexQuery),
    postIds$.map(postModelsQuery),
    userIds$.map(userModelsQuery),
  ])

  // COMPONENT
  let Component = F.connect2(
    {
      // loading: loading$,
      posts: posts$,
      users: users$,
    },
    PostIndex
  )

  return {load$, Component}
}

// TODO optional fields
// TODO no data case

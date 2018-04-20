import {connect, derive, deriveModelsArr, deriveModelsObj} from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {deriveLazyLoad, hashIndexQuery, makeLazyLoad, validate} from "../blueprints"
import PostIndex from "./PostIndex"

let Post = {
  id: R.id,
  title: R.id,
  userId: R.id,
}

let User = {
  id: R.id,
  fullname: R.id,
  email: R.id,
}

let postIndexQuery = ({offset = 0, limit = 10}) => [
  "7/posts",
  {offset, limit, filters: {user: {isActive: true}}}
]

let postModelsQuery = (ids) => ["7/posts", ids, R.keys(Post)]

let userModelsQuery = (ids) => ["7/users", ids, R.keys(User)]

// SEED
export let seed = {
  offset: 0,
  limit: 5,
}

export default (sources, {key, params}) => {
  // INTENTS
  let intents = {
    loadNext$: sources.DOM.fromKey("loadNext").listen("click").map(R.always(true)),
  }

  // STATE
  let localIndex$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key, input: false, output: true}),
    D.withMemoryPersistence({key: "7." + key}),
  )(
    // Init
    D.init(seed),

    intents.loadNext$.map(_ => s => R.over2("offset", R.add(s.limit), s))
  ).$

  // DATA & LOAD
  let deriveState = derive(sources.state$.throttle(50))
  let loading$ = deriveState("loading")
  let indexes$ = deriveState("indexes")
  let postsTable$ = deriveState(["tables", "7/posts"])
  let usersTable$ = deriveState(["tables", "7/users"])

  let index$ = deriveLazyLoad(indexes$, localIndex$, postIndexQuery)  // :: $ (Array String)
  let postIds$ = derive(index$, "ids")                              // :: $ (Array String)
  let posts$ = deriveModelsArr(postsTable$, postIds$, validate(Post)) // :: $ (Array Post)
  let userIds$ = derive(posts$, R.pipe(R.pluck("userId"), R.uniq))  // :: $ (Array String)
  let users$ = deriveModelsObj(usersTable$, userIds$, validate(User)) // :: $ (Object User)

  let load$ = K.merge([
    index$.map(postIndexQuery),
    postIds$.map(postModelsQuery),
    userIds$.map(userModelsQuery),
  ])

  // COMPONENT
  let Component = connect(
    {
      loading: loading$,
      index: index$,
      posts: posts$,
      users: users$,
    },
    PostIndex
  )

  return {load$, Component}
}

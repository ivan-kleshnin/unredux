import {connect, derive, deriveArr, deriveObj, deriveModelsArr, deriveModelsObj} from "vendors/framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {deriveLazyLoad, validate} from "../blueprints"
import PostIndex from "./PostIndex"

let makeScenarios = (subset) => {
  let Post = {
    id: R.id,
    title: R.id,
    userId: subset.endsWith("b") ? R.K(true) : R.I,
  }

  let User = {
    id: R.id,
    fullname: R.id,
    email: R.id,
  }

  let postIndexQuery = ({offset = 0, limit = 10}) => [`${subset}/posts`, {offset, limit}]
  let postModelsQuery = (ids) => [`${subset}/posts`, ids, R.keys(Post)]
  let userModelsQuery = (ids) => [`${subset}/users`, ids, R.keys(User)]

  return {Post, User, postIndexQuery, postModelsQuery, userModelsQuery}
}

// SEED
export let seed = {
  offset: 0,
  limit: 5,
}

export default (sources, {key, params}) => {
  // --- Testing scenarios ---
  let {Post, User, postIndexQuery, postModelsQuery, userModelsQuery} = makeScenarios(params.subset)
  // ---

  // INTENTS
  let intents = {
    loadNext$: sources.DOM.fromKey("loadNext").listen("click").map(R.K(true)),
  }

  // STATE
  let localIndex$ = D.run(
    () => D.makeStore({}),
    // withLog({key, input: false, output: true}),
    D.withMemoryPersistence({key: params.subset + "." + key}),
  )(
    // Init
    D.init(seed),

    intents.loadNext$.map(_ => s => R.over2("offset", R.add(s.limit), s))
  ).$

  // DATA & LOAD
  let deriveState = derive(sources.state$.throttle(50))
  let loading$ = deriveState("loading")
  let indexes$ = deriveState("indexes")
  let postsTable$ = deriveState(["tables", `${params.subset}/posts`])
  let usersTable$ = deriveState(["tables", `${params.subset}/users`])

  let index$ = deriveLazyLoad(indexes$, localIndex$, postIndexQuery)  // :: $ (Array String)
  let postIds$ = derive(index$, "ids")                                // :: $ (Array String)
  let posts$ = deriveModelsArr(postsTable$, postIds$, validate(Post)) // :: $ (Array Post)
  let userIds$ = derive(posts$, R.pipe(R.pluck("userId"), R.uniq))    // :: $ (Array String)
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
    (props) => <PostIndex subset={params.subset} {...props}/>
  )

  return {load$, Component}
}

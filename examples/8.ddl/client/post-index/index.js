import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {deriveModelsObj, deriveModelsArr, deriveLazyLoad, validate} from "../blueprints"
import PostIndex from "./PostIndex"

let makeScenarios = (subset) => {
  let Post = {
    id: R.I,
    title: R.I,
    userId: subset.endsWith("b") ? R.K(true) : R.I,
  }

  let User = {
    id: R.I,
    fullname: R.I,
    email: R.I,
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

export default (sources, key) => {
  let {params} = sources.props

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
  let _state$ = sources.state$.throttle(50)
  let loading$ = D.derive(_state$, "loading")
  let indexes$ = D.derive(_state$, "indexes")
  let postsTable$ = D.derive(_state$, ["tables", `${params.subset}/posts`]) // TODO disable R.equals check
  let usersTable$ = D.derive(_state$, ["tables", `${params.subset}/users`]) // in kefir.db – too expensive?

  let index$ = deriveLazyLoad(indexes$, localIndex$, postIndexQuery)  // :: $ (Array String)
  let postIds$ = D.derive(index$, "ids")                                // :: $ (Array String)
  let posts$ = deriveModelsArr(postsTable$, postIds$, validate(Post)) // :: $ (Array Post)
  let userIds$ = D.derive(posts$, R.pipe(R.pluck("userId"), R.uniq))    // :: $ (Array String)
  let users$ = deriveModelsObj(usersTable$, userIds$, validate(User)) // :: $ (Object User)

  let load$ = K.merge([
    index$.map(postIndexQuery),
    postIds$.map(postModelsQuery),
    userIds$.map(userModelsQuery),
  ])

  // COMPONENT
  let Component = F.connect(
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

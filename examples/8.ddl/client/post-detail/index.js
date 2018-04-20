import {connect, derive, deriveModel} from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {validate} from "../blueprints"
import PostDetail from "./PostDetail"

let makeScenarios = (subset) => {
  let Post = {
    id: R.id,
    title: R.id,
    userId: subset.endsWith("b") ? R.always(true) : R.id,
  }

  let User = {
    id: R.id,
    fullname: R.id,
    email: R.id,
  }

  let postModelQuery = (id) => [`${subset}/posts`, [id], R.keys(Post)]
  let userModelQuery = (id) => [`${subset}/users`, [id], R.keys(User)]

  return {Post, User, postModelQuery, userModelQuery}
}

export default (sources, {key, params}) => {
  // --- Testing scenarios ---
  let {Post, User, postModelQuery, userModelQuery} = makeScenarios(params.subset)
  // ---

  // DATA & LOAD
  let deriveState = derive(sources.state$.throttle(50))
  let loading$ = deriveState("loading")
  let postsTable$ = deriveState(["tables", `${params.subset}/posts`]) // TODO disable R.equals check
  let usersTable$ = deriveState(["tables", `${params.subset}/users`]) // in kefir.db – too expensive?

  let postId$ = K.constant(params.id)                           // :: $ String
  let post$ = deriveModel(postsTable$, postId$, validate(Post)) // :: $ (Post | null)
  let userId$ = derive(post$, R.prop("userId"))                 // :: $ String
  let user$ = deriveModel(usersTable$, userId$, validate(User)) // :: $ (User | null)

  let load$ = K.merge([
    postId$.map(postModelQuery),
    userId$.map(userModelQuery),
  ])

  // COMPONENT
  let Component = connect(
    {
      loading: loading$,
      post: post$,
      user: user$,
    },
    (props) => <PostDetail subset={params.subset} {...props}/>
  )

  return {load$, Component}
}

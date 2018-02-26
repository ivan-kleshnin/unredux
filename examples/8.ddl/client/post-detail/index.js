import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {deriveModel, validate} from "../blueprints"
import PostDetail from "./PostDetail"

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

  let postModelQuery = (id) => [`${subset}/posts`, [id], R.keys(Post)]
  let userModelQuery = (id) => [`${subset}/users`, [id], R.keys(User)]

  return {Post, User, postModelQuery, userModelQuery}
}

export default (sources, key) => {
  let {params} = sources.props

  // --- Testing scenarios ---
  let {Post, User, postModelQuery, userModelQuery} = makeScenarios(params.subset)
  // ---

  // DATA & LOAD
  let _state$ = sources.state$.throttle(50)
  let loading$ = D.derive(_state$, "loading")
  let postsTable$ = D.derive(_state$, ["tables", `${params.subset}/posts`]) // TODO disable R.equals check
  let usersTable$ = D.derive(_state$, ["tables", `${params.subset}/users`]) // in kefir.db – too expensive?

  let postId$ = K.constant(params.id)                           // :: $ String
  let post$ = deriveModel(postsTable$, postId$, validate(Post)) // :: $ (Post | null)
  let userId$ = D.derive(post$, R.prop("userId"))                 // :: $ String
  let user$ = deriveModel(usersTable$, userId$, validate(User)) // :: $ (User | null)

  let load$ = K.merge([
    postId$.map(postModelQuery),
    userId$.map(userModelQuery),
  ])

  // COMPONENT
  let Component = F.connect(
    {
      loading: loading$,
      post: post$,
      user: user$,
    },
    (props) => <PostDetail subset={params.subset} {...props}/>
  )

  return {load$, Component}
}

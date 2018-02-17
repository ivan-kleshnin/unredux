import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import {whatIsMissing, whatAreMissing} from "../ddl"
import PostDetail from "./PostDetail"

let queryToLens = (query) => [query[0], query[1][0]]

let postIndexQueryFn = (offset) => ["posts", {offset, limit: 10}, []]
let postsQueryFn = (ids) => ["posts", ids, []]

let postQueryFn = (params) => ["posts", [params.id], ["id", "title", "userId"]]
let userQueryFn = (post) =>  ["users", [post.userId], ["id", "fullname"]]

let connect = F.connect(() => "NoData", () => "Loading")

// let deriveQueriesAndData = (state$, dep$s, queriesFn, dataFn) => {
//   let deps$ = D.deriveObj(dep$s, R.id)
//
//   let query$ = state$
//     .sampledBy(deps$, (state, deps) => {
//       // console.log("eval query$")
//       return R.any(R.isNil, deps)
//         ? []
//         : whatsMissing(queriesFn(...deps), state)
//     })
//     .toProperty()
//
//   let data$ = state$
//     .sampledBy(deps$, Array.of)
//     .combine(query$.map(R.isEmpty))
//     .debounce(1) // suppress extra events from a diamond case
//     .map(([[state, deps], gate]) => {
//       return !gate || R.any(R.isNil, deps)
//         ? null
//         : dataFn(...deps)
//     })
//     .skipDuplicates() // suppress consequent null events
//     .toProperty()
//
//   return [query$.filter(R.length), data$]
// }
//
// let deriveQueryAndData = (state$, dep$s, queryFn, dataFn) => {
//   return deriveQueriesAndData(state$, dep$s, (...args) => [queryFn(...args)], dataFn)
// }

D.deriveMaybe = (query$, state$, mapFn) => {
  return D.deriveObj({
    state: state$,
    _gate: query$.map(R.isEmpty),
  },
    ({state, _gate}) =>
      _gate ? mapFn(state) : null
  )
}

D.deriveObjMaybe = (query$, state$Obj, mapFn) => {
  return D.deriveObj({
    ...state$Obj,
    _gate: query$.map(R.isEmpty),
  },
    ({...stateObj, _gate}) =>
      _gate ? mapFn(stateObj) : null
  )
}

// SEED
export let seed = {
  offset: 0,
  limit: 10,
}

export default (sources, key) => {
  let {params} = sources.props
  let postLens = ["posts", params.id]
  let loadingLens1 = ["_loading", "posts"] // TODO try Traversals from partial.lenses
  let loadingLens2 = ["_loading", "users"] // |

  // STATE
  let index$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    // Init
    D.init(seed),

    K.interval(1000, R.id),
  ).$

  // DATA & LOAD
  let loading$ = K.combine([
    D.derive(sources.state$, loadingLens1),
    D.derive(sources.state$, loadingLens2),
  ]).map(R.any(Boolean))

  // ---
  let posts$ = sources.state$.map(R.view2("posts"))
  let users$ = sources.state$.map(R.view2("users"))

  // Unconditional post-index request
  let postIdsQuery$ = D.derive(index$, "offset").map(postIndexQueryFn)

  let postIds$ = D.derive(posts$, R.keys)

  // Statically parameterized post-detail request
  let postQuery$ = D.derive(sources.state$, (state) => whatIsMissing(postQueryFn(params), state))

  let maybePost$ = D.deriveMaybe(postQuery$, posts$, (posts) => posts[params.id])

  // Dynamically parameterized user-detail request
  let userQuery$ = D.deriveObj({
    state: sources.state$,
    post: maybePost$.filter(Boolean),
  }, ({state, post}) => whatIsMissing(userQueryFn(post), state))

  let maybeUser$ = D.deriveObjMaybe(userQuery$, {
    users: users$,
    post: maybePost$,
  }, ({users, post}) => users[post.userId])

  postIdsQuery$.log("postIdsQuery$")
  postIds$.log("postIds$")
  postQuery$.log("postQuery$")
  maybePost$.log("maybePost$")
  userQuery$.log("userQuery$")
  maybeUser$.log("maybeUser$")
  // postIds$.log("postIds$")

    // maybePost$.map(maybePost => maybePost ? userQueryFn(maybePost.userId) : [])

  // let data$ = state$
  //   .sampledBy(deps$, Array.of)
  //   .combine(query$.map(R.isEmpty))
  //   .debounce(1) // suppress extra events from a diamond case
  //   .map(([[state, deps], gate]) => {
  //     return !gate || R.any(R.isNil, deps)
  //       ? null
  //       : dataFn(...deps)
  //   })
  //   .skipDuplicates() // suppress consequent null events
  //   .toProperty()

    //  state$
    // .sampledBy(deps$, (state, deps) => {
    //   // console.log("eval query$")
    //   return R.any(R.isNil, deps)
    //     ? []
    //     : whatsMissing(queriesFn(...deps), state)
    // })
    // .toProperty()


  // let [postIdsQuery$, postIds$] = deriveQueryAndData(
  //   sources.state$,
  //   [D.derive(index$, "offset")],
  //   (_) => postIndexQueryFn(),
  //   (postIds) => postIds
  // )

  // let [postsQuery$, post$] = deriveQueryAndData(
  //   sources.state$,
  //   [sources.state$.map(R.view2(postLensFn(params)))],
  //   (post) => postQueryFn(params),
  //   (post) => post
  // )

  // let users$ = D.derive(sources.state$, "users")
  //
  // let [userQuery$, user$] = deriveQueryAndData(
  //   sources.state$,
  //   [users$, post$],
  //   (users, post) => userQueryFn(post),
  //   (users, post) => {
  //     return users[post.userId]
  //   }
  // )

  // loading$.observe(x => console.log("loading$:", x, new Date().toISOString()))
  //
  // postQuery$.observe(x => console.log("postQuery$:", JSON.stringify(x)))
  // post$.observe(x => console.log("post$:", JSON.stringify(x)))
  //
  // userQuery$.observe(x => console.log("userQuery$:", JSON.stringify(x)))
  // user$.observe(x => console.log("user$:", JSON.stringify(x)))

  // COMPONENT
  let Component = connect(
    {
      // loading: loading$,
      // post: post$,
      // user: user$,
    },
    ({loading, post, user}) => {
      // console.log("loading:", loading)
      // console.log("post:", post)
      // console.log("user:", user)
      // console.log("\n")
      return <div>test</div>
    }
    // PostDetail
  )

  // let posts$ = sources.state$.map(R.view(postsLens))
  //
  // let postQuery = ["posts", [params.id], ["id", "title"]]
  //
  //   .filter(F.apply(postQuery))

  // postQuery$.log("postQuery$")
  // post$.log("post$")
  //
  // userQuery$.log("userQuery$")
  // user$.log("user$")

  let load$ = K.merge([
    // postIdsQuery$,
    // postQuery$,
    // userQuery$,
  ])

  return {Component, load$}
}

// let postQuery$ = sources.state$
//   .sampledBy(K.combine([sources.state$]), (state, deps) => {
//     return whatsMissing([postQuery], state)
//   })
//   .toProperty()
//
// let post$ = sources.state$
//   .sampledBy(K.combine([sources.state$]), Array.of)
//   .combine(postQuery$.map(R.isEmpty), ([state, [_]], gate) => {
//     return gate ? R.view2(postLens, state) : null
//   }).toProperty()
//
// let userQuery$ = sources.state$
//   .sampledBy(K.combine([post$]), (state, [post]) => {
//     return whatsMissing([userQuery(post.userId)], state)
//   })
//   .toProperty()
//
// let user$ = sources.state$
//   .sampledBy(K.combine([post$]), Array.of)
//   .combine(userQuery$.map(R.isEmpty), ([state, [post]], gate) => {
//     return gate ? R.view2(["users", post.userId], state) : null
//   })
//   .toProperty()

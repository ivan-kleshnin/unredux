import * as R from "@paqmind/ramda"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import * as B from "../blueprints"
import {whatIsMissing} from "../ddl"
import * as F from "../framework"
import PostIndex from "./PostIndex"

let postIndexQuery = ({offset = 0, limit = 10}) => ["posts", {offset, limit}]
let postModelsQuery = (ids) => ["posts", ids, ["id", "title", "userId"]]
let userModelsQuery = (ids) => ["users", ids, ["id", "fullname", "email"]]

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
  )
}

let deriveModelsArr = (state$, ids$, queryFn) => {
  return ids$.sampledBy(deriveModelsObj(state$, ids$, queryFn), R.props)
}

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
  let loading$ = deriveLoading(sources.state$, ["posts", "users"])

  let postIds$ = deriveIndex(sources.state$, index$, postIndexQuery)
  let maybePosts$ = deriveModelsArr(sources.state$, postIds$, postModelsQuery)
  let userIds$ = D.derive(maybePosts$.filter(Boolean), R.pipe(R.pluck("userId"), R.uniq))
  let maybeUsers$ = deriveModelsObj(sources.state$, userIds$, userModelsQuery)

  let load$ = K.merge([
    index$.map(postIndexQuery),
    postIds$.map(postModelsQuery),
    userIds$.map(userModelsQuery),
  ])

  // COMPONENT
  let Component = F.connect2(
    {
      loading: loading$,
      posts: maybePosts$,
      users: maybeUsers$,
    },
    PostIndex
  )

  return {load$, Component}
}

//
//   // Statically parameterized post-detail request
//   // let postQuery$ = D.derive(
//   //   sources.state$,
//   //   (state) =>
//   //     whatIsMissing(postQueryFn(params), state)
//   // )
//   //
//   // let maybePost$ = D.deriveMaybe(
//   //   postQuery$,
//   //   posts$,
//   //   R.prop(params.id)
//   // )
//
//   // Dynamically parameterized user-detail request
//   // let userQuery$ = D.deriveArr(
//   //   [sources.state$, maybePost$.filter(Boolean)],
//   //   (state, post) =>
//   //     whatIsMissing(userQueryFn(post), state)
//   // )
//   //
//   // let maybeUser$ = D.deriveArrMaybe(
//   //   userQuery$,
//   //   [users$, maybePost$],
//   //   (users, post) =>
//   //     users[post.userId]
//   // )
//
//   // postIdsQuery$.log("postIdsQuery$")
//   // postIds$.log("postIds$")
//   // postsQuery$.log("postsQuery$")
//   // maybePosts$.log("maybePosts$")
//   // postQuery$.log("postQuery$")
//   // maybePost$.log("maybePost$")
//   // userQuery$.log("userQuery$")
//   // maybeUser$.log("maybeUser$")
//   // postIds$.log("postIds$")
//
//     // maybePost$.map(maybePost => maybePost ? userQueryFn(maybePost.userId) : [])
//
//   // let data$ = state$
//   //   .sampledBy(deps$, Array.of)
//   //   .combine(query$.map(R.isEmpty))
//   //   .debounce(1) // suppress extra events from a diamond case
//   //   .map(([[state, deps], gate]) => {
//   //     return !gate || R.any(R.isNil, deps)
//   //       ? null
//   //       : dataFn(...deps)
//   //   })
//   //   .skipDuplicates() // suppress consequent null events
//   //   .toProperty()
//
//     //  state$
//     // .sampledBy(deps$, (state, deps) => {
//     //   // console.log("eval query$")
//     //   return R.any(R.isNil, deps)
//     //     ? []
//     //     : whatsMissing(queriesFn(...deps), state)
//     // })
//     // .toProperty()
//
//   // let [postIdsQuery$, postIds$] = deriveQueryAndData(
//   //   sources.state$,
//   //   [D.derive(index$, "offset")],
//   //   (_) => postIndexQueryFn(),
//   //   (postIds) => postIds
//   // )
//
//   // let [postsQuery$, post$] = deriveQueryAndData(
//   //   sources.state$,
//   //   [sources.state$.map(R.view2(postLensFn(params)))],
//   //   (post) => postQueryFn(params),
//   //   (post) => post
//   // )
//
//   // let users$ = D.derive(sources.state$, "users")
//   //
//   // let [userQuery$, user$] = deriveQueryAndData(
//   //   sources.state$,
//   //   [users$, post$],
//   //   (users, post) => userQueryFn(post),
//   //   (users, post) => {
//   //     return users[post.userId]
//   //   }
//   // )
//
//   // loading$.observe(x => console.log("loading$:", x, new Date().toISOString()))
//   //
//   // postQuery$.observe(x => console.log("postQuery$:", JSON.stringify(x)))
//   // post$.observe(x => console.log("post$:", JSON.stringify(x)))
//   //
//   // userQuery$.observe(x => console.log("userQuery$:", JSON.stringify(x)))
//   // user$.observe(x => console.log("user$:", JSON.stringify(x)))
//
//   // COMPONENT
//   let Component = connect(
//     {
//       // loading: loading$,
//       // post: post$,
//       // user: user$,
//     },
//     () => {
//       // console.log("loading:", loading)
//       // console.log("post:", post)
//       // console.log("user:", user)
//       // console.log("\n")
//       return <div>test</div>
//     }
//     // PostDetail
//   )
//
//   return {Component, load$}
// }
//
// // let postQuery$ = sources.state$
// //   .sampledBy(K.combine([sources.state$]), (state, deps) => {
// //     return whatsMissing([postQuery], state)
// //   })
// //   .toProperty()
// //
// // let post$ = sources.state$
// //   .sampledBy(K.combine([sources.state$]), Array.of)
// //   .combine(postQuery$.map(R.isEmpty), ([state, [_]], gate) => {
// //     return gate ? R.view2(postLens, state) : null
// //   }).toProperty()
// //
// // let userQuery$ = sources.state$
// //   .sampledBy(K.combine([post$]), (state, [post]) => {
// //     return whatsMissing([userQuery(post.userId)], state)
// //   })
// //   .toProperty()
// //
// // let user$ = sources.state$
// //   .sampledBy(K.combine([post$]), Array.of)
// //   .combine(userQuery$.map(R.isEmpty), ([state, [post]], gate) => {
// //     return gate ? R.view2(["users", post.userId], state) : null
// //   })
// //   .toProperty()
//
// // let deriveQueriesAndData = (state$, dep$s, queriesFn, dataFn) => {
// //   let deps$ = D.deriveObj(dep$s, R.id)
// //
// //   let query$ = state$
// //     .sampledBy(deps$, (state, deps) => {
// //       // console.log("eval query$")
// //       return R.any(R.isNil, deps)
// //         ? []
// //         : whatsMissing(queriesFn(...deps), state)
// //     })
// //     .toProperty()
// //
// //   let data$ = state$
// //     .sampledBy(deps$, Array.of)
// //     .combine(query$.map(R.isEmpty))
// //     .debounce(1) // suppress extra events from a diamond case
// //     .map(([[state, deps], gate]) => {
// //       return !gate || R.any(R.isNil, deps)
// //         ? null
// //         : dataFn(...deps)
// //     })
// //     .skipDuplicates() // suppress consequent null events
// //     .toProperty()
// //
// //   return [query$.filter(R.length), data$]
// // }
// //
// // let deriveQueryAndData = (state$, dep$s, queryFn, dataFn) => {
// //   return deriveQueriesAndData(state$, dep$s, (...args) => [queryFn(...args)], dataFn)
// // }
//

// let users$ = D.derive(sources.state$, ["tables", "users"])

// loading$.log("loading$")
// posts$.log("posts$")
// indexQuery$.log("indexQuery$")
// ids$.log("ids$")
// console.log("\n")

// let postIds$ = D.derive(posts$, R.keys)
//
// let postsQuery$ = D.deriveArr(
//   [sources.state$, postIds$],
//   (state, postIds) =>
//     whatIsMissing(postsQueryFn(postIds), state)
// )
//
// let maybePosts$ = D.deriveMaybe(postsQuery$, posts$, R.id)

// TODO optional fields

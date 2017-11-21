import * as R from "ramda"

export let arrToObj = R.pipe(R.map(m => ([m.id, m])), R.fromPairs)

// fetch :: String, Object -> Promise a
export let fetch = (url, params) => {
  console.log(`fetching ${url}...`)
  return RR.get(url, params).json
}

// fetchModels :: String, Object -> Promise a
// export let fetchModels = (lenses) => {
//   return Promise.all(lenses.map(lens => {
//     let url = lensToUrl(lens)
//     console.log(`fetching ${url}...`)
//     return RR(url).json
//   })).then(M.arrToObj)
// }

// export let pathToUrl = (path) => {
//   return "/" + R.join("/", path)
// }

/**
 * SQL <-> REST
 *
 * select * from users
 * ["users"] -> GET /users
 *
 * select * from users where id = 1
 * ["users", "1"] -> GET /users/1
 *
 * select * from users where id in (1, 2, 3)
 * ["users", ["1", "2", "3"]] -> GET /users/1,2,3
 *
 * select * from users offset 0 limit 20
 * ["users"] {offset: 0, limit: 20} -> GET /users?offset=0&limit=20
 *
 * select * from users where email = "foobar@gmail.com"
 * ["users"] {filter: {op: "eq", args: ["email", "foobar@gmail.com"]}}
 * ["users"] {filter: {$eq: ["email", "foobar@gmail.com"]}
 * -> GET /users?filter=<...>
 *
 * select * from users where email = "foobar@gmail.com" and name != "Greg"
 * ["users"] {filter: {op: "and", args: [{op: "eq", args: ["email", "foobar@gmail.com"]}, {op: "neq", args: ["name", "Greg"]}]}
 * ["users"] {filter: {$and: [{$eq: ["email", "foobar@gmail.com"]}, {$neq: ["name", "Greg"]}]}
 * -> GET /users?filter=<...>
 *
 * select id from users
 * ["users", "-", "id"] -> GET /users/0-10/id
 */

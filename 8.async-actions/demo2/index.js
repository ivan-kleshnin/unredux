import {chan, delay, getAsync, mergeObj} from "./lib/utils"
import {store} from "./lib/store"
import detail from "./lib/detail"

// Actions =========================================================================================
let dbActions = {
  setUser: chan($ => $
    .map(user => state =>
      R.setL(["users", user.id], user, state)
    )
  ),
}

// State ===========================================================================================
let seed = {
  users: {},
}

let db = store(seed, dbActions, {
  doFn: (s) => console.log("# db:", s),
})

let userDetail = detail({id: null}, db.pluck("users"), {
  doFn: (s) => console.log("# userDetail.state:", s)
})

let asyncActions = {
  loadUser: chan($ => $
    .withLatestFrom(db, async (id, db) => {
      if (db.users[id]) {
        console.log("cache hit: do nothing")
      } else {
        console.log("cache miss: fetch data")
        let foo = await getAsync("foo", 500)
        let bar = await getAsync("bar", 500)
        dbActions.setUser({id, foo, bar})
      }
    })
  ),
}

// Test-bench ======================================================================================
db.subscribe()
userDetail.model.subscribe(s => {
  console.log("# userDetail.model:", s)
})
mergeObj(asyncActions).subscribe()

;(async () => {
  await delay(1000)
  console.log(`@ setUser({id: "1"})`)
  dbActions.setUser({id: "1", name: "Alice"})

  await delay(1000)
  console.log(`@ setUser({id: "2"})`)
  dbActions.setUser({id: "2", name: "Bob"})

  await delay(1000)
  console.log(`@ setUser({id: "3"})`)
  dbActions.setUser({id: "3", name: "Cindy"})

  for (let id of ["1", "2", "3"]) {
    await delay(1000)
    console.log(`@ navigate to /users/${id}`)
    userDetail.actions.setId(String(id))
  }

  await delay(1000)
  console.log(`@ setUser({id: "3"})`)
  dbActions.setUser({id: "3", name: "Cindy+"})
})()

// let id$ = O.of("1", "2", "3").mergeMap((id, i) => O.of(id).delay(i * 1000))
// id$.subscribe(userDetail.actions.setId)

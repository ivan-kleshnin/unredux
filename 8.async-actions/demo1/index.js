import {chan, delay, getAsync, mergeObj} from "./lib/utils"
import {store} from "./lib/store"

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
  doFn: (s) => console.log("state:", s),
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

// Test Bench ======================================================================================
db.subscribe()
mergeObj(asyncActions).subscribe()

;(async () => {
  await delay(2000)
  console.log(`@ loadUser("1")`)
  asyncActions.loadUser("1")

  await delay(2000)
  console.log(`@ setUser({id: "2"})`)
  actions.setUser({id: "2"})

  await delay(2000)
  console.log(`@ loadUser("2")`)
  asyncActions.loadUser("2")
})()

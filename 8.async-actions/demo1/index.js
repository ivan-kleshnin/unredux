import {chan, delay, getAsync, mergeObj} from "./lib/utils"
import {store} from "./lib/store"

// Actions =========================================================================================
let actions = {
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

let state = store(seed, actions, {
  doFn: (s) => console.log("state:", s),
})

let asyncActions = {
  loadUser: chan($ => $
    .withLatestFrom(state, async (id, state) => {
      if (state.users[id]) {
        console.log("cache hit: do nothing")
      } else {
        console.log("cache miss: fetch data")
        let foo = await getAsync("foo", 500)
        let bar = await getAsync("bar", 500)
        actions.setUser({id, foo, bar})
      }
    })
  ),
}

// Test-bench ======================================================================================
state.subscribe()
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

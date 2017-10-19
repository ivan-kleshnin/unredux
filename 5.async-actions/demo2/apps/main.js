import {chan} from "../lib/utils"
import {store} from "../lib/store"

// Actions =========================================================================================
export let actions = {
  setUser: chan($ => $
    .map(user => state =>
      R.set(["users", user.id], user, state)
    )
  ),
}

// State ===========================================================================================
export let seed = {
  users: {},
}

export let state = store(seed, actions, {
  doFn: (s) => console.log("# main state:", s)
})

// Async Actions ===================================================================================
export let asyncActions = {
  loadUser: chan($ => $ // --id-->
    .withLatestFrom(state, async (id, state) => {
      let idToFetch = !state.users[id] ? id : null
      if (idToFetch) {
        console.log(`cache miss: fetching data ${idToFetch}`)
        await delay(1000)
        dbActions.setUser({id, foo: "foo", bar: "bar"})
      }
    })
  ),

  loadUsers: chan($ => $ // --ids-->
    .withLatestFrom(state, async (ids, state) => {
      let idsToFetch = R.difference(ids, R.keys(state.users))
      if (idsToFetch.length) {
        console.log(`cache miss: fetching data ${idsToFetch}`)
        await delay(1000)
        for (let id of idsToFetch) {
          dbActions.setUser({id, foo: "foo", bar: "bar"})
        }
      }
    })
  ),
}

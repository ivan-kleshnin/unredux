import {chan, delay, getAsync, mergeObj} from "./utils"
import {makeActions, store, reducers} from "./store"

// Actions =========================================================================================
let actions = makeActions(reducers)

// State ===========================================================================================
let initialState = {
  // data
  repos: {},
  users: {},
}

let state = store(initialState, actions, {
  doFn: (s) => console.log("state:", s),
})

let asyncActions = {
  loadRepo: chan($ => $.withLatestFrom(state, (id, state) => {
    if (state.repos[id]) { // + required fields
      console.log("cache hit: do nothing")
    } else {
      console.log("cache miss: fetch data")
      ;(async () => {
        let foo = await getAsync("foo", 500)
        let bar = await getAsync("bar", 500)
        actions.set(["repos", id], {id, foo, bar})
      })()
    }
  })),

  loadUser: chan($ => $.withLatestFrom(state, (id, state) => {
    if (state.users[id]) { // + required fields
      console.log("cache hit: do nothing")
    } else {
      console.log("cache miss: fetch data")
      ;(async () => {
        let foo = await getAsync("foo", 500)
        let bar = await getAsync("bar", 500)
        actions.set(["users", id], {id, foo, bar})
      })()
    }
  })),
}

// Testbench =======================================================================================
state.subscribe()
mergeObj(asyncActions).subscribe()

;(async () => {
  await delay(2000)
  console.log(`@ actions.setRepo({id: "1"...})`)
  actions.set(["repos", "1"], {id: "1", foo: "foo"})

  await delay(2000)
  console.log(`@ loadRepo("1")`)
  asyncActions.loadRepo("1")

  await delay(2000)
  console.log(`@ loadRepo("2")`)
  asyncActions.loadRepo("2")
})()

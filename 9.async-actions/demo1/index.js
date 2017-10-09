import {Component} from "react"
import chan from "./chan"
import {mergeObj} from "./utils"
import {store} from "./store"

// Helpers =========================================================================================
let getAsync = (val, delay=500) => {
  return new Promise((resolve, reject) => setTimeout(() => resolve(val), delay))
}

let delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

// Actions =========================================================================================
let asyncActions = {
  loadRepo: chan(id => {
    console.log(`@ loadRepo(${id})`)
    return (state) => {
      if (state.repos[id]) {  // + required fields
        console.log("cache hit: do nothing")
      } else {
        console.log("cache miss: fetch data")
        ;(async () => {
          let foo = await getAsync("foo", 500)
          let bar = await getAsync("bar", 500)
          actions.setRepo({id, foo, bar})
        })()
      }
    }
  }),

  loadUser: chan(id => {
    console.log(`@ loadUser(${id})`)
    return (state) => {
      if (state.users[id]) {  // + required fields
        console.log("cache hit: do nothing")
      } else {
        console.log("cache miss: fetch data")
        ;(async () => {
          let foo = await getAsync("foo", 500)
          let bar = await getAsync("bar", 500)
          actions.setUser({id, foo, bar})
        })()
      }
    }
  }),
}

let actions = {
  setRepo: chan(repo => R.setL(["repos", repo.id], repo)),

  setUser: chan(user => R.setL(["users", user.id], user)),
}

// State ===========================================================================================
let initialState = {
  repos: {},
  users: {},
}

let state = store(initialState, actions, (s) => {
  console.log("state:", s)
  return s
})

// let visibleRepos = state.combineLatest(actions.)

// Effects =========================================================================================
state.subscribe()

mergeObj(asyncActions)
  .withLatestFrom(state, (fn, s) => fn(s))
  .subscribe()

// Testbench =======================================================================================
;(async () => {
  asyncActions.loadRepo("1")
  await delay(2000)
  asyncActions.loadRepo("1")
  await delay(2000)
  asyncActions.loadUser("1")
  await delay(2000)
  asyncActions.loadUser("2")
})()

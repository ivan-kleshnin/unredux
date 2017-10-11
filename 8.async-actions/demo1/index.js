import {Component} from "react"
import {chan, stateChan} from "./chan"
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
let stateLoop = stateChan()

let asyncActions = {
  loadRepo: chan($ => $
    .withLatestFrom(stateLoop, (id, state) => {
      if (state.repos[id]) { // + required fields
        console.log("cache hit: do nothing")
      } else {
        console.log("cache miss: fetch data")
        return (async () => {
          let foo = await getAsync("foo", 500)
          let bar = await getAsync("bar", 500)
          return {id, foo, bar}
        })()
      }
    })
    .filter(R.id)
    .mergeMap(x => Observable.from(x))
  ),

  loadUser: chan($ => $
    .withLatestFrom(stateLoop, (id, state) => {
      if (state.users[id]) { // + required fields
        console.log("cache hit: do nothing")
      } else {
        console.log("cache miss: fetch data")
        return (async () => {
          let foo = await getAsync("foo", 500)
          let bar = await getAsync("bar", 500)
          return {id, foo, bar}
        })()
      }
    })
    .filter(R.id)
    .mergeMap(x => Observable.from(x)),
  ),
}

let actions = {
  setRepo: chan($ => $
    .merge(asyncActions.loadRepo)
    .map(repo => R.setL(["repos", repo.id], repo))
  ),

  setUser: chan($ => $
    .merge(asyncActions.loadUser)
    .map(user => R.setL(["users", user.id], user))
  ),

  // Experimental
  merge: chan($ => $
    .map(stateFragment => state => R.merge(state, stateFragment))
  ),

  mergeDeep: chan($ => $
    .map(stateFragment => state => R.mergeDeepRight(state, stateFragment))
  ),
}

// State ===========================================================================================
let initialState = {
  // data
  repos: {},
  users: {},
}

let state = store(initialState, actions, (s) => {
  console.log("state:", s)
  stateLoop(s)
  return s
})

// Testbench =======================================================================================
state.subscribe()

;(async () => {
  await delay(2000)
  console.log(`@ actions.setRepo({id: "1"...})`)
  actions.setRepo({id: "1", foo: "foo"})

  // await delay(2000)
  // console.log(`@ actions.setRepo({id: "2"...})`)
  // actions.setRepo({id: "2", bar: "bar"})
  //
  // await delay(2000)
  // console.log(`@ actions.setUser({id: "1"...})`)
  // actions.setUser({id: "1", foo: "foo"})
  //
  // await delay(2000)
  // console.log(`@ actions.setRepo({id: "1"...})`)
  // actions.setRepo({id: "1", foo: "foo"})
  //
  await delay(2000)
  console.log(`loadRepo("1")`)
  asyncActions.loadRepo("1")

  await delay(2000)
  console.log(`loadRepo("2")`)
  asyncActions.loadRepo("2")

  // await delay(2000)
  // console.log("loadUser(1)")
  // asyncActions.loadUser("1")
  //
  // await delay(2000)
  // console.log("loadUser(2)")
  // asyncActions.loadUser("2")
})()

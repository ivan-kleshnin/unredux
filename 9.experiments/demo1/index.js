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
      if (state.repos[id]) {  // + required fields
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

let index = (initialState, models) => {
  initialState = R.merge({
    ids: [],
    filterFn: R.id,                            // default filtering
    sortFn: R.comparator((x1, x2) => x1 < x2), // default sorting
    loaded: false,
  }, initialState)

  let actions = {
    // Can't use currying here because RxJS injects shit like indexes, etc. (I'm tired of RxJS already)
    setIds:      chan($ => $.map(ids      => R.setL(["ids"],      ids))),
    setLoaded:   chan($ => $.map(loaded   => R.setL(["loaded"],   loaded))),
    setFilterFn: chan($ => $.map(filterFn => R.setL(["filterFn"], filterFn))),
    setSortFn:   chan($ => $.map(sortFn   => R.setL(["sortFn"],   sortFn))),

    // Experimental
    merge: chan($ => $.map(data => R.flip(R.merge)(data))),

    autoSet: models.map(models => {
      return index => {
        if (index.loaded) {
          // Can filter & sort (on Client)
          console.log("@ autoSet")
          return R.merge(index, {
            ids: R.pipe(
              R.values,
              R.filter(index.filterFn),
              R.sort(index.sortFn),
              R.pluck("id"),
            )(models)
          })
        } else {
          // Keep the original index (given by Server)
          return index
        }
      }
    }),

    autoReset: models
      .pairwise()
      .filter(([prev, next]) => !R.equals(prev, next))
      .map((x) => {
        return index => {
          if (index.loaded) {
            return index
          } else {
            console.log("@ autoReset")
            return {
              ids: [],                  // reset
              filterFn: index.filterFn, // keep
              sortFn: index.sortFn,     // keep
              loaded: false,            // reset
            }
          }
        }
      }),
  }

  let state = store(initialState, actions)

  return {actions, state}
}

let derived = {
  // data views (rethinking https://github.com/Paqmind/react-ultimate/blob/master/frontend/state.js#L168-L173)
  reposMainIndex: index({sortFn: R.descend(R.prop("createdAt"))}, state.pluck("repos")).state,
  reposTopIndex:  index({sortFn: R.id}, state.pluck("repos")).state,

  usersMainIndex:  index({sortFn: R.descend(R.prop("createdAt"))}, state.pluck("users")).state,
  usersAdminIndex: index({sortFn: R.descend(R.prop("createdAt")), filterFn: (u) => u.role == "admin"}, state.pluck("users")).state,
  usersTopIndex:   index({sortFn: (u) => u.score}, state.pluck("users")).state,
}

// Testbench =======================================================================================
state.subscribe()

derived.usersMainIndex.subscribe(index => {
  console.log("usersMainIndex:", index)
})

derived.usersAdminIndex.subscribe(index => {
  console.log("usersAdminIndex:", index)
})

derived.usersTopIndex.subscribe(index => {
  console.log("usersTopIndex:", index)
})

;(async () => {
  await delay(2000)
  console.log(`@1 actions.mergeDeep({users: ...})`)
  let users = {
    "1": {id: "1", role: "admin",   name: "Jac",     createdAt: "2011"},
    "2": {id: "2", role: "manager", name: "Bob",     createdAt: "2012"},
    "3": {id: "3", role: "client",  name: "Dorothy", createdAd: "2013"},
  }
  actions.mergeDeep({users})

  // await delay(2000)
  // console.log(`@2 actions.setUser({id: "1"...})`)

  // await delay(2000)
  // console.log(`@ repoIndexActions.setIds(["1", "2", "3"])`)
  // repoIndexActions.setIds(["1", "2", "3"])
  // await delay(2000)
  // console.log(`@ actions.setRepo({id: "1"...})`)
  // actions.setRepo({id: "1", foo: "boo", bar: "bar"})
  // await delay(2000)
  // console.log(`@ actions.setUser({id: "1"...})`)
  // actions.setUser({id: "1", foo: "boo", bar: "bar"})
  // await delay(2000)
  // console.log(`@ repoIndexActions.setLoaded(true)`)
  // repoIndexActions.setLoaded(true)
  // await delay(2000)
  // console.log(`@ actions.setRepo({id: "1"...})`)
  // actions.setRepo({id: "1", foo: "foo", bar: "bar"})
  // await delay(2000)
  // console.log("loadRepo(1)")
  // asyncActions.loadRepo("1")
  // await delay(2000)
  // console.log("loadRepo(2)")
  // asyncActions.loadRepo("2")
  // await delay(2000)
  // console.log("loadUser(1)")
  // asyncActions.loadUser("1")
  // await delay(2000)
  // console.log("loadUser(2)")
  // asyncActions.loadUser("2")
})()

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

let makeBasicActions = () => ({
  set: chan($ => $.map(args => state => {
    if (args instanceof Array) {
      let [path, val] = args
      return R.setL(path, val, state)
    } else {
      let val = args
      return val
    }
  })),

  over: chan($ => $.map(args => state => {
    if (args instanceof Array) {
      let [path, fn] = args
      return R.overL(path, fn, state)
    } else {
      let fn = args
      return fn(state)
    }
  })),

  merge: chan($ => $.map(args => state => {
    if (args instanceof Array) {
      let [path, stateFragment] = args
      return R.overL(path, R.mergeFlipped(stateFragment), state)
    } else {
      let stateFragment = args
      return R.merge(state, stateFragment)
    }
  })),

  mergeDeep: chan($ => $.map(args => state => {
    if (args instanceof Array) {
      let [path, stateFragment] = args
      return R.overL(path, R.mergeDeepFlipped(stateFragment), state)
    } else {
      let stateFragment = args
      return R.mergeDeep(state, stateFragment)
    }
  })),
})

// Actions =========================================================================================
let stateLoop = stateChan()

let asyncActions = {
  // loadRepo: chan($ => $
  //   .withLatestFrom(stateLoop, (id, state) => {
  //     if (state.repos[id]) {  // + required fields
  //       console.log("cache hit: do nothing")
  //     } else {
  //       console.log("cache miss: fetch data")
  //       return (async () => {
  //         let foo = await getAsync("foo", 500)
  //         let bar = await getAsync("bar", 500)
  //         return {id, foo, bar}
  //       })()
  //     }
  //   })
  //   .filter(R.id)
  //   .mergeMap(x => Observable.from(x))
  // ),

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

let actions = makeBasicActions()

// State ===========================================================================================
let initialState = {
  // data
  // repos: {},
  users: {},
}

let db = store(initialState, actions, (s) => {
  // console.log("state:", s)
  stateLoop(s)
  return s
})

let index = (collection, initialState, actions) => {
  initialState = R.merge({
    ids: [],
    fullLoad: false,
    filterFn: R.id,                            // default filtering
    sortFn: R.comparator((x1, x2) => x1 < x2), // default sorting
    offset: 0,                                 // default offset
    limit: 10,                                 // default limit
  }, initialState)

  let index = store(initialState, R.merge({
    autoSet: collection.map(collection => {
      return index => {
        if (index.fullLoad) {
          // Can filter & sort (on Client)
          // console.log("@ autoSet")
          return R.merge(index, {
            ids: R.pipe(
              R.values,
              R.filter(index.filterFn),
              R.sort(index.sortFn),
              R.slice(index.offset, index.limit),
              R.pluck("id"),
            )(collection)
          })
        } else {
          // Keep the original index (given by Server)
          return index
        }
      }
    }),

    // collection should auto-RESET if:
    // fullLoad=false and
    //   filterFn is changed? OR sortFn is changed? OR offset is changed? OR limit is changed?
    //   any model in collection is changed?

    autoReset: collection
      .pairwise()
      .filter(([prev, next]) => !R.equals(prev, next))
      .map((x) => {
        return index => {
          if (index.fullLoad) {
            return index
          } else {
            console.log("@ autoReset")
            return {
              ids: [],                  // reset
              fullLoad: false,          // reset
              filterFn: index.filterFn, // keep
              sortFn: index.sortFn,     // keep
              offset: index.offset,     // keep
              limit: index.limit,       // keep
            }
          }
        }
      }),
  }, actions))

  let models = collection
    .combineLatest(index.pluck("ids"), (collection, ids) => {
      return R.map(id => collection[id], ids)
    })
    .debounceTime(1)

  return {index, models}
}

// data views (rethinking https://github.com/Paqmind/react-ultimate/blob/master/frontend/state.js#L168-L173)
let usersMainIndexActions = makeBasicActions()

let usersMainIndex = index(
  db.pluck("users"),
  {sortFn: R.descend(R.prop("createdAt"))},
  usersMainIndexActions,
)

let usersTop3IndexActions = makeBasicActions()

let usersTop3Index = index(
  db.pluck("users"),
  {filterFn: u => u.role == "client", sortFn: R.descend(R.prop("score")), limit: 3},
  usersTop3IndexActions,
)

// Testbench =======================================================================================
db.subscribe()

// usersMainIndex.models.subscribe(models => {
//   console.log("usersMain (models):", models)
// })

usersTop3Index.models.subscribe(models => {
  console.log("usersTop3 (models):", models)
})

// usersMainIndex.index.subscribe(index => {
//   console.log("usersMain (index):", index)
// })

;(async () => {
  // await delay(2000)
  console.log(`\n@1 fetching db.users ...`)
  actions.set(["users"], {
    "1": {id: "1", role: "admin", name: "Jac", createdAt: "2011"},
    "2": {id: "2", role: "manager", name: "Bob", createdAt: "2012"},
    "3": {id: "3", role: "client", name: "Dorothy", createdAd: "2013", score: 98},
    "4": {id: "4", role: "client", name: "Rebecca", createdAd: "2013", score: 86},
    "5": {id: "5", role: "client", name: "Sam", createdAd: "2013", score: 95},
    "6": {id: "6", role: "client", name: "Alice", createdAd: "2013", score: 70},
    "7": {id: "7", role: "client", name: "Jordan", createdAd: "2013", score: 90},
  })

  // await delay(2000)
  console.log(`\n@2 visiting /users/ ...`)
  usersMainIndexActions.set(["ids"], ["1", "2", "3"])

  // await delay(2000)
  console.log(`\n@3 visiting /users/top-3/ ...`)
  usersTop3IndexActions.merge({ids: ["3", "5", "7"], fullLoad: true})

  // await delay(2000)
  console.log(`\n@4 upscore User id=7 ...`)
  actions.merge(["users", "7"], {score: 99})

  await delay(2000)
  console.log(`\n@5 downscore User id=3 ...`)
  actions.merge(["users", "3"], {score: 88})

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
  // console.log(`@ repoIndexActions.setFullLoad(true)`)
  // repoIndexActions.setFullLoad(true)
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

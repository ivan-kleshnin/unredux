import * as F from "framework"
import * as D from "selfdb"
import RR from "r2"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import UserIndex from "./UserIndex"
///
import {inspect} from "util"

export let makeSeed = () => ({
  filterFn: R.id,
  sortFn: R.ascend(R.prop("id")),
})

let lensToUrl = (lens) => {
  // ["users"]          -> /users/data.json         | select id from users
  // ["users", "1"]     -> /users/1/data.json       | select * from users where id = 1
  // ["users", "0-10"]  -> /users/0-10 ?????        | select * from users where offset = 0 AND limit = 10
  // ["users", ["1", "2", "3"]] -> /users/1,2,3 ??? | select * from users where id IN (1, 2, 3)
  return "/" + R.join("/", lens) + "/data.json"
}

// fetchModel :: Lens -> Promise a
let fetchModel = (lens) => (async () => {
  let url = lensToUrl(lens)
  console.log(`fetching ${url}...`)
  let model = await RR(url).json
  console.log(`got ${model}...`)
  return model
})()

// fetchModel2 :: Lens -> Promise a
let fetchModel2 = (lens) => {
  let url = lensToUrl(lens)
  console.log(`fetching ${url}...`)
  return RR(url).json.then(m => {
    console.log(`got ${model}...`)
    return m
  })
}

// fetchModels :: Array Lens -> Promise a
let fetchModels = (lenses) => (async () => {
  let models = {}
  for (let lens of lenses) {
    let url = lensToUrl(lens)
    console.log(`fetching ${url}...`)
    let model = await RR(url).json
    models[model.id] = model
  }
  return models
})()

// Need to set on standard names for models of {} and [] formats
let arrToObj = R.pipe(R.map(m => ([m.id, m])), R.fromPairs)

// fetchModels2 :: Array Lens -> Promise a
let fetchModels2 = (lenses) => {
  let promises = lenses.map(lens => {
    let url = lensToUrl(lens)
    console.log(`fetching ${url}...`)
    return RR(url).json
  })
  return Promise.all(promises).then(arrToObj)
}

export default (sources, key) => {
  let baseLens = ["users"]

  let intents = {
    fetch$: O.fromPromise(fetchModel2(baseLens))
      .catch(err => {
        console.warn(err) // TODO
      })
      .withLatestFrom(sources.state$, (requiredIds, state) => {
        // Find missing ids
        let presentIds = R.keys(R.view(baseLens, state))
        let missingIds = R.difference(requiredIds, presentIds)
        return R.map(missingId => R.append(missingId, baseLens), missingIds)
      })
      .concatMap(lenses => fetchModels2(lenses))
      .catch(err => {
        console.warn(err) // TODO
      })
      .share()
  }

  let action$ = O.merge(
    intents.fetch$.map(users => {
      return function afterFetch(state) {
        return R.over(baseLens, R.mergeFlipped(users), state)
      }
    }),
  )

  let index$ = D.run(
    () => D.makeStore({assertFn: R.id}),
    // D.withLog({key}),
  )(
    D.init(makeSeed()),
  ).$

  let users$ = F.derive(
    {
      table: sources.state$.pluck("users"),
      index: index$,
    },
    ({table, index}) => {
      return R.pipe(
        R.values,
        R.filter(index.filterFn),
        R.sort(index.sortFn),
      )(table)
    }
  )

  let Component = F.connect(
    {
      users: users$,
    },
    UserIndex,
  )

  return {action$, Component}
}

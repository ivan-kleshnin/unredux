import * as F from "framework"
import * as D from "selfdb"
import RR from "r2"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import UserDetail from "./UserDetail"

export let makeSeed = (id) => ({
  id,
})

let lensToUrl = (lens) => {
  // ["users"]      -> /users/data.json
  // ["users", "1"] -> /users/1/data.json
  return "/" + R.join("/", lens) + "/data.json"
}

// fetchModel :: Lens -> Promise a
let fetchModel = (lens) => (async () => {
  let url = lensToUrl(lens)
  console.log(`fetching ${url}...`)
  let model = await RR(url).json
  return model
})()

// fetchModel2 :: Lens -> Promise a
let fetchModel2 = (lens) => {
  let url = lensToUrl(lens)
  console.log(`fetching ${url}...`)
  return RR(url).json
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
  let baseLens = ["users", sources.props.params.id]

  let intents = {
    fetch$: sources.state$
      .filter(s => !R.view(baseLens, s))
      .concatMap(_ => fetchModel2(baseLens))
      .catch(err => {
        console.warn(err) // TODO
      })
      .share()
  }

  let action$ = O.merge(
    intents.fetch$.map(user => {
      return function afterFetch(state) {
        return R.set(baseLens, user, state)
      }
    }),
  )

  let detail$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    D.init(makeSeed(sources.props.params.id)),
  ).$

  let user$ = F.derive(
    {
      table: sources.state$.pluck("users"),
      detail: detail$,
    },
    ({table, detail}) => {
      return table[detail.id]
    }
  )

  let Component = F.connect(
    {
      user: user$,
    },
    UserDetail,
  )

  return {action$, Component}
}

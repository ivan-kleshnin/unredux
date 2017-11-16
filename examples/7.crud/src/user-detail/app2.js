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

let fetchModel = (lens) => ($) => {
  return $
    .concatMap(_ => (async () => {
      let url = lensToUrl(lens)
      console.log(`fetching ${url}...`)
      let model = await RR(url).json
      return model
    })())
    .catch(err => {
      console.warn(err) // TODO fix error swallowing @_@
    })
    .share()
}

let fetchModels = (lenses) => ($) => {
  return $
    .concatMap(_ => (async () => {
      let models = {}
      for (let lens of lenses) {
        let url = lensToUrl(lens)
        console.log(`fetching ${url}...`)
        let model = await RR(url).json
        models[model.id] = model
      }
      return models
    })())
    .catch(err => {
      console.warn(err) // TODO fix error swallowing @_@
    })
    .share()
}

let fetchingModel = ($) => {
  return $.map(lens => fetchModel(lens)($)).switch()
}

let fetchingModels = ($) => {
  return $.map(lenses => fetchModels(lenses)($)).switch()
}

export default (sources, key) => {
  let baseLens = ["users", sources.props.params.id]

  let intents = {
    fetch$: sources.state$
      .filter(s => !R.view(baseLens, s))
      .let(fetchModel(baseLens))
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

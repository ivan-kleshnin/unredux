import * as R from "@paqmind/ramda"
import A from "axios"
import K from "kefir"

// HTTP and stuff //////////////////////////////////////////////////////////////////////////////////

export let fetchIds = (baseLens) => $ => {
  return $.flatMapConcat(_ => K
    .fromPromise(A.get(`/api/${baseLens[0]}/~/id/`))
    .map(resp => R.pluck("id", resp.data.models))
  )
}

export let postFetchIds = (baseLens, state$) => $ => {
  return $.flatMapConcat(requiredIds => {
    return state$.take(1)
      .map(s => R.keys(R.view2(baseLens, s)))
      .map(presentIds => R.difference(requiredIds, presentIds))
  })
}

export let fetchModels = (baseLens) => $ => {
  return $.flatMapConcat(ids => {
    return ids.length
      ? K.fromPromise(A.get(`/api/${baseLens[0]}/${R.join(",", ids)}/`))
         .map(resp => resp.data.models)
      : K.constant({})
  })
}

export let fetchModel = (baseLens) => $ => {
  return $.flatMapConcat(_ => K
    .fromPromise(A.get(`/api/${baseLens[0]}/${baseLens[1]}/`))
    .map(resp => resp.data.models[baseLens[1]])
  )
}

export let postFetchModels = (baseLens) => $ => {
  return $.map(models => function afterGET(state) {
    return R.over2(baseLens, R.mergeFlipped(models), state)
  })
  .flatMapErrors(err => {
    console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
    return K.never() // TODO add alert box
  })
}

export let postFetchModel = (baseLens) => $ => {
  return $.map(model => function afterGET(state) {
    return R.set2(baseLens, model, state)
  })
  .flatMapErrors(err => {
    console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
    return K.never() // TODO add alert box
  })
}

export let createModel = (baseLens) => $ => {
  return $.flatMapConcat(form => K
    .fromPromise(A.post(`/api/${baseLens[0]}/`, form))
    .map(resp => resp.data.model)
  )
}

export let postCreateModel = (baseLens) => $ => {
  return $.map(model => function afterPOST(state) {
    return R.set2([...baseLens, model.id], model, state)
  }).flatMapErrors(err => {
    console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
    return K.never() // TODO add alert box
  })
}

export let editModel = (baseLens) => $ => {
  return $.flatMapConcat(form => K
    .fromPromise(A.put(`/api/${baseLens[0]}/${baseLens[1]}/`, form))
    .map(resp => resp.data.model)
  )
}

export let postEditModel = (baseLens) => $ => {
  return $.map(model => function afterPUT(state) {
    return R.set2(baseLens, model, state)
  }).flatMapErrors(err => {
    console.warn(`Request to "${err.response.config.url}" failed with message "${err.response.status} ${err.response.statusText}"`)
    return K.never() // TODO add alert box
  })
}

// Forms and stuff /////////////////////////////////////////////////////////////////////////////////

let capitalizeFirstChar = (s) => s[0].toUpperCase() + s.slice(1)

let makeFilteringIntents = (seed, sources) => {
  return {}
  // if (seed.filters) {
  //   return R.reduce((intents, key) => {
  //     let seedValue = seed.filters[key]
  //     let intentName = `changeFilter${capitalizeFirstChar(key)}$`
  //     let intent$ = do {
  //       if (R.is(String, seedValue)) {
  //         sources.DOM.fromName(`filters.${key}`)
  //           .listen("input")
  //           .map(ee => ee.element.value)
  //       }
  //       else if (R.is(Boolean, seedValue)) {
  //         sources.DOM.fromName(`filters.${key}`)
  //           .listen("click")
  //           .map(ee => ee.element.checked)
  //       }
  //       else {
  //         null
  //       }
  //     }
  //     return intent$
  //       ? R.set2(intentName, intent$, intents)
  //       : intents
  //   }, {}, R.keys(seed.filters))
  // } else {
  //   return {}
  // }
}

let makeFilteringActions = (seed, intents) => {
  return []
  // if (seed.filters) {
  //   return R.reduce((actions, key) => {
  //     let seedValue = seed.filters[key]
  //     let intentName = `changeFilter${capitalizeFirstChar(key)}$`
  //     if (intents[intentName]) {
  //       let action$ = intents[intentName].map(x => function setFilter(state) {
  //         return R.set2(["filters", key], x, state)
  //       })
  //       return R.append(action$, actions)
  //     } else {
  //       return actions
  //     }
  //   }, [], R.keys(seed.filters))
  // } else {
  //   return []
  // }
}

let makeSortingIntents = (seed, sources) => {
  if (seed.sort) {
    return {
      changeSort$: sources.DOM.fromName("sort").listen("click")
        .map(ee => ee.element.value)
    }
  } else {
    return {}
  }
}

let makeSortingActions = (seed, intents) => {
  if (seed.sort) {
    return [
      intents.changeSort$.map(x => function setSort(state) {
        return R.set2("sort", x, state)
      }),
    ]
  } else {
    return []
  }
}

// let makeIndexBlueprints = () => {
export let makeIndexIntents = (seed, sources) => R.pipe(
  R.mergeFlipped(makeFilteringIntents(seed, sources)),
  R.mergeFlipped(makeSortingIntents(seed, sources)),
)({})

export let makeIndexActions = (seed, intents) => R.pipe(
  R.concatFlipped(makeFilteringActions(seed, intents)),
  R.concatFlipped(makeSortingActions(seed, intents)),
)([])

  // return {
  //   makeIntents, makeActions,
  // }
// }

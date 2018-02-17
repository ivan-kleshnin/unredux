import * as R from "@paqmind/ramda"
import A from "axios"
import K from "kefir"
import * as D from "kefir.db"
import U from "urlz"

// Unsorted useful stuff ///////////////////////////////////////////////////////////////////////////
export let setDocument = R.curry((doc, state) => {
  return R.set2("document", {
    url: state.document.url,
    title: doc.seoTitle || doc.title || "",
    description: doc.seoDescription || "",
    ogType: "website",
  }, state)
})

export let safeInc = R.pipe(R.defaultTo(0), R.inc)
export let safeDec = R.pipe(R.defaultTo(0), R.dec)

// Navigation //////////////////////////////////////////////////////////////////////////////////////
export let root = (key) => {
  let urlLens = ["document", "url"]

  let makeIntents = (sources) => {
    return {
      navigateTo$: sources.DOM.from("a").listen("click")
        .filter(ee => {
          return !ee.element.dataset.ui // links with `data-ui` will be ignored
        })
        .flatMapConcat(ee => {
          let urlObj = U.parse(ee.element.href)

          if (urlObj.protocol && urlObj.host != document.location.host) {
            // External link
            return K.never()
          } else {
            // Internal link
            if (urlObj.pathname == document.location.pathname && urlObj.hash) {
              // Anchor link
              // do nothing, rely on default browser behavior
            } else {
              // Page link or Reset-Anchor link (foo#hash -> foo)
              ee.event.preventDefault() // take control on browser
              window.scrollTo(0, 0)     //
            }
            window.history.pushState({}, "", urlObj.relHref)
            return K.constant(urlObj.relHref)
          }
        }),

      navigateHistory$: D.isBrowser
        ? K.fromEvents(window, "popstate")
          .map(data => U.relHref(document.location.href)) // TODO scroll to hash (how?!)
        : K.never(),
    }
  }

  let makeActions = (intents) => {
    return [
      intents.navigateTo$.map(url => R.fn("navigateTo", R.set2(urlLens, url))),
      intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set2(urlLens, url))),
    ]
  }

  return {
    makeIntents,
    makeActions,
  }
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

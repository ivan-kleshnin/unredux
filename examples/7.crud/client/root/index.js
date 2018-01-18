import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import U from "urlz"
import MainMenu from "../common/MainMenu"
import router from "../router"

// SEED
export let seed = {
  // DOCUMENT
  url: "",

  // TABLES
  posts: {},
  users: {},

  // META
  _loading: {},
}

export default (sources, key) => {
  // ROUTING
  let contentSinks$ = D
    .deriveOne(sources.state$, ["url"])
    .map(url => {
      url = U.pathname(url)
      let {mask, params, payload: app} = router.doroute(url)
      app = F.isolate(app, key + mask, ["DOM", "Component"])
      let sinks = app({...sources, props: {mask, params, router}})
      return R.merge({action$: K.never()}, sinks)
    })

  // INTENTS
  let intents = {
    navigateTo$: sources.DOM.from("a").listen("click")
      .flatMapConcat(ee => {
        let urlObj = U.parse(ee.element.href)
        if (urlObj.protocol && urlObj.host != document.location.host) {
          // External link
          return K.never()
        } else {
          // App link
          if (urlObj.pathname == document.location.pathname) {
            // Anchor link
            // do nothing
          } else {
            // Page link
            ee.event.preventDefault()
            window.scrollTo(0, 0)
          }
          window.history.pushState({}, "", urlObj.relHref)
          return K.constant(urlObj.relHref)
        }
      }),

    navigateHistory$: D.isBrowser
      ? K.fromEvents(window, "popstate")
          .map(data => U.relHref(document.location.href)) // TODO scroll to hash (how?!)
      : K.never()
  }

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    // Init
    D.init(seed),
    D.initAsync(sources.state$),

    // Navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set2("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set2("url", url))),

    // Content
    contentSinks$.flatMapLatest(x => x.action$),
  ).$

  // COMPONENT
  let Component = F.connect(
    {
      url: D.deriveOne(state$, ["url"]),
      Content: contentSinks$.map(x => x.Component),
    },
    ({url, Content}) => {
      return <div>
        <div className="page-header">
          <p>
            Current URL: {url}
          </p>
          <MainMenu/>
        </div>
        <div className="page-content">
          <Content/>
        </div>
      </div>
    }
  )

  return {state$, Component}
}

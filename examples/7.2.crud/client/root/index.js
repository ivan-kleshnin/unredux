import * as F from "framework"
import K from "kefir"
import * as R from "ramda"
import React from "react"
import * as D from "selfdb"
import Url from "url"
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
      let {mask, params, payload: app} = router.doroute(url)
      app = F.isolate(app, key + mask, ["DOM", "Component"])
      let sinks = app({...sources, props: {mask, params, router}})
      return R.merge({action$: K.never()}, sinks)
    })

  // INTENTS
  let intents = {
    navigateTo$: sources.DOM.from("a").listen("click")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(ee => ee.element.href)
      .map(url => {
        url = Url.parse(url).pathname
        window.history.pushState({}, "", url)
        return url
      }),

    navigateHistory$: D.isBrowser
      ? K.fromEvents(window, "popstate")
          .map(data => document.location.pathname)
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
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set("url", url))),

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

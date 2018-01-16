import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import U from "urlz"
import router from "../router"

export let seed = {
  url: document.location.pathname,
  // page1, page2 use their own states (for the sake of demonstration)
  page3: 0,
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
          // Internal link
          ee.event.preventDefault()
          window.history.pushState({}, "", urlObj.relHref)
          window.scrollTo(0, 0)
          return K.constant(urlObj.relHref)
        }
      }),

    navigateHistory$: K.fromEvents(window, "popstate")
      .map(data => U.relHref(document.location.href)),
  }

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    // Init
    D.init(seed),

    // Navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set2("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set2("url", url))),

    // Content
    contentSinks$.flatMapLatest(x => x.action$),
  ).$

  let Component = F.connect(
    {
      url: D.deriveOne(state$, ["url"]),
      Content: contentSinks$.map(x => x.Component),
    },
    ({url, Content}) => {
      return <div>
        <p>
          Current URL: {url}
        </p>
        <p>
          <a href="/">Home</a>
          {" "}
          <a href="/page1#foo">Page 1</a>
          {" "}
          <a href="/page2?x=X">Page 2</a>
          {" "}
          <a href="/page3?x=X#foo">Page 3</a>
          {" "}
          <a href="https://github.com">GitHub.com</a>
          {" "}
          <a href="/not-found">Not Found</a>
        </p>
        <hr/>
        <Content/>
      </div>
    }
  )

  return {state$, Component}
}

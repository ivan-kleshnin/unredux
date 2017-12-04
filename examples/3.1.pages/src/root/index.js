import * as F from "framework"
import K from "kefir"
import * as R from "ramda"
import React from "react"
import * as D from "selfdb"
import Url from "url"
import Home from "./Home"
import NotFound from "./NotFound"
import page1App from "../page1"
import page2App from "../page2"
import page3App from "../page3"

export let seed = {
  url: document.location.pathname,
  // page1, page2 use their own states (for the sake of demonstration)
  page3: 0,
}

export default (sources, key) => {
  let contentSinks$ = D.deriveOne(
    sources.state$.map(x => x.url),
    (url) => {
      let sinks
      if (url == "/") {
        sinks = {Component: Home}
      } else if (url == "/page1") {
        sinks = F.isolate(page1App, key + ".page1", ["DOM", "Component"])(sources)
      } else if (url == "/page2") {
        sinks = F.isolate(page2App, key + ".page2", ["DOM", "Component"])(sources)
      } else if (url == "/page3") {
        sinks = F.isolate(page2App, key + ".page2", ["DOM", "Component"])(sources)
      } else {
        sinks = {Component: NotFound}
      }
      return R.merge({action$: K.never()}, sinks)
    }
  )

  let intents = {
    navigateTo$: sources.DOM.from("a").listen("click")
      .map(ee => (ee.event.preventDefault(), ee))
      .map(ee => ee.element.href)
      .map(url => {
        url = Url.parse(url).pathname
        window.history.pushState({}, "", url)
        return url
      }),

    navigateHistory$: K.fromEvents(window, "popstate")
      .map(data => document.location.pathname)
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(seed),

    // Navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set("url", url))),

    // Content
    contentSinks$.map(x => x.action$).flatMapLatest(),
  ).$

  let Component = F.connect(
    {
      url: state$.map(x => x.url),
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
          <a href="/page1">Page 1</a>
          {" "}
          <a href="/page2">Page 2</a>
          {" "}
          <a href="/page3">Page 3</a>
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

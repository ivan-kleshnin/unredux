import {connect, isolate} from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import Url from "url"
import Home from "./Home"
import NotFound from "./NotFound"
import page1App from "../page1"
import page2App from "../page2"
import page3App from "../page3"

// SEED
export let seed = {
  // page1, page2 use their own states (for the sake of demonstration)
  page3: 0,
}

export default (sources, {key, url}) => {
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

    navigateHistory$: K.fromEvents(window, "popstate")
      .map(data => document.location.pathname)
  }

  let url$ = K.merge([
    K.constant(url),
    intents.navigateTo$,
    intents.navigateHistory$,
  ]).toProperty()

  // ROUTING
  let page$ = url$
    .map(url => {
      if (url == "/") {
        return {Component: Home, action$: K.never()}
      } else if (url == "/page1") {
        return isolate(page1App, key + ".page1", ["DOM", "Component"])(sources)
      } else if (url == "/page2") {
        return isolate(page2App, key + ".page2", ["DOM", "Component"])(sources)
      } else if (url == "/page3") {
        return isolate(page3App, key + ".page3", ["DOM", "Component"])(sources)
      } else {
        return {Component: NotFound, action$: K.never()}
      }
    }
  ).toProperty()

  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    // Init
    D.init(seed),

    // Page
    page$.flatMapLatest(R.view2("action$")),
  ).$

  // COMPONENT
  let Component = connect(
    {
      url: url$,
      Content: page$.map(R.view2("Component")),
    },
    ({url, Content}) => {
      return <div>
        <p>{`
          URL: ${url}
        `}</p>
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

import * as F from "framework"
import K from "kefir"
import * as R from "ramda"
import React from "react"
import * as D from "selfdb"
import Url from "url"
import router from "../router"

export let seed = {
  url: "",
  posts: {},
  users: {},
}

export default (sources, key) => {
  let contentSinks$ = D.deriveOne(
    sources.state$.map(s => s.url),
    (url) => {
      let {mask, params, payload: app} = router.doroute(url)
      app = F.isolate(app, key + mask.replace(/^\//, "."), ["DOM", "Component"])
      let sinks = app({...sources, props: {mask, params, router}})
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

    navigateHistory$: D.isBrowser()
      ? K.fromEvents(window, "popstate")
          .map(data => document.location.pathname)
      : K.never()
  }

  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key, input: true, output: false}),
  )(
    // Init
    D.init(seed),
    sources.state$.take(1).map(R.always),

    // Navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set("url", url))),

    // Content
    contentSinks$.flatMapLatest(x => x.action$),
  ).$

  let Component = F.connect(
    {
      url: state$.map(s => s && s.url || "/"),
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
          <a href="/about">About</a>
          {" "}
          <a href="/users">Users</a>
          {" "}
          <a href="/users/1">User #1</a>
          {" "}
          <a href="/users/2">User #2</a>
          {" "}
          <a href="/contacts">Contacts</a>
        </p>
        <hr/>
        <Content/>
      </div>
    }
  )

  return {state$, Component}
}

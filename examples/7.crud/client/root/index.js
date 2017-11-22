import A from "axios"
import * as D from "selfdb"
import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import * as F from "framework"
import router from "../router"

export let seed = {
  url: document.location.pathname,
  posts: {},
  users: {},
}

export default (sources, key) => {
  let contentSinks$ = F.deriveOne(sources.state$.pluck("url"),
    (url) => {
      let {mask, params, payload: app} = router.doroute(url)
      app = F.isolate(app, key + mask.replace(/^\//, "."), ["DOM", "Component"])
      let sinks = app({...sources, props: {mask, params, router}})
      return R.merge({action$: O.of()}, sinks)
    }
  )

  let intents = {
    navigateTo$: sources.DOM.from("a").listen("click")
      .do(event => event.preventDefault())
      .map(event => event.target.attributes.href.value)
      .do(url => {
        window.history.pushState({}, "", url)
      })
      .share(),

    navigateHistory$: O.fromEvent(window, "popstate")
      .map(data => document.location.pathname)
  }

  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key, input: true, output: false}),
  )(
    // Init
    D.init(seed),

    // Navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set("url", url))),

    // Content
    contentSinks$.pluck("action$").switch(),
  ).$

  let Component = F.connect(
    {
      url: state$.pluck("url"),
      Content: contentSinks$.pluck("Component"),
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

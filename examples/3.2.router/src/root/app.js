import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import router from "../router"

export default (sources, key) => {
  let contentSinks$ = F.derive(
    {url: sources.state$.pluck("url")},
    ({url}) => {
      let {mask, payload: app} = router.doroute(url)
      let sinks = F.isolate(app, key + mask.replace(/^\//, "."))({...sources, props: {router}})
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
    D.withLog({key}),
  )(
    D.init({
      url: document.location.pathname,
      // page1, page2 use their own states (for the sake of demonstration)
      page3: 0,
    }),

    // navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set("url", url))),

    // content
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
        <a href="/" className="link">Home</a>
        {" "}
        <a href="/page1" className="link">Page 1</a>
        {" "}
        <a href="/page2" className="link">Page 2</a>
        {" "}
        <a href="/page3" className="link">Page 3</a>
        {" "}
        <a href="/not-found" className="link">Not Found</a>
        </p>
        <hr/>
        <Content/>
      </div>
    }
  )

  return {state$, Component}
}

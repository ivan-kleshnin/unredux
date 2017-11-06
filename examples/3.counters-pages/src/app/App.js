import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import Home from "./Home"
import Page1App from "../page1/Page1App"
import Page2App from "../page2/Page2App"

window.history.replaceState({}, "", document.location.pathname)

export default (sources, key) => {
  let content$ = F.derive("url", sources.$, (url) => {
    let content
    if (url == "/") {
      content = {$: O.of(), DOM: Home} // react component lifted to unredux app
    } else if (url == "/page1") {
      content = F.isolate(Page1App)(sources) // unredux component (using standalone state)
    } else if (url == "/page2") {
      content = F.isolate(Page2App, "c2")(sources) // unredux component (using global state)
                                                   // `isolate` is used here to isolate `$` channel (`DOM` will work equally WITH and WITHOUT it)
    } else {
      content = F.liftReact(() => <div>Not Found</div>)                     // on-the-fly component (opt #1: helper)
      // content = {$: O.of(), DOM: () => <div>Not Found</div>}             // on-the-fly component (opt #2: manual)
      // content = F.isolate(() => ({DOM: () => <div>Not Found</div>}))({}) // on-the-fly component (opt #3: isolate)
    }
    return content
  })

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
    D.withLog({name: key}),
  )(O.merge(
    F.init({
      url: document.location.pathname,
      // c1 uses it's own state (for the sake of demonstration)
      c2: 0,
    }),

    // navigation
    intents.navigateTo$.map(url => R.fn("navigateTo", R.set("url", url))),
    intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set("url", url))),

    // content
    content$.pluck("$").switch(),
  )).$

  state$.subscribe(sources.$)

  let DOM = F.connect(
    {
      url: state$.pluck("url"),
      Content: content$.pluck("DOM"),
    },
    (props) => {
      let {url, Content} = props
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
        <a href="/not-found" className="link">Not Found</a>
        </p>
        <hr/>
        <Content/>
      </div>
    }
  )

  return {DOM}
}

import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import {isolate, liftReact} from "../meta"
import Home from "./Home"
import Page1 from "../page1/Page1"
import Page2 from "../page2/Page2"

let c = 0

window.history.replaceState({url: document.location.pathname, c}, "", document.location.pathname)

export default (sources, key) => {
  let intents = {
    navigateTo$: sources.DOM.from("a").listen("click")
      .do(event => event.preventDefault())
      .map(event => event.target.attributes.href.value)
      .do(url => {
        window.history.pushState({url, c: ++c}, "", url)
      })
      .share(),

    navigateHistory$: O.fromEvent(window, "popstate")
      .map(data => {
        // let [
        //   {state: {c: prevC, url: prevUrl}},
        //   {state: {c: nextC, url: nextUrl}},
        // ] = data

        // console.log("c:", c)
        // console.log("data:", data)

        // let prevC = c
        // let nextC = data.state.c
        // let prevUrl =
        // let nextUrl = document.location.pathname

        // console.log("c:", c)
        // console.log("data.state.c:", data.state.c)
        // console.log("data.state.url:", data.state.url)
        // console.log("document.location.pathname:", document.location.pathname)

        // if (nextC >= prevC) return {url: nextUrl, direction: "forward"}
        // else                return {url: nextUrl, direction: "back"}

        return document.location.pathname
      })
  }

  let content$ = F.derive("url", sources.$, (url) => {
    let content
    if (url == "/") {
      content = {$: O.of(), DOM: Home} // react component lifted to unredux API
    } else if (url == "/page1") {
      content = isolate(Page1)(sources) // unredux component (using standalone state)
    } else if (url == "/page2") {
      content = isolate(Page2, "c2")(sources) // unredux component (using global state)
                                              // `isolate` is used here to isolate `$` channel (`DOM` will work equally WITH and WITHOUT it)
    } else {
      content = liftReact(() => <div>Not Found</div>)                     // on-the-fly component (opt #1: helper)
      // content = {$: O.of(), DOM: () => <div>Not Found</div>}           // on-the-fly component (opt #2: manual)
      // content = isolate(() => ({DOM: () => <div>Not Found</div>}))({}) // on-the-fly component (opt #3: isolate)
    }
    return content
  })

  let state = R.run(
    () => D.makeStore({name: key + ".db"}),
    D.withLog({}),
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
  ))

  let DOM = F.connect(
    {
      url: state.$.pluck("url"),
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

  state.$.subscribe(sources.$)

  return {DOM}
}

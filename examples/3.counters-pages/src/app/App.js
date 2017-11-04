import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"
import Home from "./Home"
import Page1 from "../page1/Page1"
import Page2 from "../page2/Page2"

let c = 0

window.history.replaceState({url: document.location.pathname, c}, "", document.location.pathname)

export default (sources, key) => {
  let intents = {
    navigateTo: sources.DOM.from("a").listen("click")
      .do(event => event.preventDefault())
      .map(event => event.target.attributes.href.value)
      .do(url => {
        window.history.pushState({url, c: ++c}, "", url)
      })
      .share(),

    navigateHistory: O.fromEvent(window, "popstate")
      // .startWith({state: {url: document.location.pathname, c}})
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

  let state = R.run(
    () => D.makeStore({name: key + ".db"}),
    D.withLog({}),
  )(O.merge(
    F.init({url: document.location.pathname}),

    // navigation
    intents.navigateTo.map(url => R.fn("navigateTo", R.set("url", url))),
    intents.navigateHistory.map(url => R.fn("navigateHistory", R.set("url", url))),
  ))

  let content$ = F.derive("url", state, (url) => {
    let page
    if (url == "/") {
      page = {DOM: Home}         // react component
    } else if (url == "/page1") {
      page = Page1(sources, key) // unredux component
    } else if (url == "/page2") {
      page = Page2(sources, key) // unredux component
    } else {
      page = {DOM: () => <div>Not Found</div>} // on-the-fly component
    }
    return page
  })

  let DOM = F.connect(
    {
      url: state.$.pluck("url"),
      Content: content$.pluck("DOM"),
    },
    (props) => {
      let {url, DOM} = props
      return <div>
        Current URL: {url}<br/>
        <a href="/" className="link">Home</a>
        {" "}
        <a href="/page1" className="link">Page 1</a>
        {" "}
        <a href="/page2" className="link">Page 2</a>
        <hr/>
        <Content/>
      </div>
    }
  )

  state.$.subscribe(sources.$)

  return {DOM}
}

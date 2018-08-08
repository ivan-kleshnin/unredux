import {connect, withRouting} from "vendors/framework"
import * as D from "kefir.db"
import React from "react"
import routes from "../routes"

// SEED
export let seed = {
  // page1, page2 use their own states (for the sake of demonstration)
  page3: 0,
}

let app = (sources, {key}) => {
  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    // Init
    D.init(seed),

    // Page
    sources.page.action$,
  ).$

  // COMPONENT
  let Component = connect(
    {
      route: sources.route$,
      Content: sources.page.Component$,
    },
    ({route, Content}) => {
      return <div>
        <pre>{`
          URL: ${route.url}
          mask: ${route.mask}
          params: ${JSON.stringify(route.params)}
          query: ${JSON.stringify(route.query)}
          hash: ${JSON.stringify(route.hash)}
        `}</pre>
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

  return {state$, route$: sources.route$, Component}
}

export default R.pipe(
  withRouting({
    routes,
  }),
)(app)

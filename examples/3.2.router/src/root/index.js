import {connect, withRoute} from "framework"
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
    sources.page$.flatMapLatest(R.view2("action$")),
  ).$

  // COMPONENT
  let Component = connect(
    {
      route: sources.route$,
      Content: sources.page$.map(R.view2("Component")),
    },
    ({route, Content}) => {
      return <div>
        <pre>{`
          URL: ${route.url}
          route.mask: ${route.mask}
          route.params: ${JSON.stringify(route.params)}
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

  return {state$, Component}
}

export default R.pipe(
  withRoute({
    routes,
  }),
)(app)

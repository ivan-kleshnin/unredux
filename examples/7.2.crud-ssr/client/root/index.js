import {connect, withRouting} from "framework"
import * as D from "kefir.db"
import React from "react"
import MainMenu from "../common/MainMenu"
import routes from "../routes"

// SEED
export let seed = {
  // DOCUMENT
  document: {
    title: "",
    description: "",
    // ogType ...
  },

  // DATA
  posts: {},
  users: {},

  // META
  _loading: {},
}

let app = (sources, {key}) => {
  // STATE
  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
  )(
    // Init
    D.isBrowser
      ? D.init(R.clone(window.state))
      : D.init(seed),

    // Page
    sources.page$.flatMapLatest(sinks => sinks.action$),
  ).$

  // COMPONENT
  let Component = connect(
    {
      route: sources.route$,
      Content: sources.page$.map(sinks => sinks.Component),
    },
    ({route, Content}) => {
      return <div>
        <div className="page-header">
          <pre>{`
            URL: ${route.url}
            route.mask: ${route.mask}
            route.params: ${JSON.stringify(route.params)}
          `}</pre>
          <MainMenu/>
        </div>
        <div className="page-content">
          <Content/>
        </div>
      </div>
    }
  )

  return {state$, Component}
}

export default R.pipe(
  withRouting({
    routes,
  }),
)(app)

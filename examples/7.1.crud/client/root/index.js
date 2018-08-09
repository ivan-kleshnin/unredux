import * as D from "kefir.db"
import React from "react"
import {connect, withRouting} from "vendors/framework"
import MainMenu from "../common/MainMenu"
import routes from "../routes"

// SEED
export let seed = {
  // DATA
  posts: null, // :: {Post}
  users: null, // :: {User}

  // LOADING (per-component and per-data loading indicators are HELL to support)
  loading: 0,
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
  withRouting({routes}),
)(app)

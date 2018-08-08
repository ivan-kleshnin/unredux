import {connect} from "vendors/framework"
import * as D from "kefir.db"
import React from "react"

export default (sources, {key, title}) => {
  let intents = {
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    sources.state$.map(R.prop(key)).take(1).map(R.always),

    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  ).$

  let Component = connect(
    {counter: state$},
    ({counter}) =>
      <p>
        {title}: <span>{counter}</span>
        {" "}
        <button data-key="inc">+1</button>
        {" "}
        <button data-key="dec">-1</button>
      </p>
    )

  return {state$, Component}
}

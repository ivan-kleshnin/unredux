import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"

export default (sources, key) => {
  let intents = {
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    sources.state$
      ? sources.state$.take(1).map(R.always)
      : D.init(0),
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  ).$

  let Component = F.connect(
    {counter: state$},
    ({counter}) =>
      <p>
        {sources.props.title}: <span>{counter}</span>
        {" "}
        <button data-key="inc">+1</button>
        {" "}
        <button data-key="dec">-1</button>
      </p>
    )

  return {state$, Component}
}

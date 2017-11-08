import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"

export default (sources, key) => {
  let intents = {
    inc$: sources.DOM.fromKey("inc").listen("click").mapTo(true),
    dec$: sources.DOM.fromKey("dec").listen("click").mapTo(true),
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(O.merge(
    D.init(0),
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  )).$

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

  return {Component}
}

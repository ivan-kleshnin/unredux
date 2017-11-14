import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as F from "framework"

export default (sources, key) => {
  let intents = {
    inc$: sources.DOM.fromKey("inc").listen("click").mapTo(true),
    dec$: sources.DOM.fromKey("dec").listen("click").mapTo(true),
  }

  let Component = F.connect(
    {counter: sources.state$},
    ({counter}) =>
      <p>
        {sources.props.title}: <span>{counter}</span>
        {" "}
        <button data-key="inc">+1</button>
        {" "}
        <button data-key="dec">-1</button>
      </p>
    )

  return {intents, Component}
}

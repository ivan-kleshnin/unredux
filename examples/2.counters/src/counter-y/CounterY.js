import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as F from "framework"

export default function CounterY(sources, key) {
  let intents = {
    inc$:  sources.DOM.fromKey("inc").listen("click"),
    dec$:  sources.DOM.fromKey("dec").listen("click"),
    add2$: sources.DOM.fromKey("add2").listen("click"),
    sub2$: sources.DOM.fromKey("sub2").listen("click"),
  }

  let $ = O.merge(
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
    intents.add2$.map(_ => R.add(2)),
    intents.sub2$.map(_ => R.flip(R.subtract)(2)),
  )

  let DOM = F.connect(
    {counter: sources.$},
    (props) =>
      <p>
        CounterY ({key}): <span>{props.counter}</span>
        {" "}
        <button data-key="inc">+1</button>
        {" "}
        <button data-key="dec">-1</button>
        {" "}
        <button data-key="add2">+2</button>
        {" "}
        <button data-key="sub2">-2</button>
      </p>
    )

  return {$, DOM}
}

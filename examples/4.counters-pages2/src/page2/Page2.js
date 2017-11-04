import * as R from "ramda"
import React from "react"
import {Observable as O} from "rxjs"
import * as F from "framework"

export default (sources, key) => {
  let intents = {
    inc$: sources.DOM.fromKey("inc").listen("click"),
    dec$: sources.DOM.fromKey("dec").listen("click"),
  }

  let $ = O.merge(
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  )

  let DOM = F.connect(
    {counter: sources.$},
    (props) =>
      <div>Page 2: {props.counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button></div>
  )

  return {$, DOM}
}

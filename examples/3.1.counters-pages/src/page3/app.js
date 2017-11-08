import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as F from "framework"

export default (sources, key) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click"),
    dec$: sources.DOM.fromKey("dec").listen("click"),
  }

  let action$ = O.merge(
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  )

  let Component = F.connect(
    {counter: sources.state$},
    ({counter}) =>
      <div>
        Page 3: {counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button>
        <p><i>Root State persistence (memory)</i></p>
      </div>,
    {
      componentWillMount(...args) {
        console.log("Page3 will mount!")
      },
      componentWillUnmount(...args) {
        console.log("Page3 will unmount!")
      }
    }
  )

  return {action$, Component}
}

import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as F from "framework"

export default F.withLifecycle((sources, key) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click").mapTo(true),
    dec$: sources.DOM.fromKey("dec").listen("click").mapTo(true),
  }

  // No need to unsubscribe here
  sources.Component.willMount$.subscribe(() => {
    console.log("Page3.app: Component.willMount$")
  })
  sources.Component.willUnmount$.subscribe(() => {
    console.log("Page3.app: Component.willUnmount$")
  })

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
      </div>
  )

  return {action$, Component}
})

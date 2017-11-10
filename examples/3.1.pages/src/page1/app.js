import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"

export default F.component((sources, key) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click").mapTo(true),
    dec$: sources.DOM.fromKey("dec").listen("click").mapTo(true),
  }

  // No need to unsubscribe here
  sources.Component.willMount$.subscribe(() => {
    console.log("Page1.app: Component.willMount$")
  })
  sources.Component.willUnmount$.subscribe(() => {
    console.log("Page1.app: Component.willUnmount$")
  })

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
    D.withMemoryPersistence({key}),
  )(O.merge(
    D.init(0),
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  )).$

  let Component = F.connect(
    {counter: state$},
    ({counter}) =>
      <div>
        Page 1: {counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button>
        <p><i>Memory persistence</i></p>
      </div>
  )

  return {Component}
})

import {connect, withLifecycle} from "vendors/framework"
import * as D from "kefir.db"
import React from "react"

// Decorate app with `withLifecycle` to handle lifecycle events declaratively (`sources.Component`)
export default withLifecycle((sources, {key}) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
  }

  sources.Component.willMount$.take(1).observe(() => {
    console.log("Page1.app: Component.willMount$")
  })
  sources.Component.willUnmount$.take(1).observe(() => {
    console.log("Page1.app: Component.willUnmount$")
  })

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
    D.withMemoryPersistence({key}),
  )(
    D.init(0),
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  ).$

  let Component = connect(
    {counter: state$},
    ({counter}) =>
      <div>
        Page 1: {counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button>
        <p><i>Memory persistence</i></p>
      </div>
  )

  return {Component}
})

import {connect, withLifecycle} from "vendors/framework"
import K from "kefir"
import React from "react"

// Decorate app with `withLifecycle` to handle lifecycle events declaratively (`sources.Component`)
export default withLifecycle((sources, {key}) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
  }

  sources.Component.willMount$.take(1).observe(() => {
    console.log("Page3.app: Component.willMount$")
  })
  sources.Component.willUnmount$.take(1).observe(() => {
    console.log("Page3.app: Component.willUnmount$")
  })

  let action$ = K.merge([
    intents.inc$.map(_ => R.over2("page3", R.inc)),
    intents.dec$.map(_ => R.over2("page3", R.dec)),
  ])

  let Component = connect(
    {counter: sources.state$.map(s => s.page3)},
    ({counter}) =>
      <div>
        Page 3: {counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button>
        <p><i>Root State persistence (memory)</i></p>
      </div>
  )

  return {action$, Component}
})

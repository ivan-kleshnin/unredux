import * as R from "@paqmind/ramda"
import * as F from "framework"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"

// Decorate app with `F.withLifecycle` to handle lifecycle events declaratively (`sources.Component`)
export default F.withLifecycle((sources, key) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
  }

  sources.Component.willMount$.take(1).observe(() => {
    console.log("Page2.app: Component.willMount$")
  })
  sources.Component.willUnmount$.take(1).observe(() => {
    console.log("Page2.app: Component.willUnmount$")
  })

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
    D.withLocalStoragePersistence({key: "3.1.pages." + key}),
  )(
    D.init(0),
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  ).$

  let Component = F.connect(
    {counter: state$},
    ({counter}) =>
      <div>
        Page 2: {counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button>
        <p><i>Local Storage persistence</i></p>
      </div>
  )

  return {Component}
})

import {connect} from "framework"
import * as D from "kefir.db"
import React from "react"

export default (sources, {key}) => {
  let intents = {
    // unsubscribed on state unsubscribe which happens on willUnmount
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
  }

  let state$ = D.run(
    () => D.makeStore({}),
    // D.withLog({key}),
    D.withLocalStoragePersistence({key: "3.2.router." + key}),
  )(
    D.init(0),
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  ).$

  let Component = connect(
    {counter: state$},
    ({counter}) =>
      <div>
        Page 2: {counter} <button data-key="inc">+1</button> <button data-key="dec">-1</button>
        <p><i>Local Storage persistence</i></p>
      </div>
  )

  return {Component}
}

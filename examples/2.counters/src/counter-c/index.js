import * as F from "framework"
import K from "kefir"
import * as R from "ramda"
import React from "react"

export default (sources, key) => {
  let intents = {
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
  }

  let action$ = K.merge([
    intents.inc$.map(_ => R.inc),
    intents.dec$.map(_ => R.dec),
  ])

  sources.state$.observe(s => {
    console.log("s:", s, "from some CounterC instance")
  })

  console.log(sources.state$)

  setTimeout(() => {
    console.log("timeout passed")
    sources.state$.observe(s => {
      console.log("s:", s, "from some CounterC instance 2")
    })
  }, 1000)

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

  return {action$, Component}
}

import * as R from "@paqmind/ramda"
import K from "kefir"
import * as D from "kefir.db"
import React from "react"
import * as F from "framework"

export default (sources, key) => {
  let intents = {
    inc$: sources.DOM.fromKey("inc").listen("click").map(R.always(true)),
    dec$: sources.DOM.fromKey("dec").listen("click").map(R.always(true)),
    add$: sources.DOM.fromKey("add").listen("click").map(({element}) => Number(element.dataset.val)),
    sub$: sources.DOM.fromKey("sub").listen("click").map(({element}) => Number(element.dataset.val)),
  }

  let state$ = D.run(
    () => D.makeStore({}),
    D.withLog({key}),
  )(
    D.init(0),
    intents.inc$.map(_ => R.inc),                 // .map(_ => ({fn: R.inc}))
    intents.dec$.map(_ => R.dec),                 // .map(_ => ({fn: R.dec}))
    intents.add$.map(v => R.add(v)),              // .map(v => ({fn: R.add, args: [v]}))
    intents.sub$.map(v => R.flip(R.subtract)(v)), // .map(v => ({fn: R.flip(R.subtract), args: [v]}))
  ).$

  let Component = F.connect(
    {counter: state$},
    ({counter}) =>
      <p>
        Counter: <span>{counter}</span>
        {" "}
        <button data-key="inc">+1</button>
        {" "}
        <button data-key="dec">-1</button>
        {" "}
        <button data-key="add" data-val="2">+2</button>
        {" "}
        <button data-key="sub" data-val="2">-2</button>
      </p>
    )

  return {state$, Component}
}

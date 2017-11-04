import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import * as D from "selfdb"
import * as F from "framework"

export default (sources, key) => {
  let intents = {
    inc: sources.DOM.fromKey("inc").listen("click"),
    dec: sources.DOM.fromKey("dec").listen("click"),
  }

  let state = R.run(
    () => D.makeStore({name: key + ".state"}),
    D.withLog({}),
  )(O.merge(
    F.init(0),
    intents.inc.map(_ => R.inc),
    intents.dec.map(_ => R.dec),
  ))

  let DOM = F.connect(
    {counter: state.$},
    (props) =>
      <p>
        Counter: <span>{props.counter}</span>
        {" "}
        <button data-key="inc">+1</button>
        {" "}
        <button data-key="dec">-1</button>
      </p>
    )

  return {DOM}
}

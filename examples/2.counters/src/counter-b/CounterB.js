// import PT from "prop-types"
import * as R from "ramda"
import {Observable as O} from "rxjs"
import React from "react"
import {makeStore, withLog} from "selfdb"
import {connect} from "framework"

export default function CounterB(sinks, key) {
  let intents = {
    inc: sinks.DOM("inc", "click"),
    dec: sinks.DOM("dec", "click"),
    add: sinks.DOM("add", "click"),
  }

  let $ = O.merge(
    intents.inc.map(_ => ({fn: R.inc})),
    intents.dec.map(_ => ({fn: R.dec})),
    intents.add.map(v => ({fn: R.add, args: [Number(v)]})),
  )

  let seed = 0

  let state = withLog({},
    makeStore({seed, name: "b"})
  )({
    map: $,
  })

  state.log.all()

  let DOM = connect(
    {counter: state.$},
    (props) =>
      <p>
        CounterB: <span>{props.counter}</span>
        {" "}
        <button data-key="inc">+1</button>
        {" "}
        <button data-key="dec">-1</button>
        {" "}
        <button data-key="add" data-val="2">+2</button>
      </p>
    )

  return {DOM}
}

// TODO does not work with CDN for some reason @_@
// Counter.propTypes = {
//   componentKey: PT.string.isRequired,
//   counter: PT.number.isRequired,
// }

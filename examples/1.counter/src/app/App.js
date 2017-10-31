import {Observable as O} from "rxjs"
import React from "react"
import {makeStore, withLog} from "selfdb"
import {connect} from "framework"

let inc = (x) => x + 1
let dec = (x) => x - 1

export default (sinks) => {
  let seed = 0

  let intents = {
    inc: sinks.DOM("*", "inc", "click"),
    dec: sinks.DOM("*", "dec", "click"),
  }

  let Store = makeStore({seed, name: "state"})
  Store = withLog({}, Store)

  let state = Store({
    map: O.merge(
      intents.inc.map(_ => ({fn: inc})), // {fn: inc} <=> inc (is obscure for logging with args in closure)
      intents.dec.map(_ => dec),         // dec <=> {fn: dec} (is transparent for logging)
    ),
  })

  state.log.all()

  let DOM = connect(
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

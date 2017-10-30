// import PT from "prop-types"
import * as R from "ramda"
import {Observable as O} from "rxjs"
import {connect} from "../lib"

export default function CounterX(sinks, key) {
  let intents = {
    inc:  sinks.DOM("inc", "click"),
    dec:  sinks.DOM("dec", "click"),
    add2: sinks.DOM("add2", "click"),
    sub2: sinks.DOM("sub2", "click"),
  }

  let $ = O.merge(
    intents.inc.map(_ => ({fn: R.inc})),
    intents.dec.map(_ => ({fn: R.dec})),
    intents.add2.map(_ => ({fn: R.add, args: [2]})),
    intents.sub2.map(_ => ({fn: R.subtract, args: [2]})),
  )

  let DOM = connect(
    {counter: sinks.$},
    (props) =>
      <p>
         CounterX ({key}): <span>{props.counter}</span>
         {" "}
         <button data-key="inc">+1</button>
         {" "}
         <button data-key="dec">-1</button>
         {" "}
         <button data-key="add2">+2</button>
         {" "}
         <button data-key="sub2">-2</button>
       </p>
     )

  return {$, DOM}
}

// TODO does not work with CDN for some reason @_@
// Counter.propTypes = {
//   componentKey: PT.string.isRequired,
//   counter: PT.number.isRequired,
// }

import {Observable as O} from "rxjs"
import {makeAtom, withLog} from "selfdb"
import {connect} from "framework"

let inc = (x) => x + 1
let dec = (x) => x - 1

export default (sinks) => {
  let seed = 0

  let intents = {
    inc: sinks.DOM("*", "inc", "click"),
    dec: sinks.DOM("*", "dec", "click"),
  }

  let $ = O.merge(
    intents.inc.map(_ => ({fn: inc})),
    intents.dec.map(_ => ({fn: dec})),
  )

  let Atom = makeAtom({seed, name: "state"})
  Atom = withLog({}, Atom)

  let state = Atom({
    map: $,
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

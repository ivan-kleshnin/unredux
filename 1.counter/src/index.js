import * as R from "ramda"
import {Atom, logging} from "unredux"
import connect from "./connect"

let meta = logging({
  increment: R.over(["counter"], R.inc),
  decrement: R.over(["counter"], R.dec),
  incrementIfOdd: state =>
    state.counter % 2
      ? R.over(["counter"], R.inc, state)
      : state,
  resetTo: (n, _) => ({counter: n}),
  // resetTo: (n) => () => ({counter: n}) won't pass sanity check (intended)
  // resetTo: (n) => _ => ({counter: n}) won't show 0 argument (impossible to track)
})

let state = Atom({counter: 0})

let App = connect(
  {counter: state.$.pluck("counter")},
  (props) =>
    <div className={props.className}>
      <p>
        Clicked: <span id="value">{props.counter}</span> times
        {" "}
        <button id="increment" onClick={() => state.over(meta.increment)}>+</button>
        {" "}
        <button id="decrement" onClick={() => state.over(meta.decrement)}>-</button>
        {" "}
        <button id="incrementIfOdd" onClick={() => state.over(meta.incrementIfOdd)}>Increment if odd</button>
        {" "}
        <button id="decrement" onClick={() => state.over(meta.resetTo(0))}>Reset</button>
      </p>
    </div>
)

ReactDOM.render(<App/>, document.getElementById("root"))

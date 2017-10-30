import * as R from "ramda"
import {Observable as O} from "rxjs"
import {makeStore, withLog} from "selfdb"
import {isolate} from "../meta"
import CounterA from "../counter-a/CounterA"
import CounterB from "../counter-b/CounterB"
import CounterX from "../counter-x/CounterX"
import CounterY from "../counter-y/CounterY"

export default (sinks, appKey) => {
  // State-independent components
  let A = isolate(CounterA, "a")(sinks)
  let B = isolate(CounterB, "b")(sinks)

  // State-connected components
  let X1 = isolate(CounterX, "x1")(sinks)
  let X2 = isolate(CounterX, "x2")(sinks)
  let Y1 = isolate(CounterY, "y1")(sinks)
  let Y2 = isolate(CounterY, "y2")(sinks)

  let seed = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  }

  let state = R.pipe(
    () => makeStore({seed, name: "db"}),
    withLog({}),
  )()({
    map: O.merge(
      X1.$,
      X2.$,
      Y1.$,
      Y2.$,
    ),
  })

  state.log.all()
  state.$.subscribe(sinks.$)

  let DOM = (props) => {
    return <div>
      <A.DOM/>
      <B.DOM/>
      <X1.DOM/>
      <X2.DOM/>
      <Y1.DOM/>
      <Y2.DOM/>
    </div>
  }

  return {DOM}
}

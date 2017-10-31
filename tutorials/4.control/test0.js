import {Observable as O} from "rxjs"
import * as R from "../../vendors/ramda"
import {makeStore, withLog, withControl} from "../../vendors/selfdb"

let seed = {x1: 0, x2: 0}

let mappers = {
  incrX1(s) {
    return R.over("x1", R.inc, s)
  },

  decrX2(s) {
    return R.over("x2", R.dec, s)
  },
}

let state = R.run(
  () => makeStore({seed, name: "db"}),
  withLog({}),
  withControl({}),
)({
  map: O.of(R.id), // Reactive actions are logged (so middleware stack is applied) ^_^
})

state.log.all()

// Proactive actions are logged (so middleware stack is applied) ^_^
state.map(mappers.incrX1)
state.map(mappers.decrX2)

// Next: test names and curried mappers

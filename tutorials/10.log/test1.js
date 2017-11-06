import A from "assert"
import {Observable as O} from "rxjs"
import * as R from "../../vendors/ramda"
import * as D from "../../vendors/selfdb"

let seed = {counter: 0}

// Testing VueJS-like API
let defineModifiers = R.mapObjIndexed((fn, key) => R.curryAs(key, fn))

let mods = defineModifiers({
  init() {
    return seed
  },

  counterInc(s) {
    return R.over("counter", R.inc, s)
  },

  counterAdd(v, s) {
    return R.over("counter", R.add(v), s)
  },

  counterSub(v, s) {
    return R.over("counter", R.flip(R.subtract)(v), s)
  },
})

// Comparison of approaches:
let action$ = O.of(
  mods.init,
  mods.counterInc,
  mods.counterAdd(2),
  mods.counterSub(2),
).concatMap(x => O.of(x).delay(200))

let state = D.run(
  () => D.makeStore({name: "db"}),
  D.withLog({}),
  D.withControl({}),
)(action$)

state.$.subscribe()

// Next: ???





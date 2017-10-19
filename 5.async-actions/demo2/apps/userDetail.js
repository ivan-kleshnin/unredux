import {chan, delay} from "../lib/utils"
import {store} from "../lib/store"
import * as main from "./main"

// Actions =========================================================================================
export let actions = {
  setId: chan($ => $
    .map(id => state =>
      R.set(["id"], id, state)
    )
  ),
}

// State ===========================================================================================
export let seed = {
  id: null,
}

export let state = store(seed, actions)
  .pluck("id")
  .combineLatest(main.state.pluck("users"), (id, coll) => coll[id])
  .do(s => console.log("# userDetail state:", s))
  .debounceTime(1) // diamond case*
  .distinctUntilChanged(R.equals)

// Async Actions ===================================================================================
export let asyncActions = {} // none

// (*)
// collection <- state <- $
//          \<-----------/

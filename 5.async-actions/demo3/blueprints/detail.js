import {chan} from "../utils"
import {store} from "../store"

export default makeApp = (main, modelName, collectionName) => {
  let collection = main.state.pluck(collectionName)

  // ACTIONS
  let makeActions = () => ({
    setId: chan($ => $
      .map(id => state =>
        id
      )
    ),

    seed: O.of(null),
  })

  // STATE
  let makeState = (actions, options={}) =>
    store(actions, options)
      .combineLatest(collection, (id, coll) => {
        return coll[id]
      })
      .do(s => console.log(`# ${modelName.toLowerCase()}Detail state:`, s))
      .debounceTime(1) // diamond case*
      .distinctUntilChanged(R.equals)

  // ASYNC ACTIONS
  let makeAsyncActions = (state, actions) => {
    throw Error("not implemented")
  }

  return {makeActions, makeSeed, makeState, makeAsyncActions}
}

// (*)
// collection <- state <- $
//          \<-----------/

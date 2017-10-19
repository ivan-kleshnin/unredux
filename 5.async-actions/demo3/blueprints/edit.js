import {chan, delay} from "../utils"
import {store} from "../store"

export default makeBlueprint = (main, modelName, collectionName) => {
  let collection = main.state.pluck(collectionName)

  // Actions =======================================================================================
  let makeActions = () => {
    throw Error("not implemented")
  }

  // State =========================================================================================
  let makeSeed = () => {
    throw Error("not implemented")
  }

  let makeState = (actions, options) => {
    throw Error("not implemented")
  }

  // Async Actions =================================================================================
  let makeAsyncActions = (state, actions) => ({
    ["save" + modelName]: chan($ => $ // --modelFragment-->
      .withLatestFrom(collection, async (modelFragment, collection) => {
        if (collection[modelFragment.id]) {
          throw Error(`model with id=${modelFragment.id} already exists`)
        }
        let model = R.merge(collection[modelFragment.id], modelFragment)
        await delay(1000) // TODO backend request: HTTP PUT
        main.actions["set" + modelName](model)
      })
    ),
  })

  return {makeActions, makeSeed, makeState, makeAsyncActions}
}

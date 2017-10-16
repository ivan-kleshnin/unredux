import {chan, delay} from "../lib/utils"
import {store} from "../lib/store"

export default makeBlueprint = (main, modelName, collectionName) => {
  let collection = main.state.pluck(collectionName)

  // ACTIONS
  let makeActions = () => {
    throw Error("not implemented")
  }

  // STATE
  let makeState = (actions, options) => {
    throw Error("not implemented")
  }

  // ASYNC
  let makeAsyncActions = (state, actions) => ({
    ["save" + modelName]: chan($ => $ // --modelFragment-->
      .withLatestFrom(collection, async (modelFragment, collection) => {
        if (collection[modelFragment.id]) {
          throw Error(`model with id=${modelFragment.id} already exists`)
        }
        let model = modelFragment
        await delay(1000) // TODO backend request: HTTP POST/PUT
        main.actions["set" + modelName](model)
      })
    ),

    // or as basic obscure callbacks
    // ["save" + modelName]: (modelFragment) => {
    //   collection.subscribe(coll => {
    //     // ...
    //   })
    // },
  })

  return {makeActions, makeSeed, makeState, makeAsyncActions}
}

import {chan, delay} from "../lib/utils"
import {store} from "../lib/store"

export default makeBlueprint = (main, modelName, collectionName) => {
  // Actions =======================================================================================
  let makeActions = () => ({
    ["set" + modelName]: chan($ => $
      .map(model => state =>
        R.set([collectionName, model.id], model, state)
      )
    ),
  })

  // State =========================================================================================
  let makeSeed = () => ({
    [collectionName]: {}
  })

  let makeState = () => {
    throw Error("use the basic `store` function")
  }

  // Async Actions =================================================================================
  let makeAsyncActions = (state, actions) => ({
    ["load" + modelName]: chan($ => $ // --id-->
      .withLatestFrom(state, async (id, state) => {
        let idToFetch = !state[collectionName][id] ? id : null
        if (idToFetch) {
          console.log(`cache miss: fetching data ${idToFetch}`)
          await delay(1000)
          dbActions.setUser({id, foo: "foo", bar: "bar"})
        }
      })
    ),

    ["load" + modelName + "s"]: chan($ => $ // --ids-->
      .withLatestFrom(state, async (ids, state) => {
        let idsToFetch = R.difference(ids, R.keys(state[collectionName]))
        if (idsToFetch.length) {
          console.log(`cache miss: fetching data ${idsToFetch}`)
          await delay(1000)
          for (let id of idsToFetch) {
            actions["set" + modelName]({id, foo: "foo", bar: "bar"})
          }
        }
      })
    ),
  })
}


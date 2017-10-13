import {chan} from "./utils"
import {store} from "./store"

export default (initialState, collection, options) => {
  initialState = R.merge({
    id: null,
  }, initialState)

  let actions = {
    setId: chan($ => $.map(id => state => R.setL(["id"], id, state))),
    reset: chan($ => $.map(id => state => initialState)),
  }

  let state = store(initialState, actions, options)

  let model = collection
    .combineLatest(state.pluck("id"), (collection, id) => {
      return collection[id]
    })
    .debounceTime(1)
    .distinctUntilChanged(R.equals)

  return {actions, state, model}
}

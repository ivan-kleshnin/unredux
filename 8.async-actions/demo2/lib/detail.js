import {chan} from "./utils"
import {store} from "./store"

export default (seed, collection, options={}) => {
  seed = R.merge({
    id: null,
  }, seed)

  let actions = {
    setId: chan($ => $.map(id => state => R.setL(["id"], id, state))),
    reset: chan($ => $.map(id => state => seed)),
  }

  let state = store(seed, actions, options)

  let model = collection
    .combineLatest(state.pluck("id"), (collection, id) => {
      return collection[id]
    })
    .debounceTime(1)
    .distinctUntilChanged(R.equals)

  return {actions, state, model}
}

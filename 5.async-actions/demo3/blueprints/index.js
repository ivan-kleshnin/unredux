import {chan} from "../utils"
import {store} from "../store"

export default makeBlueprint = (main, modelName, collectionName) => {
  let collection = main.state.pluck(collectionName)

  // ACTIONS
  let makeActions = () => ({
    autoSet: collection.map(collection => {
      return index => {
        if (index.fullLoad) {
          // Can filter & sort (on Client)
          // console.log("@ autoSet")
          return R.merge(index, {
            ids: R.pipe(
              R.values,
              R.filter(index.filterFn),
              R.sort(index.sortFn),
              R.slice(index.offset, index.limit),
              R.pluck("id"),
            )(collection)
          })
        } else {
          // Keep the original index (given by Server)
          return index
        }
      }
    }),

    // collection should auto-RESET if:
    // fullLoad=false AND
    //     filterFn is changed? OR sortFn is changed? OR offset is changed? OR limit is changed?
    //     any model in collection is changed?

    autoReset: collection.pairwise()
      .filter(([prev, next]) => !R.equals(prev, next))
      .map((x) => {
        return index => {
          if (index.fullLoad) {
            return index
          } else {
            console.log("@ autoReset")
            return {
              ids: [],                  // reset
              fullLoad: false,          // reset
              filterFn: index.filterFn, // keep
              sortFn: index.sortFn,     // keep
              offset: index.offset,     // keep
              limit: index.limit,       // keep
            }
          }
        }
      }),
  })

  // STATE
  let makeSeed = () => ({
    ids: [],
    fullLoad: false,
    filterFn: R.id,                            // default filtering
    sortFn: R.comparator((x1, x2) => x1 < x2), // default sorting
    offset: 0,                                 // default offset
    limit: 10,                                 // default limit
  })

  let makeState = (seed, actions, options={}) =>
    store(seed, actions, options)
      .combineLatest(collection, (ids, coll) => {
        return R.map(id => collection[id], ids)
      })
      .do(s => console.log(`# ${modelName.toLowerCase()}Index state:`, s))
      .debounceTime(1) // diamond case*
      .distinctUntilChanged(R.equals)

  // ASYNC ACTIONS
  // TODO load index
  let makeAsyncActions = (state, actions) => {
    throw Error("not implemented (yet)!")
  }

  return {makeActions, makeSeed, makeState, makeAsyncActions}
}

// (*)
// collection <- state <- $
//          \<-----------/

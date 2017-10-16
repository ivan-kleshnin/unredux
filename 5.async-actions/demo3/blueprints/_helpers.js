let doUseBlueprint = (main, blueprint) => {
  let {makeActions, makeSeed, makeState, makeAsyncActions} = blueprint

  let actions = makeActions()

  let seed = makeSeed()

  let state = makeState(seed, actions)

  let asyncActions = makeAsyncActions(state, actions)

  state.subscribe()
  mergeOjb(asyncActions).subscribe()
}

// ```js
// let doUseBlueprint = (main, blueprint) => {
//   let {makeActions, makeSeed, makeState, makeAsyncActions} = blueprint
//
//   let actions = makeActions()
//
//   let seed = makeSeed()
//
//   let state = makeState(seed, actions)
//
//   let asyncActions = makeAsyncActions(state, actions)
//
//   state.subscribe()
//   mergeOjb(asyncActions).subscribe()
// }
// ```
//
// =>
//
// ```js
// let doUseBlueprint = (main, blueprint) => {
//   let {makeActions, makeState, makeAsyncActions} = blueprint
//
//   let actions = makeActions()
//
//   let state = makeState(actions)
//
//   let asyncActions = makeAsyncActions(state, actions)
//
//   state.subscribe()
//   mergeOjb(asyncActions).subscribe()
// }
// ```

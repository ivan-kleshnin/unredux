import {chan} from "../lib/utils"
import {store} from "../lib/store"

let repoBlueprint = makeBlueprint(main, "Repo", "repos")
let userBlueprint = makeBlueprint(main, "User", "users")

export let actions = R.pipe(
  // TODO prevent {seed} override – combine and concat seed events instead
  R.mergeFlipped(repoBlueprint.makeActions()), // sets {setRepo: fn$}
  R.mergeFlipped(userBlueprint.makeActions()), // sets {setUser: fn$}
  // ...
)({})

export let seed = R.pipe(
  R.mergeFlipped(repoBlueprint.makeSeed()), // sets {users: {}}
  R.mergeFlipped(userBlueprint.makeSeed()), // sets {repos: {}}
  // ...
)({})

export let state = store(seed, actions, {})

export let asyncActions = R.pipe(
  R.mergeFlipped(repoBlueprint.makeSeed()), // sets {loadUser: fn$, loadUser: fn$}
  R.mergeFlipped(userBlueprint.makeSeed()),
  // ...
)({})

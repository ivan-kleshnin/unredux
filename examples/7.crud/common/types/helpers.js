import * as R from "ramda"

export let arrToObj = R.pipe(R.map(m => ([m.id, m])), R.fromPairs)

import DF from "date-fns"
import * as R from "ramda"

export let arrToObj = R.pipe(R.map(m => ([m.id, m])), R.fromPairs)

export let age = (user) =>
  DF.differenceInYears(new Date(), new Date(user.birthDate))

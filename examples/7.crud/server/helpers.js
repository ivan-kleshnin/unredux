import * as R from "../../../vendors/ramda"

export let splitIds = R.pipe(R.split("/"), R.nth(-1), R.split(","))

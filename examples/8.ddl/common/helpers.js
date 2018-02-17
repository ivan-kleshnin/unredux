import * as R from "@paqmind/ramda"
import generate from "nanoid/generate"

export let makeId = () => generate("0123456789abcdef", 10)

export let arrToObj = R.pipe(R.map(m => ([m.id, m])), R.fromPairs)

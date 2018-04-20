export let safeInc = R.pipe(R.defaultTo(0), R.inc)

export let safeDec = R.pipe(R.defaultTo(0), R.dec)

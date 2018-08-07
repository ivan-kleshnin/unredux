// export let safeInc = R.pipe(R.defaultTo(0), R.inc)
//
// export let safeDec = R.pipe(R.defaultTo(0), R.dec)

export let incLoading = R.over2("loading", R.inc)

export let decLoading = R.over2("loading", R.dec)

// export let removeLoading = R.fn("removeLoading", R.over2("loading", R.dec))

export let makeFilterFn = (filters) => {
  return (user) => {
    if (filters.id) {
      if (!R.contains(filters.id, user.id))
        return false
    }
    if (!R.isNil(filters.isActive)) {
      if (user.isActive != filters.isActive)
        return false
    }
    // ...
    return true
  }
}

export let makeSortFn = (sort) => {
  let [ascDesc, propName] = [sort[0], R.drop(1, sort)]
  let dirFn = ascDesc == "-" ? R.descend : R.ascend
  let propFn = R.prop(propName)
  return dirFn(propFn)
}

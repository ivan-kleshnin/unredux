import * as R from "@paqmind/ramda"

export let makeFilterFn = (filters) => {
  return (post, user) => {
    if (filters.id) {
      if (!R.contains(filters.id, post.id))
        return false
    }
    
    if (filters.user) {
      if (!R.isNil(filters.user.isActive)) {
        if (!user || user.isActive != filters.user.isActive)
          return false
      }
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

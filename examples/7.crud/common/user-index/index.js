import * as R from "ramda"

export let makeFilterFn = (filter) => {
  return (user) => {
    if (filter.id) {
      if (!R.contains(filter.id, user.id))
        return false
    }
    if (filter.fullname) {
      if (!R.contains(filter.fullname, user.fullname))
        return false
    }
    // TODO improve, from/to
    if (filter.dob) {
      if (filter.dob != user.dob)
        return false
    }
    if (filter.role) {
      if (filter.role != user.role)
        return false
    }
    return true
  }
}

export let makeSortFn = (sort) => {
  let [ascDesc, propName] = [sort[0], R.drop(1, sort)]
  let dirFn = ascDesc == "-" ? R.descend : R.ascend
  let propFn = R.prop(propName)
  return dirFn(propFn)
}

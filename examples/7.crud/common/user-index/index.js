import * as R from "ramda"
import * as M from "common/models"

export let makeFilterFn = (filter) => {
  return (user) => {
    if (filter.id) {
      if (!R.contains(filter.id, user.id))
        return false
    }
    if (filter.role) {
      if (!R.contains(filter.role, user.role))
        return false
    }
    if (filter.fullname) {
      if (!R.contains(filter.fullname, user.fullname))
        return false
    }
    if (filter.ageFrom) {
      if (!user.birthDate || M.age(user) < filter.ageFrom)
        return false
    }
    if (filter.ageTo) {
      if (!user.birthDate || M.age(user) > filter.ageTo)
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

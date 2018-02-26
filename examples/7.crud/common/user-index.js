import * as R from "@paqmind/ramda"
import {age} from "common/types/User"

export let makeFilterFn = (filters) => {
  return (user) => {
    if (filters.id) {
      if (!R.contains(filters.id, user.id))
        return false
    }
    if (filters.role) {
      if (!R.contains(filters.role, user.role))
        return false
    }
    if (filters.fullname) {
      if (!R.contains(filters.fullname, user.fullname))
        return false
    }
    if (filters.ageFrom) {
      if (!user.birthDate || age(user) < filters.ageFrom)
        return false
    }
    if (filters.ageTo) {
      if (!user.birthDate || age(user) > filters.ageTo)
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

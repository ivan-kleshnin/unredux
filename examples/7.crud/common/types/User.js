import * as R from "@paqmind/ramda"
import DF from "date-fns"
import T from "tcomb"
import {makeId} from "common/helpers"
import {limitedString} from "./common"

export let Role = T.enums.of(["admin", "manager", "customer", "pet"], "Role")

export let User = T.struct({
  id: T.String, // TODO length, format
  fullname: T.String, // TODO max length
  email: T.String, // TODO format
  role: Role,
  birthDate: T.String, // TODO format
}, "User")

export let UserForm = T.struct({
  fullname: T.String, // TODO max length
  email: T.String, // TODO format
  birthDate: T.String, // TODO format
}, "UserForm")

export let makeUser = (data) => {
  return User(R.merge({
    id: data.id ? data.id : makeId(),
    fullname: "", // TODO random fullname
    email: "", // TODO random email
    role: "", // TODO random array pick
    publishDate: "", // TODO random between
  }, data))
}

export let age = (user) =>
  DF.differenceInYears(new Date(), new Date(user.birthDate))



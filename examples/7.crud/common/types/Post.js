import DF from "date-fns"
import * as R from "ramda"
import T from "tcomb"
import {makeId} from "common/helpers"
import {formattedString, limitedString} from "./common"

export let Post = T.struct({
  id: T.String, // formattedString(/\w{10}/),
  title: limitedString(1, 200),
  text: limitedString(1, 2000),
  // isPublished: T.Boolean,
  // publishDate: T.String, // TODO format
}, "Post")

export let PostForm = T.struct({
  title: limitedString(1, 200),
  text: limitedString(1, 2000),
  // isPublished: T.Boolean,
  // publishDate: T.String, // TODO format
}, "PostForm")

export let makePost = (data) => {
  return Post(R.merge({
    id: data.id ? data.id : makeId(),
    title: "", // TODO random title
    text: "", // TODO random lorem-ipsum
    // isPublished: false, // TODO random true | false
    // publishDate: "", // TODO random between
  }, data))
}

export let strToTags = (str) => R.map(R.trim, R.split(",", R.toLower(str)))

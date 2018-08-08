import T from "tcomb"
import {DateString, formattedString, limitedString, tagString, tagsString} from "./common"

// Model describes and validates DB state so
// it shouldn't contain types non-representable in DB (DBs, if 2+ are used)
export let Post = T.struct({
  id: formattedString(/^\w{10}$/),
  title: limitedString(1, 200),
  text: limitedString(1, 2000),
  tags: T.list(tagString()),
  isPublished: T.Boolean,
  publishDate: T.Date,
}, "Post")

// Form describes and validates user input state so
// it may significantly differ from Model in both types and numbers of fields
export let PostForm = T.struct({
  title: limitedString(1, 200),
  text: limitedString(1, 2000),
  tags: tagsString(),
  isPublished: T.Boolean,
  publishDate: DateString,
}, "PostForm")

export let strToTags = (str) => R.pipe(
  R.toLower,
  R.split(","),
  R.map(R.trim),
  R.filter(Boolean),
)(str || "")

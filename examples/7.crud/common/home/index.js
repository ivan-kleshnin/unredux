import * as R from "@paqmind/ramda"
import * as T from "../types"

export let makeFilterFn = (filters) => {
  return (post) => {
    if (filters.id) {
      if (!R.contains(filters.id, post.id))
        return false
    }
    if (filters.title) {
      if (!R.contains(filters.title, post.title))
        return false
    }
    if (filters.tags) {
      let filterTags = T.strToTags(filters.tags)
      if (!R.intersection(filterTags, post.tags).length)
        return false
    }
    if (filters.isPublished) {
      if (!post.isPublished)
        return false
    }
    if (filters.publishDateFrom) {
      if (!post.publishDate || post.publishDate < filters.publishDateFrom)
        return false
    }
    if (filters.publishedDateTo) {
      if (!post.publishDate || post.publishDate > filters.publishDateTo)
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

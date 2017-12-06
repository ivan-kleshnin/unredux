import * as R from "ramda"

export let makeFilterFn = (filter) => {
  return (post) => {
    if (filter.id) {
      if (!R.contains(filter.id, post.id))
        return false
    }
    if (filter.title) {
      if (!R.contains(filter.title, post.title))
        return false
    }
    if (filter.tags) {
      let filterTags = R.map(R.trim, R.split(",", R.toLower(filter.tags)))
      if (!R.intersection(filterTags, post.tags).length)
        return false
    }
    if (filter.isPublished) {
      if (!post.isPublished)
        return false
    }
    if (filter.publishDateFrom) {
      if (!post.publishDate || post.publishDate < filter.publishDateFrom)
        return false
    }
    if (filter.publishedDateTo) {
      if (!post.publishDate || post.publishDate > filter.publishDateTo)
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

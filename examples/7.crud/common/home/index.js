import * as R from "ramda"

export let makeFilterFn = (filter) => {
  return (post) => {
    if (filter.id) {
      if (!R.contains(filter.id, post.id))
        return false
    }
    if (filter.search) {
      if (!R.contains(filter.search, post.title) && !R.contains())
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
    return true
  }
}

export let makeSortFn = (sort) => {
  let [ascDesc, propName] = [sort[0], R.drop(1, sort)]
  let dirFn = ascDesc == "-" ? R.descend : R.ascend
  let propFn = R.prop(propName)
  return dirFn(propFn)
}

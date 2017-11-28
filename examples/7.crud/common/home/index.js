import * as R from "ramda"

export let makeFilterFn = (filter) => {
  return (post) => {
    if (filter.title) {
      if (!R.startsWith(filter.title, post.title))
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
  let dirFn = ascDesc == "+" ? R.ascend : R.descend
  let propFn = R.prop(propName)
  return dirFn(propFn)
}

import * as R from "@paqmind/ramda"

// type Range = [Number, Number]
// (Number, Range) -> Boolean
export let isBetween = (n, range) => {
  return range[0] <= n && n <= range[1]
}

// (Array a, Array a) -> Array a
export let concatUniq = R.pipe(R.concat, R.uniq, R.sortBy(R.id))

// (Range, Range) -> Range
export let combineRanges = (range1, range2) => {
  let [leftRange, rightRange] = range1[0] < range2[0]
    ? [range1, range2]
    : [range2, range1]
  let offset = leftRange[0]
  let limit = Math.max(rightRange[0] + rightRange[1], leftRange[1])
  return [offset, limit]
}

// (Range, Range) -> Boolean
export let areRangesOverlapping = (range1, range2) => {
  return isBetween(range2[0], range1)
      || isBetween(range2[1], range1)
      || isBetween(range1[0], range2)
      || isBetween(range1[1], range2)
}

// (Range, Range) -> Boolean
export let areRangesClose = (range1, range2) => {
  let [leftRange, rightRange] = range1[0] < range2[0]
    ? [range1, range2]
    : [range2, range1]
  let distanceBetween = Math.abs(rightRange[0] - leftRange[1])
  let maxSpan = Math.max(range1[1] - range1[0], range2[1] - range2[0])
  return distanceBetween <= maxSpan
}

// Query -> Boolean
export let isModelsQuery = (query) => R.is(Array, query) && R.is(Array, query[1])

// Query -> Boolean
export let isIndexQuery = (query) => R.is(Array, query) && R.isPlainObj(query[1])

export let defaultIds = R.defaultTo([])
export let defaultFields = R.defaultTo([])
export let defaultFilters = R.defaultTo(null)
export let defaultSort = R.defaultTo(null)
export let defaultOffset = R.defaultTo(0)
export let defaultLimit = R.defaultTo(10)

export let desugarModelsQuery = R.pipe(
  R.when(q => q.length == 2, R.append(null)),
  R.over2([2], defaultFields),
  R.over2([2], R.sortBy(R.id)),
)

export let desugarIndexQuery = R.pipe(
  R.over2([1, "filters"], defaultFilters),
  R.over2([1, "sort"], defaultSort),
  R.over2([1, "offset"], defaultOffset),
  R.over2([1, "limit"], defaultLimit),
  R.when(q => q.length == 2, R.append(null)),
  R.over2([2], defaultFields),
  R.over2([2], R.sortBy(R.id)),
)

export let combineFields = (fs1, fs2) => {
  return !fs1.length || !fs2.length
    ? []
    : concatUniq(fs1, fs2)
}

export let combineModelsQueries = (q1, q2) => {
  q1 = desugarModelsQuery(q1)
  q2 = desugarModelsQuery(q2)

  let [tableName1, ids1, fs1] = q1
  let [tableName2, ids2, fs2] = q2

  let canCombine = tableName1 == tableName2
  if (!canCombine) {
    return null
  }

  let ids = R.sortBy(R.id, concatUniq(ids1, ids2))
  let fields = R.sortBy(R.id, combineFields(fs1, fs2))

  return [tableName1, ids, fields]
}

export let combineIndexQueries = (q1, q2) => {
  q1 = desugarIndexQuery(q1)
  q2 = desugarIndexQuery(q2)

  let [tableName1, cond1, fs1] = q1
  let [tableName2, cond2, fs2] = q2

  let canCombine = tableName1 == tableName2
                && R.equals(cond1.filters, cond2.filters)
                && cond1.sort == cond2.sort
                && areRangesClose([cond1.offset, cond1.offset + cond1.limit], [cond2.offset, cond2.offset + cond2.limit])

  if (!canCombine) {
    return null
  }

  let {filters, sort} = cond1
  let [offset, limit] = combineRanges([cond1.offset, cond1.limit], [cond2.offset, cond2.limit])
  let fields = R.sortBy(R.id, combineFields(fs1, fs2))

  return [tableName1, {filters, sort, offset, limit}, fields]
}

export let collapseModelsQueries = (qs) => {
  if (!qs.length)
    return []

  let [q, ..._qs] = R.map(desugarModelsQuery, qs)
  let result = [q]

  for (let q1 of _qs) {
    // Try to merge query with one of result queries
    for (var i = 0; i < result.length; i++) {
      let q2 = result[i]
      let qm = combineModelsQueries(q1, q2)
      if (qm) {
        result[i] = qm
        break
      }
    }
    if (i == result.length) {
      // No merge occured
      result.push(q1)
    }
  }

  return result
}

export let collapseIndexQueries = (qs) => {
  if (!qs.length)
    return []

  let [q, ..._qs] = R.map(desugarIndexQuery, qs)
  let result = [q]

  for (let q1 of _qs) {
    // Try to merge query with one of result queries
    for (var i = 0; i < result.length; i++) {
      let q2 = result[i]
      let qm = combineIndexQueries(q1, q2)
      if (qm) {
        result[i] = qm
        break
      }
    }
    if (i == result.length) {
      // No merge occured
      result.push(q1)
    }
  }

  return result
}

export let whatIsMissing = R.curry((query, state) => {
  return whatAreMissing([query], state)
})

export let whatAreMissing = R.curry((queries, state) => {
  /**
   * GraphQL-like queries:
   *   [['posts', ['2'], ['id']],
   *    ['posts', ['3'], ['id', 'title']]]
   *  can't be extracted in any DB (I'm aware of) in one query.
   *  So what you do on backend, is collapse that into:
   *    [['posts', ['2', '3'], ['id', 'title' ]]]
   *  which is exactly the query I return from here (after collapse part).
   *  As were said, GraphQL just pushes complexity onto backend.
   */

  // TODO can accept local state to use its cache against collapsedIndexQueries
  // TODO flatten model object or unflatten fields to support compound fields
  let rawModelsQueries = R.filter(isModelsQuery, queries)
  let rawIndexQueries = R.filter(isIndexQuery, queries)

  let collapsedModelsQueries = collapseModelsQueries(rawModelsQueries)
  let collapsedIndexQueries = collapseIndexQueries(rawIndexQueries)

  let missingModelsQueries = R.chain(modelsQuery => {
    let [tableName, ids, fields] = modelsQuery
    let table = state.tables[tableName] // {"1": {...}, "2": {...} ...}
    return R.filter(R.length, R.map(id => {
      let model = table[id]
      if (fields.length) {
        if (model) {
          let presentFields = R.keys(R.pick(fields, model))
          let missingFields = R.difference(fields, presentFields)
          if (missingFields.length) {
            return [tableName, [id], missingFields]
          } else {
            return []
          }
        } else {
          return [tableName, [id], fields]
        }
      } else {
        // TODO almost like the above, refactor
        if (model) {
          if (R.isEmpty(model)) {
            return [tableName, [id], fields]
          } else {
            return []
          }
        } else {
          return [tableName, [id], fields]
        }
      }
    }, ids))
  }, collapsedModelsQueries)

  let missingIndexQueries = collapsedIndexQueries // will expand here

  return R.concat(
    collapseModelsQueries(missingModelsQueries),
    collapseIndexQueries(missingIndexQueries),
  )
})

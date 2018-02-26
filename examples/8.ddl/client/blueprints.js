import * as R from "@paqmind/ramda"
import A from "axios"
import K from "kefir"
import * as D from "kefir.db"
import U from "urlz"

// Unsorted useful stuff ///////////////////////////////////////////////////////////////////////////
export let setDocument = R.curry((doc, state) => {
  return R.set2("document", {
    url: state.document.url,
    title: doc.seoTitle || doc.title || "",
    description: doc.seoDescription || "",
    ogType: "website",
  }, state)
})

export let safeInc = R.pipe(R.defaultTo(0), R.inc)
export let safeDec = R.pipe(R.defaultTo(0), R.dec)

// Navigation //////////////////////////////////////////////////////////////////////////////////////
export let root = (key) => {
  let urlLens = ["document", "url"]

  let makeIntents = (sources) => {
    return {
      navigateTo$: sources.DOM.from("a").listen("click")
        .filter(ee => {
          return !ee.element.dataset.ui // links with `data-ui` will be ignored
        })
        .flatMapConcat(ee => {
          let urlObj = U.parse(ee.element.href)

          if (urlObj.protocol && urlObj.host != document.location.host) {
            // External link
            return K.never()
          } else {
            // Internal link
            if (urlObj.pathname == document.location.pathname && urlObj.hash) {
              // Anchor link
              // do nothing, rely on default browser behavior
            } else {
              // Page link or Reset-Anchor link (foo#hash -> foo)
              ee.event.preventDefault() // take control on browser
              window.scrollTo(0, 0)     //
            }
            window.history.pushState({}, "", urlObj.relHref)
            return K.constant(urlObj.relHref)
          }
        }),

      navigateHistory$: D.isBrowser
        ? K.fromEvents(window, "popstate")
          .map(data => U.relHref(document.location.href)) // TODO scroll to hash (how?!)
        : K.never(),
    }
  }

  let makeActions = (intents) => {
    return [
      intents.navigateTo$.map(url => R.fn("navigateTo", R.set2(urlLens, url))),
      intents.navigateHistory$.map(url => R.fn("navigateHistory", R.set2(urlLens, url))),
    ]
  }

  return {
    makeIntents,
    makeActions,
  }
}

// Forms and stuff /////////////////////////////////////////////////////////////////////////////////

let capitalizeFirstChar = (s) => s[0].toUpperCase() + s.slice(1)

let makeFilteringIntents = (seed, sources) => {
  return {}
  // if (seed.filters) {
  //   return R.reduce((intents, key) => {
  //     let seedValue = seed.filters[key]
  //     let intentName = `changeFilter${capitalizeFirstChar(key)}$`
  //     let intent$ = do {
  //       if (R.is(String, seedValue)) {
  //         sources.DOM.fromName(`filters.${key}`)
  //           .listen("input")
  //           .map(ee => ee.element.value)
  //       }
  //       else if (R.is(Boolean, seedValue)) {
  //         sources.DOM.fromName(`filters.${key}`)
  //           .listen("click")
  //           .map(ee => ee.element.checked)
  //       }
  //       else {
  //         null
  //       }
  //     }
  //     return intent$
  //       ? R.set2(intentName, intent$, intents)
  //       : intents
  //   }, {}, R.keys(seed.filters))
  // } else {
  //   return {}
  // }
}

let makeFilteringActions = (seed, intents) => {
  return []
  // if (seed.filters) {
  //   return R.reduce((actions, key) => {
  //     let seedValue = seed.filters[key]
  //     let intentName = `changeFilter${capitalizeFirstChar(key)}$`
  //     if (intents[intentName]) {
  //       let action$ = intents[intentName].map(x => function setFilter(state) {
  //         return R.set2(["filters", key], x, state)
  //       })
  //       return R.append(action$, actions)
  //     } else {
  //       return actions
  //     }
  //   }, [], R.keys(seed.filters))
  // } else {
  //   return []
  // }
}

let makeSortingIntents = (seed, sources) => {
  if (seed.sort) {
    return {
      changeSort$: sources.DOM.fromName("sort").listen("click")
        .map(ee => ee.element.value)
    }
  } else {
    return {}
  }
}

let makeSortingActions = (seed, intents) => {
  if (seed.sort) {
    return [
      intents.changeSort$.map(x => function setSort(state) {
        return R.set2("sort", x, state)
      }),
    ]
  } else {
    return []
  }
}

// let makeIndexBlueprints = () => {
export let makeIndexIntents = (seed, sources) => R.pipe(
  R.mergeFlipped(makeFilteringIntents(seed, sources)),
  R.mergeFlipped(makeSortingIntents(seed, sources)),
)({})

export let makeIndexActions = (seed, intents) => R.pipe(
  R.concatFlipped(makeFilteringActions(seed, intents)),
  R.concatFlipped(makeSortingActions(seed, intents)),
)([])

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

export let desugarModelsQuery = (query) => {
  return R.pipe(
    R.when(q => q.length == 2, R.append(null)),
    R.over2([2], defaultFields),
    R.over2([2], R.sortBy(R.id)),
  )(query)
}

export let desugarIndexQuery = (query) => {
  return R.pipe(
    R.over2([1, "filters"], defaultFilters),
    R.over2([1, "sort"], defaultSort),
    R.over2([1, "offset"], defaultOffset),
    R.over2([1, "limit"], defaultLimit),
  )(query)
}

export let combineModelsQueries = (q1, q2) => {
  let [tableName1, ids1, fs1] = q1
  let [tableName2, ids2, fs2] = q2

  let canCombine = tableName1 == tableName2
  if (!canCombine) {
    return null
  }

  let ids = R.sortBy(R.id, concatUniq(ids1, ids2))
  let fields = R.sortBy(R.id, concatUniq(fs1, fs2))

  return [tableName1, ids, fields]
}

export let combineIndexQueries = (q1, q2) => {
  let [tableName1, cond1] = q1
  let [tableName2, cond2] = q2

  let canCombine = tableName1 == tableName2
                && R.equals(cond1.filters, cond2.filters)
                && cond1.sort == cond2.sort
                && areRangesClose([cond1.offset, cond1.offset + cond1.limit], [cond2.offset, cond2.offset + cond2.limit])

  if (!canCombine) {
    return null
  }

  let {filters, sort} = cond1
  let [offset, limit] = combineRanges([cond1.offset, cond1.limit], [cond2.offset, cond2.limit])

  return [tableName1, {filters, sort, offset, limit}]
}

export let collapseModelsQueries = (qs) => {
  if (!qs.length)
    return []

  let [q, ..._qs] = qs
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

  let [q, ..._qs] = qs
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

export let whatIsMissingByMQ = R.curry((state, query) => {
  let [tableName, ids, fields] = query
  let table = state.tables[tableName]
  let missingStuff = R.reduce((z, id) => {
    let model = table[id]
    let missingFields = model
      ? findMissingFields(model, fields)
      : fields
    if (!R.isEmpty(missingFields))
      z[id] = missingFields
    return z
  }, {}, ids)
  let ids2 = R.keys(missingStuff)
  let fields2 = R.reduce(concatUniq, [], R.values(missingStuff))
  return R.isEmpty(missingStuff)
    ? []
    : [tableName, ids2, fields2]
})

export let whatIsMissingByIQ = R.curry((state, query) => {
  let [tableName, cond] = query
  let indexKey = hashIndexQuery(query)
  let index = state.indexes[indexKey] || {table: {}, total: 0}
  let missingRange = findMissingRange(index.table, cond)
  let cond2 = R.merge(cond, missingRange)
  return R.isEmpty(missingRange)
    ? []
    : [tableName, cond2]
})

let findMissingFields = (model, fields) => {
  // TODO flatten model object or unflatten fields to support compound fields
  let presentFields = R.keys(R.pick(fields, model))
  return R.difference(fields, presentFields)
}

let findMissingRange = (table, {offset, limit}) => {
  let queryOffsets = R.range(offset, offset + limit)
  let presentOffsets = R.map(Number, R.keys(table))
  let missingOffsets = R.difference(queryOffsets, presentOffsets)
  return missingOffsets.length
    ? {offset: missingOffsets[0], limit: R.nth(-1, missingOffsets) - missingOffsets[0] + 1}
    : {}
}

/**
 * GraphQL-like queries:
 *   [['posts', ['2'], ['id']],
 *    ['posts', ['3'], ['id', 'title']]]
 *  can't be extracted in any DB (I'm aware of) in one query.
 *  So what you do on backend, is collapse that into:
 *    [['posts', ['2', '3'], ['id', 'title' ]]]
 *  which is exactly the query I return from here (after collapse part).
 *  As were said, GraphQL pushes a lot of complexity into backend.
 */

export let hashIndexQuery = (query) => {
  query = desugarIndexQuery(query)
  let [tableName, {filters, sort}] = query
  return tableName + "." + JSON.stringify(filters) + "." + JSON.stringify(sort) // TODO json-stable-stringify
}

export let makeGlobalIndex = R.curry((offset, {ids, total}) => {
  return {
    table: R.fromPairs(R.map2((x, i) => [offset + i, x], ids)),
    total: total,
  }
})

export let makePagination = R.curry((offset, limit, {table, total}) => {
  return {
    ids: tableToIds(table, R.range(offset, offset + limit)),
    total,
    offset,
    limit,
  }
})

export let makeLazyLoad = R.curry((offset, limit, {table, total}) => {
  return {
    ids: tableToIds(table, R.range(0, offset + limit)),
    total,
    offset,
    limit,
  }
})

export let tableToIds = (table, range) => {
  return R.chain(o => table[o] ? [table[o]] : [], range)
}

///
export let deriveModelsObj = (table$, ids$, validateFn) => {
  return D.deriveArr(
    [table$, ids$],
    (table, ids) => {
      return R.reduce((z, id) => {
        let model = table[id]
        let errors = validateFn(model)
        if (!errors.length) {
          z[id] = model
        }
        return z
      }, {}, ids)
    }
  )
}

export let deriveModelsArr = (table$, ids$, validateFn) => {
  return D.deriveArr(
    [table$, ids$],
    (table, ids) => {
      return R.reduce((z, id) => {
        let model = table[id]
        let errors = validateFn(model)
        if (!errors.length) {
          z.push(model)
        }
        return z
      }, [], ids)
    }
  )
}

export let deriveModel = (table$, id$, validateFn) => {
  return D.deriveArr(
    [table$, id$],
    (table, id) => {
      let model = table[id]
      let errors = validateFn(model)
      return errors.length ? null : model
    }
  )
}

// TODO refactor
export let deriveLazyLoad = (indexes$, localIndex$, indexQueryFn) => {
  return D.deriveArr([indexes$, localIndex$], (indexes, {offset, limit}) => {
    let query = indexQueryFn({offset, limit})
    let indexKey = hashIndexQuery(query)
    let index = indexes[indexKey] || {table: {}, total: 0}
    return makeLazyLoad(offset, limit, index)
  })
}

// TODO more validation examples: propTypes, tcomb, etc.
export let validate = R.curry((Type, model) => {
  if (!model) {
    return ["*"]
  }
  let validators = R.toPairs(Type)
  let errors = R.chain(([field, validator]) => {
    return validator(model[field])
      ? []
      : [field]
  }, validators)
  return errors
})

import test from "ava"
import {
  isBetween, combineRanges,
  areRangesOverlapping, areRangesClose,
  concatUniq,
  defaultIds, defaultFilters, defaultSort, defaultOffset, defaultLimit, defaultFields,
  isModelsQuery, isIndexQuery,
  desugarModelsQuery, desugarIndexQuery,
  combineFields,
  combineModelsQueries, combineIndexQueries,
  collapseModelsQueries, collapseIndexQueries,
  whatsMissing,
} from "../../client/ddl"

let _ids = defaultIds(null)
let _fields = defaultFields(null)
let _filters = defaultFilters(null)
let _sort = defaultSort(null)
let _offset = defaultOffset(null)
let _limit = defaultLimit(null)

test("isBetween", (t) => {
  t.deepEqual(isBetween(0, [1, 2]), false)
  t.deepEqual(isBetween(1, [1, 2]), true)
  t.deepEqual(isBetween(2, [1, 2]), true)
  t.deepEqual(isBetween(3, [1, 2]), false)
})

test("concatUniq", (t) => {
  t.deepEqual(concatUniq(["id"], ["id", "name"]), ["id", "name"])
  t.deepEqual(concatUniq(["id", "name"], ["id"]), ["id", "name"])
  t.deepEqual(concatUniq([], ["id"]), ["id"])
  t.deepEqual(concatUniq(["id"], []), ["id"])
})

test("combineRanges", (t) => {
  t.deepEqual(combineRanges([1, 100], [0,  10]), [0, 101])
  t.deepEqual(combineRanges([0,  10], [1, 100]), [0, 101])
  t.deepEqual(combineRanges([5,  20], [1, 100]), [1, 100])
  t.deepEqual(combineRanges([1, 100], [5,  20]), [1, 100])
})

test("areRangesOverlapping", (t) => {
  t.deepEqual(areRangesOverlapping([0, 10], [11, 20]), false) // no overlap
  t.deepEqual(areRangesOverlapping([11, 20], [0, 10]), false) // no overlap

  t.deepEqual(areRangesOverlapping([0, 10], [9, 11]), true) // start is between
  t.deepEqual(areRangesOverlapping([9, 11], [0, 10]), true) // start is between

  t.deepEqual(areRangesOverlapping([5, 10], [4, 6]), true) // end is between
  t.deepEqual(areRangesOverlapping([4, 6], [5, 10]), true) // end is between

  t.deepEqual(areRangesOverlapping([0, 10], [5, 6]), true) // both ends are between
  t.deepEqual(areRangesOverlapping([5, 6], [0, 10]), true) // both ends are between
})

test("areRangesClose", (t) => {
  t.deepEqual(areRangesClose([0, 10], [0, 2]), true)     // left aligned
  t.deepEqual(areRangesClose([0, 2], [0, 10]), true)     // left aligned
  t.deepEqual(areRangesClose([0, 10], [2, 5]), true)     // one inside another
  t.deepEqual(areRangesClose([2, 5], [0, 10]), true)     // one inside another
  t.deepEqual(areRangesClose([0, 5], [10, 15]), true)    // without intersection, close
  t.deepEqual(areRangesClose([10, 15], [0, 5]), true)    // without intersection, close
  t.deepEqual(areRangesClose([0, 5], [11, 15]), false)   // without intersection, far
  t.deepEqual(areRangesClose([11, 15], [0, 5]), false)   // without intersection, far
  t.deepEqual(areRangesClose([0, 10], [95, 100]), false) // without intersection, far
  t.deepEqual(areRangesClose([95, 100], [0, 10]), false) // without intersection, far
})

test("isModelsQuery", (t) => {
  t.is(isModelsQuery(["users", []]), true)
  t.is(isModelsQuery(["users", [], []]), true)
  t.is(isModelsQuery(["users", {}]), false)
  t.is(isModelsQuery(["users", {}, []]), false)
})

test("isIndexQuery", (t) => {
  t.is(isIndexQuery(["users", []]), false)
  t.is(isIndexQuery(["users", [], []]), false)
  t.is(isIndexQuery(["users", {}]), true)
  t.is(isIndexQuery(["users", {}, []]), true)
})

test("desugarModelsQuery", (t) => {
  t.deepEqual(
    desugarModelsQuery(["users", []]),
    ["users", [], _fields]
  )

  t.deepEqual(
    desugarModelsQuery(["users", [], []]),
    ["users", [], []]
  )

  t.deepEqual(
    desugarModelsQuery(["users", ["1"], []]),
    ["users", ["1"], []]
  )

  t.deepEqual(
    desugarModelsQuery(["users", [], ["email"]]),
    ["users", [], ["email"]]
  )

  t.deepEqual(
    desugarModelsQuery(["users", ["1"], ["email"]]),
    ["users", ["1"], ["email"]]
  )
})

test("desugarIndexQuery", (t) => {
  t.deepEqual(
    desugarIndexQuery(["users", {}]),
    ["users", {filters: _filters, sort: _sort, offset: _offset, limit: _limit}, _fields]
  )

  t.deepEqual(
    desugarIndexQuery(["users", {filters: "x"}]),
    ["users", {filters: "x", sort: _sort, offset: _offset, limit: _limit}, _fields]
  )

  t.deepEqual(
    desugarIndexQuery(["users", {filters: "x", sort: "x"}]),
    ["users", {filters: "x", sort: "x", offset: _offset, limit: _limit}, _fields]
  )

  t.deepEqual(
    desugarIndexQuery(["users", {filters: "x", sort: "x", offset: "x"}]),
    ["users", {filters: "x", sort: "x", offset: "x", limit: _limit}, _fields]
  )

  t.deepEqual(
    desugarIndexQuery(["users", {filters: "x", sort: "x", offset: "x", limit: "x"}, _fields]),
    ["users", {filters: "x", sort: "x", offset: "x", limit: "x"}, _fields]
  )
})

test("combineFields", (t) => {
  t.deepEqual(combineFields([], ["x"]), [])
  t.deepEqual(combineFields(["x"], []), [])
  t.deepEqual(combineFields(["x"], ["x"]), ["x"])
  t.deepEqual(combineFields(["x"], ["y"]), ["x", "y"])
})

test("combineModelsQueries", (t) => {
  t.deepEqual(
    combineModelsQueries(["x", ["y1"], ["z1"]], ["x", ["y2"], ["z2"]]),
    ["x", ["y1", "y2"], ["z1", "z2"]]
  )

  t.deepEqual(
    combineModelsQueries(["x1", ["y1"], ["z1"]], ["x2", ["y2"], ["z2"]]),
    null
  )
})

test("combineIndexQueries", (t) => {
  t.deepEqual(
    combineIndexQueries(["x", {}], ["x", {}]),
    desugarIndexQuery(["x", {}])
  )

  t.deepEqual(
    combineIndexQueries(["x1", {limit: 5}, []], ["x1", {limit: 10}]),
    desugarIndexQuery(["x1", {limit: 10}])
  )

  t.deepEqual(
    combineIndexQueries(["x1", {offset: 0, limit: 5}, []], ["x1", {offset: 5, limit: 10}]),
    desugarIndexQuery(["x1", {offset: 0, limit: 15}])
  )

  t.deepEqual(
    combineIndexQueries(["x", {}, ["z1"]], ["x", {}, ["z2"]]),
    desugarIndexQuery(["x", {}, ["z1", "z2"]])
  )

  t.deepEqual(
    combineIndexQueries(["x1", {}], ["x2", {}]),
    null
  )

  t.deepEqual(
    combineIndexQueries(["x1", {filters: "foo"}], ["x1", {}]),
    null
  )

  t.deepEqual(
    combineIndexQueries(["x1", {sort: "foo"}], ["x1", {}]),
    null
  )
})

test("collapseModelsQueries", (t) => {
  t.deepEqual(
    collapseModelsQueries([]),
    []
  )

  t.deepEqual(
    collapseModelsQueries([
      ["posts", ["2", "1"]],
      ["posts", ["1", "3"]],
      ["users", ["1", "2"]],
      ["users", ["2", "3"]],
    ]),
    [
      desugarModelsQuery(["posts", ["1", "2", "3"]]),
      desugarModelsQuery(["users", ["1", "2", "3"]]),
    ]
  )

  t.deepEqual(
    collapseModelsQueries([
      ["posts", ["1"], ["id"]],
      ["posts", ["2"], []],
      ["users", ["1", "2"], ["email"]],
      ["users", ["2", "3"], ["name"]],
    ]),
    [
      ["posts", ["1", "2"], []],
      ["users", ["1", "2", "3"], ["email", "name"]],
    ]
  )
})

test("collapseIndexQueries", (t) => {
  t.deepEqual(
    collapseIndexQueries([]),
    []
  )

  t.deepEqual(
    collapseIndexQueries([
      ["posts", {}, ["id"]],
      ["posts", {}, []],
      ["users", {}, ["id"]],
      ["users", {}, ["email"]],
    ]),
    [
      desugarIndexQuery(["posts", {}]),
      desugarIndexQuery(["users", {}, ["id", "email"]]),
    ]
  )

  t.deepEqual(
    collapseIndexQueries([
      ["posts", {offset:  0, limit: 5}],
      ["posts", {offset: 90, limit: 10}],
      ["users", {offset:  0, limit: 10}],
      ["users", {offset: 10, limit: 10}],
    ]),
    [
      desugarIndexQuery(["posts", {offset: 0, limit: 5}]),
      desugarIndexQuery(["posts", {offset: 90, limit: 10}]),
      desugarIndexQuery(["users", {offset: 0, limit: 20}]),
    ]
  )

  t.deepEqual(
    collapseIndexQueries([
      ["posts", {filters: "foo"}],
      ["posts", {filters: "bar"}],
      ["users", {filters: "foo", sort: "bar"}],
      ["users", {filters: "foo", sort: "bar"}],
    ]),
    [
      desugarIndexQuery(["posts", {filters: "foo"}]),
      desugarIndexQuery(["posts", {filters: "bar"}]),
      desugarIndexQuery(["users", {filters: "foo", sort: "bar"}]),
    ]
  )

  t.deepEqual(
    collapseIndexQueries([
      ["articles", {}],
      ["users", {}],
      ["articles", {}],
      ["posts", {}],
      ["articles", {filters: "foo"}],
      ["posts", {}],
    ]),
    [
      desugarIndexQuery(["articles", {}]),
      desugarIndexQuery(["users", {}]),
      desugarIndexQuery(["posts", {}]),
      desugarIndexQuery(["articles", {filters: "foo"}]),
    ]
  )
})

test.only("whatsMissing", (t) => {
  t.deepEqual(whatsMissing(
    [
      ["posts", ["1", "2"], ["id", "title"]],
      ["posts", ["1", "3"], ["title", "id"]],
      ["users", {}]
    ],
    {
      posts: {
        "1": {id: "1", title: "First Post"},
        "2": {title: "Second Post"},
      },
      users: {},
    },
  ), [
    desugarModelsQuery(["posts", ["2", "3"], ["id", "title"]]),
    desugarIndexQuery(["users", {}])
  ])

  t.deepEqual(whatsMissing(
    [
      ["posts", ["1"], ["foo"]],
      ["users", {offset: 0}],
      ["users", {offset: 5}],
      ["users", {offset: 10}],
    ],
    {
      posts: {
        "1": {id: "1", title: "First Post"},
        "2": {title: "Second Post"},
      },
      users: {
        "1": {},
        "2": {},
      }
    },
  ), [
    desugarModelsQuery(["posts", ["1"], ["foo"]]),
    desugarIndexQuery(["users", {limit: 20}])
  ])
})

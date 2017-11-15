import * as R from "ramda"
import K from "kefir"

let action$ = K.sequentially(200, [R.inc, R.identity, R.identity, R.identity, R.identity])

let seed = 0
let state = action$
  .merge(K.constant(seed))
  .scan((state, fn) => fn(state))
  .skipDuplicates() // uses === by default

state.log()

/*
  Now you're probably thinking "`===` is only a shallow comparison"! – and you're only half correct.
  The power of immutable functions makes it work almost like it's a deep comparison! How?

  `{} == {}` is obviously false in JS (different *memory* id)
  but `x == x` is true no matter what x is.

  Consider that state is compared either with itself (x == x case) or with a new state (x == x1 case).
  x1 will have a different id because immutable changes (unlike mutable ones) always create a new
  "container" object. For example:

  `R.id(x)`        – keeps x (no state changes)
  `R.merge(x, x1)` – changes x (effect of Object.assign({}, x, x1))

  So while `===` op will give a few *false positives* in the cases like `R.merge({}, x)` or `(_) => seed`
  they are rarely used in practice (and can be avoided). In the worst case you'll have an occasional
  extra render here and there at the cost of A HUGE raw performance boost. So `R.identical` is a
  much better choice than `R.equals` which will apply recursive traversals for each update.

  Now you see how the smart usage of Ramda makes ImmutableJS unnecessary (and even a bad choice
  given the wasted memory/performance). JS has a memory sharing built-in which it trivial to protect
  by convention. Our architecture is built upon that reasoning. Smart things are sometimes simple ;)
*/

// Next: refactoring

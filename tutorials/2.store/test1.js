import * as R from "ramda"
import K from "kefir"

// Lib =============================================================================================
// We name all functions to keep discoverability via `console.log`
function makeStore(options) {
  return function Store(seed, action$) {
    options = R.merge(makeStore.options, options)

    let self = {options} // no OOP

    self.$ = action$
      .merge(K.constant(seed))
      .scan((state, fn) => fn(state))
      .skipDuplicates()

    return self
  }
}

// Discoverability (and debuggability) are even more important than testability!
// Why noone teaches them?!
makeStore.options = {
  cmpFn: R.identical,
}

// App =============================================================================================
let makeAction$ = () => K.sequentially(200, [R.inc, R.inc, R.inc, R.inc, R.inc])

let state1 = makeStore({})(1, makeAction$())

state1.$.observe(s => {
  console.log("state1:", s)
})

setTimeout(() => {
  let state10 = makeStore({})(10, makeAction$())

  state10.$.observe(s => {
    console.log("state10:", s)
  })
}, 1200)

/*
 Why no OOP. Why self instead of this?

 Native {options, $} is perfect store
 You can R.merge(store, whatever) without any problem.
 You don't loose the instance type doing that like you would
 with prototypes.

 The ONLY "problem" is that you can't return self (it will be a different
 self for "extending" entities). Is that a problem at all? Not at all.

 When you return self in fluent-api style it means you don't return new data
 but make side effects instead. Side effects are evil and the less of them
 the easier your life will be (easier tests, less bugs, etc, etc.)

 I would go as far as considering `return this` an antipattern because
 it's so easy to abuse. There may be functions with the only purpose of
 doing side effects.

 But you don't want to mask them as .foo().bar().baz(). Quite the opposite
 you'll want them to be as *loud* as possible:

 thing.foo()
 thing.bar()
 thing.baz()

 Now every reader will note those calls cause effects. It's good.
 And you don't use their return values to you don't have to return neither this or self...

 Fluent API is an anti-pattern:
 * if methods return self – they mask side-effects
 * if methods return new data – you'd better make them basic composable functions

 let thing2 = R.pipe(
   transformFoo,
   transformBar,
   transformBaz,
 )(thing)

 Further you'll see how we make a cool ultra-composable object hierarchy without a
 bit of OOP. Well you could say it's a real OOP because it's all about objects...
 But we never use a prototype chain and `this` – it's always better without them!

 Keep reading: http://paqmind.com/blog/fluent-api-debunked/
*/

// Next: refactoring

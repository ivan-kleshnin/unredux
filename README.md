# Unredux

**WIP**

I strongly prefer **libraries** over **frameworks**. In this repo I experiment with different React
examples implemented:

1. Without frameworks
2. Without an expected boilerplate

We will write our own set of helpers from scratch step by step. So I encourage you to
elaborate examples sequentially.

## Motivation

### Yes: Reactivity

The first motivation is **reactivity**. The best part about React is its reactive rendering.
Unfortunately they stop there. And they even say "React ecosystem is intentionally non-reactive".

I don't want to guess the reasoning but I believe they're wrong. I'm pretty convinced that
reactivity is the best solution for interactive systems (like UI or web-server!).

We will use Ramda to get cleaner functional code, impossible to achieve with messy native methods of JavaScript.
We will use RxJS to expand the reactive dataflow from view to state and action layers.
We will use [functional reducers](https://github.com/ivan-kleshnin/reactive-states) where you dispatch
functions instead of actions (start with actions, wrap them in *factories*, wrap those in *thunks*,
call it a day).

The main (and only) benefit of Action reducers is that it's easier to track actions when they have
both names and params attached. *Impressive* devtool toys, like **time-machine** popularized by Elm,
are really a bit easier to make with Action-based architecture. Everything else is more complex and,
to my experience, functional reducers need significantly less boilerplate when you stick to functional
paradigm.

### No: Redux

The third reason to make this repo is **Redux**.

Redux ecosystem is becoming incredibly complex. Bloated and overcomplicated to the level of Angular 1.0.
Many people are switching to Vue.js just because they are tired of adding new and new items to the
endless list of: React + Redux + Redux patterns + Redux Actions + Redux Thunks + Redux Sagas + ...
where each comes with a tiny benefit and nobody ever talks of drawbacks. Redux fatigue is real!

Learning this library, I always had a sense they tend to choose the simplest tactical solution
(along with a pathetic name) sacrificing the strategic goal of simplicity. The end result is a disaster,
and the reason some people are starting to unbury MVC.

When you need [tons of code](https://github.com/reactjs/redux/tree/master/examples/todomvc/src)
to make a simple TODO app – you're doing something wrong. The point of this repo is to reimplement
the official Redux-Examples without Redux and to demonstrate it's actually easier to code React without it.

I recommend to take a look at these [enlightening articles](https://github.com/calmm-js/documentation).
They end with the conclusion that Calmm and Redux approaches are directly opposite. Which is true but
leaves a false feeling of both being equally legit. And they kinda are in theory, but not in practice.

Functional reducers go together with Lenses – deep but relatively well-developed topic. Action reducers
require Transducers – the more obscure and ill-developed concept. But the real problem is that Redux
team decided to not even mention transducers and promote their own ad-hoc solutions a-la `composeReducers`.
Intution instead of math.

The **real** problem is state handling (as [it was](https://github.com/Yomguithereal/baobab/issues/240) 2+ years ago).
As far as I can tell, no tool is even approaching the solution stage a.t.m. Both GraphQL or Falcor are far
from it. Redux state handling is a joke.

One example of a broken approach:

```js
render() {
  let filteredSomething = memoize(..., filter(something))
  // user filteredSomething
}
```

1. It leaves no way to subscribe to `filteredSomething`
2. It mixes data from different pagination views

Example of #2:

**Case-1:**

```
1. User enters main article index page, walking to page 5
2. User enters promo article index page (perpage=10)
    If there were 10+ articles on those index pages,
    user sees promo articles BUT NOT THE SAME that admin sees
    with the same index settings (filtering + ordering)
3. It may often be a business problem
```

**Case-2:**

```
1. User enters PROMO articles index
2. User enters main articles index
3. User sees only PROMO articles on the main index
4. It may often be a business problem
```

If client-side filtering is applied to a partially loaded data, pagination won't work as **append-only**.
Pagination fetches will inject items in-between already seen ones leading to a cripppled user experience.
We know that Facebook does not care about the order of items in their feeds. Hovewer I do care about
the order of items in projects I develop.

Client-side filtering can be safely applied to data only if all items are fetched (or the order does not matter).
I realized that fact two years ago and implemented some solutions at [React-Ultimate](https://github.com/Paqmind/react-ultimate)...
Guess how much GraphQL or Falcor consider that in 2017...

All that need a separated article. For now – just a random notes FYI.

## Examples

#### 1. [Counter Vanilla](./1.counter-vanilla)

* Demo1: the basic architecture.
* Demo2: + channel extraction (`chan`).

#### 2. [Counter](./2.counter)

* Demo1: + React.
* Demo2: + connection extraction (`connect`).

#### 3. [Todos](./3.todos)

* Demo1: that classic TODO example.
* Demo2: + store extraction (`store`).

#### 4. [Todos Advanced](./4.todos-advanced)

* Demo1: + history management
* Demo2: + local storage

#### 5. [Async actions](./5.async-actions)

* Demo1: async actions.
* Demo2: **wip**

**Wip**

#### [Concepts](./CONCEPTS.md)

#### [Ideas](./IDEAS.md)

**Wip**

Most examples consists of two parts. In first parts we solve problems, gradually introducing new
concepts. In second parts we refactor our solutions: extract them into separate files, make them
cleaner and more stable.

## Prerequisites

* Basics of Functional Programming
* Basics of Lensing
* React (100% of official docs level)
* Basics of RxJS

## Conventions

All code snippets (in README.md files) imply the following imports:

```js
import R from "ramda"
// CJS: let R = require("ramda")
import {Observable as O, Subject} from "rxjs"
// CJS: let {Observable: O, Subject} = require("rxjs")
```

which are omitted for brevity. We'll also use ASCII [marble diagrams](http://rxmarbles.com/):

```
observable: ---v1---v2---> (time)
```

where `v1` may denote a string `"v1"` or something else, which should be clear from a context.

I don't use Andre Staltz' convention of marking observables with `$` for the reasons described [here](https://github.com/ivan-kleshnin/cyclejs-examples#no-trailing-).
Sometimes I mark a standalone observable with `$` which is kinda like an `xs` array. The data
architecture in this project is almost 100% namespace based (namespaces rock!) so I don't see a reason
to duplicate that with suffixes:

```js
let observableActions = {
  doThis: ...
  doThat: ...
}

// vs

let observableActions = {
  doThis$: ...  // ugly
  doThat$: ...  // !
}
```

## Q-A

I have a goal to avoid frameworks in this project and I will stick to it. But, as people keep asking
about them, here is a short Q-A list.

### Why not AngularJS?

Front-end templaters should have been banned long time ago.

### Why not VueJS?

RIP MVC, not interested. It's just a backlash against Redux.

### Why not CycleJS?

CycleJS is great. It's probably the best frontend framework at the moment, and many my solutions are
both inspired by and compatible with CycleJS.

Saying that, CycleJS definitely has it's own problems. At first, the framework is idealistic which
is both good and bad. The most prominent example of that is side-effect handling.
To keep the architectural benefits, you need to wrap every library with side-effects exclusively for
CycleJS. And sometimes it's basically impossible without a full rewrite. So CycleJS ecosystem is
probably the most isolated JS ecosystem our there.

The go-to JS approach to side-effect testing is mocking. Fortunately there aren't so many
types of side effects... CycleJS approach is entirely different and it doesn't come for free.

The second problem with CycleJS approach is a cohesion gap between an effect initiator and an effect
consumer. Which is explained in details [here](http://www.christianalfoni.com/articles/2016_09_11_The-case-for-function-tree).
Basically, to track the linear data flow, you need to switch between reading sinks and sources constantly.
To achieve 100% reactivity, most complex CycleJS apps will end with multiple cycles (either in app
or library code), and sometimes the debug process is a real PITA.

The previous point leads to a separate problem. When everything have to be expressed with observables
the ["scoping hell"](http://paqmind.com/blog/async-patterns-and-scoping/) emerges. This is also
explained in details by the link so I refrain from repeating myself.

It's also about the ecosystem. I thought the creation of XStream was a mistake back then, and now I'm
even more convinced. They seriously propose to use RxJS for the cases XStream can't manage – like bundle
size is not an issue anymore @_@. Or learning two similar libraries is not a time waste. Then the
DOM rendering... React 16 is way more performant and convenient (because of `return [<Component/>...]`
option) than its alternatives, including their "default" Snabbdom. The latter, for example, still
doesn't have a Component abstraction which means the whole VDOM tree reconcilation is the only option
available...

Cycle community would argue that *everything is optional* but I don't buy this. You can use React
but you can't use ReactRouter, Helmet and other popular solutions that don't fit into CycleJS architecture.
It's all about the volume of examples and accumulated knowledge. Popular tools have books, videos,
etc. dedicated to them. Being marginal is sometimes necessary but it's always hard.

Finally, I'd like to avoid TypeScript (hint: it's a mess). TypeScript makes JavaScript the next Java,
which is a tragedy. I will probably switch to PureScript instead as I see all the smartest people
grouping there :) The bottom line is that CycleJS community is very fragmented because of their
["diverse"](https://github.com/cyclejs/cyclejs/issues/196) decisions and it feels so. From their
initial principle of "same tools -> multiple architectures" they switched to "same architecture -> multiple tools"
which I don't consider beneficial.

Nevermind, I like CycleJS, I use it in some of my projects and I highly recommend it to everyone tired of Redux.

### Why not CalmmJS?

CalmmJS is also very good. Conceptually, it's quite similar to what I'm trying to implement here, except
in CalmmJS does not have reactive actions – just a reactive state.

What I don't like about CalmmJS is magic. They use a lot of magic, like auto-injections of observables
into React components, or multiple high-level ad hoc reactive operators which seem foreign in Hello-World
examples.

Reading the code I can't help the feeling a lot of things are prematurely optimized and the end
architecture would look very different without that. But may be it's just me. Vesa Karvonen is a TOP
level engineer and I wouldn't like to underrate his works. They are well written, well documented and
have a lot of insights. Highly recommended as well.

---

#### The outline

* Native React: reactive views
* React + Redux / React + Baobab / React + CalmmJS: reactive models + reactive views
* CycleJS / "Unredux": reactive actions + reactive models + reactive views

## Random remarks

### Signal-to-noise ratio

I don't use linters. Having this:

```
"eslint": "^4.0.0",
"eslint-config-react-app": "^1.0.4",
"eslint-plugin-flowtype": "^2.29.2",
"eslint-plugin-import": "^2.2.0",
"eslint-plugin-jsx-a11y": "^5.0.3",
"eslint-plugin-react": "^7.1.0",
...
```

just to get "wrong indendation" events occasionally, is not what I live for. It's all about
**signal-to-noise** ratio, so I consider linters almost worthless (Flow is a better linter btw.).
For the same reason I don't use `const`, `===` and other "best practices" 2x year olds so like to
copy from their corporate gurus.

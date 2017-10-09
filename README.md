# Unredux

**WIP**

I strongly prefer **libraries over frameworks**. In this repo I experiment with different React
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
It will inject items in-between already loaded ones. We know that Facebook does not care about the order
of items in their feeds. Hovewer I do care about the order of items in projects I develop.

Client-side filtering can be safely applied to data only if all items are fetched (or the order does not matter).
I realized that fact two years ago and implemented some solutions at [React-Ultimate](https://github.com/Paqmind/react-ultimate)...
Guess how much GraphQL or Falcor consider that in 2017...

All that need a separated article. For now – just a random notes FYI.

## Examples

1. [Counter Vanilla](./1.counter-vanilla) (RxJS)
2. [Counter](./2.counter) (React + RxJS)
3. [Todos](./3.todos) (React + RxJS)
4. [Todos History](./4.todos-history) (React + RxJS)
5. [Todos "MVC"](./5.todos-mvc) (React + RxJS)
9. [Async actions](./9.async-actions) (React + RxJS)

List in progress...

### Prerequisites

* Basics of Functional Programming
* Basics of Lensing
* React (100% of official docs level)
* Basics of RxJS

### Guide

Most examples consists of two parts. In first parts we solve problems, gradually introducing new
concepts. In second parts we refactor our solutions: extract them into separate files, make them
cleaner and more stable.

## Q-A

### Why not AngularJS?

Are you kidding me?

### Why not VueJS?

RIP MVC. It's just a backlash against Redux.

### Why not CycleJS?

To prove the point. CycleJS is great but I have a goal to avoid frameworks in this repo.

### Why not CalmmJS?

Conceptually it's very similar to what I do here. I don't like magic injections of observables into
React components. Nevermind – check the previous point.

### Random remarks

#### I don't use linters

Adding this:

```
"eslint": "^4.0.0",
"eslint-config-react-app": "^1.0.4",
"eslint-plugin-flowtype": "^2.29.2",
"eslint-plugin-import": "^2.2.0",
"eslint-plugin-jsx-a11y": "^5.0.3",
"eslint-plugin-react": "^7.1.0",
...
```

just to notify me about "wrong indendation" is not what I live for. It's all about **signal-to-noise**
ratio so I consider linters almost worthless (Flow is better as a linter btw.). For the same reason
I don't use `const`, `===` and other "useful" things.

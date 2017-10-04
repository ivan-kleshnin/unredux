# Unredux

**WIP**

I strongly prefer **libraries over frameworks**. In this repo I experiment with different React
examples implemented:

1. Without frameworks
2. Without an expected boilerplate

We will write our own set of helpers from scratch bit by bit. So here it's strongly recommended to
elaborate examples sequentially.

## Motivation

### +Reactivity

The first motivation is **reactivity**. The best part about React is its reactive rendering.
Unfortunately they stop there. And they say "React ecosystem is intentionally non-reactive".

I don't want to guess their reasonings but I believe they're wrong. To my experience, r
reactivity is the best solution for interactive systems (like UI!).

We will use Ramda to get cleaner functional code, impossible to achieve with messy native methods of JavaScript.

We will use RxJS to expand the reactive dataflow from view to state and action layers.

We will use [functional reducers](https://github.com/ivan-kleshnin/reactive-states) where you dispatch
functions instead of actions (start with actions, wrap them in *creators*, wrap them in *thunks*,
call it a day). The main (and only) benefit of Action reducers is an easier action tracking.

"Impressive" devtool toys like time-machine popularized by Elm are really a bit easier to make
with Action-based architecture. Everything else is more complex and, to my experience, Functional
reducers require significanl less boilerplate when you stick to Functional paradigm.

### -Redux

The third reason to make this repo is **Redux**.

Redux ecosystem is becoming incredibly complex. Bloated and overcomplicated to the level of Angular 1.0.
Many people are switching to Vue.js just because they are tired of adding new and new items to the
endless list of: React + Redux + Redux patterns + Redux Actions + Redux Thunks + Redux Sagas + ...
where each comes with a single tiny benefit and nobody ever talks of drawbacks. Redux fatigue is real.

Learning this library, I always had a sense they tend to choose the simplest tactical solution
(along with pathetic names) sacrificing the strategic goal of simplicity. The end result is a disaster
(at least to my taste).

When you need [tons of code](https://github.com/reactjs/redux/tree/master/examples/todomvc/src)
to make a simple TODO app – you're doing something wrong. The point of this repo is to reimplement
the official Redux-Examples without Redux and to demonstrate it's actually easier to code React without it.

I recommend to take a look at these [enlightening articles](https://github.com/calmm-js/documentation).
They end with the conclusion that Calmm and Redux approaches are directly opposite. Which is true but
leaves a false feeling of both being equally legit. In theory they kinda are, but not in practice.

Functional reducers go together with Lenses – deep but relatively well-developed topic. Action reducers
require Transducers – the more obscure and ill-developed concept. But the point is that Redux author(s)
don't ever mention transducers, choosing to rely on their own intuition (instead of math) and
to promote ad-hoc solutions like `composeReducers`.

## Examples

1. [Counter Vanilla (no React)](./1.counter-vanilla)
2. [Counter](./2.counter)
3. [Todos](./3.todos)
4. [Todos History](./4.todos-history)
5. [Todos "MVC"](./5.todos-mvc)

### Prerequisites

* Basics of Functional Programming
* Basics of Lensing
* React (100% of official docs level)
* Basics of RxJS

### Guide

Most examples consists of two parts. In first parts we solve problems, gradually introducing new
concepts. In second parts we refactor our solutions: extract them into separate files, make them
cleaner and more stable.

*Most of the code is currently written "from head", without a proper verification, so please report
problems in Issues.*

## Q-A

### Why not AngularJS?

Are you kidding me?

### Why not VueJS?

MVC is dead.

### Why not CycleJS?

To keep it simple. CycleJS is great but I have a goal here to avoid any framework.

### Why not CalmmJS?

Conceptually it's very similar to what I do here, but note the point above.
Plus I don't like magic injections of observables into React components.

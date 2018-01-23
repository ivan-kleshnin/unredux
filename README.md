# Unredux

This repo features a number of realistic apps built without (frontend) frameworks. We use a dataflow
similar to [CycleJS](https://cycle.js.org/) built on [Kefir](https://kefirjs.github.io) and [React](https://facebook.github.io/react/).

We weren't happy with clunky imperative architectures Redux, VueJS, MobX, and GrapQL apps end up with,
so we decided to codify our own approach. Like CycleJS, it's 100% reactive (declarative in time!).
Unlike CycleJS, it doesn't hide effects in drivers. See docs for more details about our motivations
and design decisions.

We propose to start with shallow look at **Examples**. If you like what you see there (code layout,
clarity, etc) – continue with **Tutorials** or **Docs** before you really start digging into how
Examples work.

Don't expect to understand everything from the first read. But, we ensure you, the end result is much
simplier and scalable than everything you can hope to build with Redux, VueJS and even CycleJS.
Our main goal is to keep code super tiny and super clean. We hate enterprise and we hope you'll understand
why after seeing this project.

One more thing. The proposed architecture fits perfectly for **all** interactive apps:
including static site generator (with watch mode), browser games, console games, etc.
It's not limited to frontend by no means. We hope to add corresponding examples with time.

## Docs

* [Framework design comparison](./docs/frameworks.md)
* [Reactive or what?](./docs/reactive-or-what.md)
* [RxJS &rarr; Kefir](./docs/) (Why and How -- TODO)

## Examples

#### [1. Counter](./examples/1.counter)

A basic example.

#### [2. Counters](./examples/2.counters)

Component isolation and reuse.

#### [3.1 Pages](./examples/3.1.pages)

Pages and simple routing.

#### [3.2 Router](./examples/3.2.router)

Advanced routing (**wip**).

#### [4. Todos](./examples/4.todos)

Classic "TodoMVC" app.

#### [5. Todos-History](./examples/5.todos-history)

Todos with a flexible history management.

#### [6. Shopping-Cart](./examples/6.shopping-cart)

Shopping Cart with interactions between "parent" and "child" apps.

#### [7. CRUD](./examples/7.crud)

CRUD client-server apps showing async data load, caching, SSR, and more.

#### [10. Gists](./examples/10.gists)

Some random useful code gists.

## Tutorials

#### [1. State](./tutorials/1.state)

Getting started with reactive states.

#### [2. Store](./tutorials/2.store)

Let's make a better store abstraction.

#### [10. Logging](./tutorials/10.log)

Learn how to use logging middleware.

#### [11. Control](./tutorials/11.control)

*wip*

## Usage

Examples are expected to work in Browser and NodeJS environments. The latter will require `babel-node`
(because of ES6 modules).

```
$ npm install babel-cli -g
$ npm install http-server -g
```

#### Browser

1. Fork and download the repo.
2. `$ npm install` in the root to pull common dependencies.
3. `$ cd <example_folder>`.
4. `$ npm install` to pull local example dependencies and symlink vendor libraries (see below).
5. `$ npm start` (check `package.json` scripts).

#### NodeJS

1. Create `some.js` file in the project root.
2. Run the file with `$ babel-node some.js`.
3. Required babel plugins and presets will be applied automatically.

### Prerequisites

* Functional Programming (basics)
* Lensing (basics)
* React (basics)
* Kefir (basics)

## Remarks

### Conventions

We use ASCII [marble diagrams](http://rxmarbles.com/):

```
observable: ---v1---v2---> (time)
```

where `v1` may denote a string `"v1"` or something else, which should be clear from a context.

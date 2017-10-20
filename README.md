# Unredux

**WIP**

I strongly prefer **libraries** over **frameworks**. In this repo I experiment with different React
examples implemented:

1. Without frameworks
2. Without an expected boilerplate

We will write our own set of helpers from scratch step by step. So I encourage you to
elaborate examples sequentially.

### The cauldron

#### [Motivation (wip)](./docs/motivation.md)

#### [Concepts (wip)](./docs/concepts.md)

#### [Ideas (wip)](./docs/ideas.md)

#### [Reactive or... what?](./docs/reactive-or-what.md)

### Examples

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

Most examples consists of 2 or 3 parts. At first we solve problems, gradually introducing new
concepts. Then we refactor our solutions: extract them into separate files, make them cleaner
and more stable.

### Usage

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
5. `$ npm run demo1...` (check `package.json` scripts).

#### NodeJS

1. Create some `.js` file in the root.
2. In that file import from `./vendors/ramda`, `./vendors/rxjs` to get the same code as in Browser.
3. Run you file with `$ babel-node <scriptName.js>` instead of `$ node <scriptName.js>`.

---

All code examples rely on `./vendors/ramda` and `./vendors/rxjs` custom tree-shaking bundles.
Webpack tree-shaking is [half-broken](https://github.com/scabbiaza/ramda-webpack-tree-shaking-examples)
and can be used only for production builds. In any case, custom imports (as annoying as they are),
result in much smaller bundles and faster dev. rebuilds.

I modify the `R` namespace there to simplify the reasoning (things become messy with 2+ helper sources).
This is a normal practice for applications (never do that in public libraries!).

### Prerequisites

* Basics of Functional Programming
* Basics of Lensing
* React (100% of official docs level)
* Basics of RxJS

## Conventions

All code snippets (in README.md files) imply the following imports:

```js
import R from "ramda"
// CJS: let R = require("ramda")
import {Observable as O, ReplaySubject as RS, Subject as S} from "rxjs"
// CJS: let {Observable: O, ReplaySubject: RS, Subject: S} = require("rxjs")
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

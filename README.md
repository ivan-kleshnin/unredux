# Unredux

**WIP**

I strongly prefer **libraries** over **frameworks**. In this repo I experiment with different React
examples implemented:

1. Without frameworks
2. Without an expected boilerplate

We will write our own set of helpers from scratch step by step. So I encourage you to
elaborate examples sequentially. The end results will resemble CycleJS framework/app with a few
notable differences.

### Examples

#### [1. Counter](./examples/1.counter)

The basic example.

#### [2. Counters](./examples/2.counters)

Component isolation and reuse.

#### [3.1 Pages](./examples/3.1.pages)

Pages and simple routing.

#### [3.2 Router](./examples/3.2.router)

Advanced routing (**wip**).

#### [4. Todos](./examples/4.todos)

Classic "TodoMVC" example.

#### [5. Todos-History](./examples/5.todos-history)

Todos with a flexible history management.

### Tutorials

#### [1. State](./tutorials/1.state)

Getting started with reactive states.

#### [2. Store](./tutorials/2.store)

Making a better store abstraction step by step.

#### [10. Logging](./tutorials/10.log)

Using logging middleware.

#### [11. Control](./tutorials/11.control)

Using (optional) proactive/non-reactive store interface.

**...wip**

### Docs

#### [Framework design comparison](./docs/frameworks.md)

---

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
5. `$ npm start` (check `package.json` scripts).

#### NodeJS

1. Create some `.js` file in the project root.
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
import * as R from "ramda"
// CJS: let R = require("ramda")
import {Observable as O, ReplaySubject as RS, Subject as S} from "rxjs"
// CJS: let {Observable: O, ReplaySubject: RS, Subject: S} = require("rxjs")
```

which are omitted for brevity. We'll also use ASCII [marble diagrams](http://rxmarbles.com/):

```
observable: ---v1---v2---> (time)
```

where `v1` may denote a string `"v1"` or something else, which should be clear from a context.

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

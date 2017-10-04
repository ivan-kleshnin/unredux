/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ({

/***/ 11:
/*!***************************!*\
  !*** ./client-x/index.js ***!
  \***************************/
/*! exports provided:  */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("Object.defineProperty(__webpack_exports__, \"__esModule\", { value: true });\n/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chan__ = __webpack_require__(/*! ./chan */ 12);\n\n\n// User intents\nlet intents = {\n  increment: Object(__WEBPACK_IMPORTED_MODULE_0__chan__[\"a\" /* chan */])(),      // new is no longer required\n  decrement: Object(__WEBPACK_IMPORTED_MODULE_0__chan__[\"a\" /* chan */])(),      // new is no longer required\n  incrementIfOdd: Object(__WEBPACK_IMPORTED_MODULE_0__chan__[\"a\" /* chan */])(), // new is no longer required\n}\n\n// State actions\nlet stateLoop = Object(__WEBPACK_IMPORTED_MODULE_0__chan__[\"b\" /* stateChan */])()\n\nlet actions = {\n  increment: Observable.merge(\n    intents.increment,\n    stateLoop.sample(intents.incrementIfOdd).filter(state => state.counter % 2)\n  )\n    .map(() => state => R.assoc(\"counter\", state.counter + 1, state)),\n\n  decrement: intents.decrement\n    .map(() => state => R.assoc(\"counter\", state.counter - 1, state)),\n\n  // In the current architecture, the worthless event (attempt to increment counter which won't work by condition)\n  // is not even triggered. It's more reactive though arguably more complex (more moving parts)\n  // It also requires the state looping (which is inevitably imperative).\n}\n\n// State stream\nlet initialState = {counter: 0}\n\nlet state = Observable.merge(\n  actions.increment,\n  actions.decrement,\n)\n .startWith(initialState)\n .scan((state, fn) => fn(state))\n .distinctUntilChanged(R.equals)\n .do(state => {\n   console.log(\"state spy:\", state)\n   stateLoop(state) // .next() is no longer required\n })\n .shareReplay(1)\n\n// Rendering & Events\nlet App = (state) =>\n  `<div>\n    <p>\n      Clicked: <span id=\"value\">${state.counter}</span> times\n      <button id=\"increment\">+</button>\n      <button id=\"decrement\">-</button>\n      <button id=\"incrementIfOdd\">Increment if odd</button>\n      <button id=\"incrementAsync\">Increment async</button>\n    </p>\n  </div>`\n\nlet bindEvents = () => {\n  document.querySelector(\"#increment\").addEventListener(\"click\", () => {\n    intents.increment() // .next() is no longer required\n  })\n\n  document.querySelector(\"#decrement\").addEventListener(\"click\", () => {\n    intents.decrement() // .next() is no longer required\n  })\n\n  document.querySelector(\"#incrementIfOdd\").addEventListener(\"click\", () => {\n    intents.incrementIfOdd() // .next() is no longer required\n  })\n\n  document.querySelector(\"#incrementAsync\").addEventListener(\"click\", () => {\n    setTimeout(() => intents.increment(), 500) // .next() is no longer required\n  })\n}\n\n// Run\nlet root = document.querySelector(\"#root\")\nstate.subscribe(state => {\n  root.innerHTML = App(state)\n  bindEvents()\n})\n\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-x/index.js\n// module id = 11\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-x/index.js?");

/***/ }),

/***/ 12:
/*!**************************!*\
  !*** ./client-x/chan.js ***!
  \**************************/
/*! exports provided: chan, stateChan */
/*! exports used: chan, stateChan */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return chan; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"b\", function() { return stateChan; });\n// chan is both a Subject and a Function\n// here it's a bit simplier, as we don't merge intents with actions\nlet chan = () => {\n  let subj = new Subject()\n  let fn = (...callArgs) => {\n    return subj.next(...callArgs)\n  }\n  Object.setPrototypeOf(fn, subj) // slow, not a problem as calls are super rare (init time only)\n  return fn\n}\n\nlet stateChan = () => {\n  let subj = new ReplaySubject(1)\n  let fn = (...callArgs) => {\n    return subj.next(...callArgs)\n  }\n  Object.setPrototypeOf(fn, subj) // slow, not a problem as calls are super rare (init time only)\n  return fn\n}\n\n// let c = chan()\n// c.subscribe(x => {\n//   console.log(x)\n// })\n//\n// c(1) // instead of c.next(1)\n// c(2) // instead of c.next(2)\n// c(3) // instead of c.next(3)\n\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-x/chan.js\n// module id = 12\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-x/chan.js?");

/***/ })

/******/ });
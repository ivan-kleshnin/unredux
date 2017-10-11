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
/******/ 	return __webpack_require__(__webpack_require__.s = 39);
/******/ })
/************************************************************************/
/******/ ({

/***/ 39:
/*!************************!*\
  !*** ./demo2/index.js ***!
  \************************/
/*! exports provided:  */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("Object.defineProperty(__webpack_exports__, \"__esModule\", { value: true });\n/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chan__ = __webpack_require__(/*! ./chan */ 40);\n\n\n// Actions =========================================================================================\nlet actions = {\n  // Here we merged intents with actions\n  // each intent is simultaneously a function (to trigger that event)\n  // and an observable (to subscribe on that event)\n  increment: Object(__WEBPACK_IMPORTED_MODULE_0__chan__[\"a\" /* chan */])($ => $.map((...args) => state =>\n    R.assoc(\"counter\", state.counter + 1, state)\n  )),\n\n  decrement: Object(__WEBPACK_IMPORTED_MODULE_0__chan__[\"a\" /* chan */])($ => $.map((...args) => state =>\n    R.assoc(\"counter\", state.counter - 1, state)\n  )),\n\n  incrementIfOdd: Object(__WEBPACK_IMPORTED_MODULE_0__chan__[\"a\" /* chan */])($ => $.map((...args) => state =>\n    state.counter % 2\n      ? R.assoc(\"counter\", state.counter + 1, state)\n      : state\n  )),\n}\n\n// State ===========================================================================================\nlet initialState = {counter: 0}\n\nlet state = Observable.merge(\n  actions.increment,\n  actions.decrement,\n  actions.incrementIfOdd,\n)\n .startWith(initialState)\n .scan((state, fn) => fn(state))\n .distinctUntilChanged(R.equals)\n .do(s => {\n   console.log(\"state:\", s)\n })\n .shareReplay(1)\n\n// Rendering & Events ==============================================================================\nlet App = (state) =>\n  `<div>\n    <p>\n      Clicked: <span id=\"value\">${state.counter}</span> times\n      <button id=\"increment\">+</button>\n      <button id=\"decrement\">-</button>\n      <button id=\"incrementIfOdd\">Increment if odd</button>\n      <button id=\"incrementAsync\">Increment async</button>\n    </p>\n  </div>`\n\nlet bindEvents = () => {\n  document.querySelector(\"#increment\").addEventListener(\"click\", () => {\n    actions.increment() // .next() is no longer required\n  })\n\n  document.querySelector(\"#decrement\").addEventListener(\"click\", () => {\n    actions.decrement() // .next() is no longer required\n  })\n\n  document.querySelector(\"#incrementIfOdd\").addEventListener(\"click\", () => {\n    actions.incrementIfOdd() // .next() is no longer required\n  })\n\n  document.querySelector(\"#incrementAsync\").addEventListener(\"click\", () => {\n    setTimeout(() => actions.increment(), 500) // .next() is no longer required\n  })\n}\n\nlet root = document.querySelector(\"#root\")\nstate.subscribe(state => {\n  root.innerHTML = App(state)\n  bindEvents()\n})\n\n\n//////////////////\n// WEBPACK FOOTER\n// ./demo2/index.js\n// module id = 39\n// module chunks = 1\n\n//# sourceURL=webpack:///./demo2/index.js?");

/***/ }),

/***/ 40:
/*!***********************!*\
  !*** ./demo2/chan.js ***!
  \***********************/
/*! exports provided: chan */
/*! exports used: chan */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return chan; });\n// chan is both an Observable and a Function\nlet chan = (mapFn) => {\n  let subj = new Subject()\n  let obs = mapFn(subj)\n  function channel(...callArgs) {\n    return subj.next(...callArgs)\n  }\n  Object.setPrototypeOf(channel, obs) // slow, not a problem as calls are init time only\n  return channel\n}\n\n// let c = chan(x => y => x * y))\n// c.subscribe(fn => {\n//   console.log(fn(10)) // x is an event argument, y is state\n// })\n//\n// c(1) // instead of c.next(1)\n// c(2) // instead of c.next(2)\n// c(3) // instead of c.next(3)\n\n////////////////////////////////////////////////////////////////////////////////////////////////////\n// The code above is equivalent to this:\n\n// let s = new Subject()\n// let o = s.map(x => x * 2)\n// o.subscribe(x => {\n//   console.log(x)\n// })\n// s.next(1)\n// s.next(2)\n// s.next(3)\n\n\n//////////////////\n// WEBPACK FOOTER\n// ./demo2/chan.js\n// module id = 40\n// module chunks = 1\n\n//# sourceURL=webpack:///./demo2/chan.js?");

/***/ })

/******/ });
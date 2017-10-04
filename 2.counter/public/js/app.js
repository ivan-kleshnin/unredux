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
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = React;\n\n//////////////////\n// WEBPACK FOOTER\n// external \"React\"\n// module id = 7\n// module chunks = 1 2\n\n//# sourceURL=webpack:///external_%22React%22?");

/***/ }),
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/*!***************************!*\
  !*** ./client-2/index.js ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _react = __webpack_require__(/*! react */ 7);\n\nvar _chan = __webpack_require__(/*! ./chan */ 13);\n\nvar _chan2 = _interopRequireDefault(_chan);\n\nvar _connect = __webpack_require__(/*! ./connect */ 14);\n\nvar _connect2 = _interopRequireDefault(_connect);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n// Intents\nvar intents = {\n  increment: (0, _chan2.default)(function () {\n    return function (state) {\n      return R.assoc(\"counter\", state.counter + 1, state);\n    };\n  }),\n\n  decrement: (0, _chan2.default)(function () {\n    return function (state) {\n      return R.assoc(\"counter\", state.counter - 1, state);\n    };\n  }),\n\n  incrementIfOdd: (0, _chan2.default)(function () {\n    return function (state) {\n      return state.counter % 2 ? R.assoc(\"counter\", state.counter + 1, state) : state;\n    };\n  })\n\n  // State\n};var initialState = { counter: 0 };\n\nvar state = Observable.merge(intents.increment, intents.decrement, intents.incrementIfOdd).startWith(initialState).scan(function (state, fn) {\n  return fn(state);\n}).distinctUntilChanged(R.equals).do(function (state) {\n  console.log(\"state spy:\", state);\n}).shareReplay(1);\n\n// Components\nvar App = (0, _connect2.default)({ counter: state.pluck(\"counter\") }, function (props) {\n  return React.createElement(\n    \"div\",\n    { className: props.className },\n    React.createElement(\n      \"p\",\n      null,\n      \"Clicked: \",\n      React.createElement(\n        \"span\",\n        { id: \"value\" },\n        props.counter\n      ),\n      \" times\",\n      React.createElement(\n        \"button\",\n        { id: \"increment\", onClick: function onClick() {\n            return intents.increment();\n          } },\n        \"+\"\n      ),\n      React.createElement(\n        \"button\",\n        { id: \"decrement\", onClick: function onClick() {\n            return intents.decrement();\n          } },\n        \"-\"\n      ),\n      React.createElement(\n        \"button\",\n        { id: \"incrementIfOdd\", onClick: function onClick() {\n            return intents.incrementIfOdd();\n          } },\n        \"Increment if odd\"\n      ),\n      React.createElement(\n        \"button\",\n        { id: \"incrementAsync\", onClick: function onClick() {\n            setTimeout(function () {\n              return intents.increment();\n            }, 500);\n          } },\n        \"Increment async\"\n      )\n    )\n  );\n});\n\nReactDOM.render(React.createElement(App, null), document.getElementById(\"root\"));\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/index.js\n// module id = 12\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/index.js?");

/***/ }),
/* 13 */
/*!**************************!*\
  !*** ./client-2/chan.js ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\n// chan is both an Observable and a Function\nexports.default = function (mapFn) {\n  var subj = new Subject();\n  var obs = subj.map(mapFn);\n  var fn = function fn() {\n    return subj.next.apply(subj, arguments);\n  };\n  Object.setPrototypeOf(fn, obs); // slow, not a problem as calls are super rare (init time only)\n  return fn;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/chan.js\n// module id = 13\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/chan.js?");

/***/ }),
/* 14 */
/*!*****************************!*\
  !*** ./client-2/connect.js ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nexports.default = connect;\n\nvar _react = __webpack_require__(/*! react */ 7);\n\nvar _combineLatestObj = __webpack_require__(/*! ./combineLatestObj */ 15);\n\nvar _combineLatestObj2 = _interopRequireDefault(_combineLatestObj);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nfunction connect(streamsToProps, ComponentToWrap) {\n  var Container = function (_Component) {\n    _inherits(Container, _Component);\n\n    function Container(props) {\n      _classCallCheck(this, Container);\n\n      var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this, props));\n\n      _this.state = {}; // will be replaced with initialState on componentWillMount (before first render)\n      return _this;\n    }\n\n    _createClass(Container, [{\n      key: \"componentWillMount\",\n      value: function componentWillMount() {\n        var _this2 = this;\n\n        var props = (0, _combineLatestObj2.default)(streamsToProps);\n        this.$ = props.subscribe(function (data) {\n          _this2.setState(data);\n        });\n      }\n    }, {\n      key: \"componentWillUnmount\",\n      value: function componentWillUnmount() {\n        this.$.unsubscribe();\n      }\n    }, {\n      key: \"render\",\n      value: function render() {\n        return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children);\n      }\n    }]);\n\n    return Container;\n  }(_react.Component);\n\n  return Container;\n}\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/connect.js\n// module id = 14\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/connect.js?");

/***/ }),
/* 15 */
/*!**************************************!*\
  !*** ./client-2/combineLatestObj.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js\nvar combineLatestObj = function combineLatestObj(obj) {\n  var keys = Object.keys(obj); // stream names\n  var values = Object.values(obj); // streams\n  return Observable.combineLatest(values, function () {\n    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {\n      args[_key] = arguments[_key];\n    }\n\n    return R.zipObj(keys, args);\n  });\n};\n\n// let s1 = Observable.of(1)\n// let s2 = Observable.of(2)\n// let s3 = Observable.of(3)\n//\n// let sc = combineLatestObj({s1, s2, s3})\n//\n// sc.subscribe((data) => {\n//   console.log(data)\n// })\n\nmodule.exports = combineLatestObj;\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/combineLatestObj.js\n// module id = 15\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/combineLatestObj.js?");

/***/ })
/******/ ]);
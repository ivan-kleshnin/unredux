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
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
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
/* 7 */,
/* 8 */
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = React;\n\n//////////////////\n// WEBPACK FOOTER\n// external \"React\"\n// module id = 8\n// module chunks = 1 2\n\n//# sourceURL=webpack:///external_%22React%22?");

/***/ }),
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */
/*!***************************!*\
  !*** ./client-2/index.js ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _react = __webpack_require__(/*! react */ 8);\n\nvar _chan = __webpack_require__(/*! ./chan */ 16);\n\nvar _chan2 = _interopRequireDefault(_chan);\n\nvar _connect = __webpack_require__(/*! ./connect */ 17);\n\nvar _connect2 = _interopRequireDefault(_connect);\n\nvar _store = __webpack_require__(/*! ./store */ 19);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n// Intents\nvar intents = {\n  addTodo: (0, _chan2.default)(function (text) {\n    return function (state) {\n      var id = String(Object.values(state.todos).length + 1);\n      return R.setL([\"todos\", id], {\n        id: id,\n        text: text,\n        completed: false,\n        addedAt: new Date().toISOString()\n      }, state);\n    };\n  }),\n\n  toggleTodo: (0, _chan2.default)(function (id) {\n    return R.overL([\"todos\", id, \"completed\"], function (x) {\n      return !x;\n    });\n  }),\n\n  setFilter: (0, _chan2.default)(function (filter) {\n    return R.setL([\"filter\"], filter);\n  })\n\n  // State\n};var initialState = {\n  todos: { // it's more convenient to have an object of models than an array of them, in general\n    \"1\": {\n      id: \"1\",\n      text: \"Write a TODO\",\n      completed: false,\n      addedAt: new Date().toISOString()\n    }\n  },\n  filter: \"all\"\n};\n\nvar state = (0, _store.store)(initialState, intents, function (state) {\n  console.log(\"state spy:\", state);\n});\n\n// Derived state should act like normal (instead of some memoized shit), so you can\n// depend on it in actions (unlike so in Redux!)\nvar derived = {\n  filteredTodos: (0, _store.derive)(state, function (state) {\n    switch (state.filter) {\n      case \"all\":\n        return Object.values(state.todos);\n      case \"completed\":\n        return R.sortBy(function (t) {\n          return t.addedAt;\n        }, R.filter(function (t) {\n          return t.completed;\n        }, Object.values(state.todos)));\n      case \"active\":\n        return R.sortBy(function (t) {\n          return t.addedAt;\n        }, R.filter(function (t) {\n          return !t.completed;\n        }, Object.values(state.todos)));\n      default:\n        throw Error(\"Unknown filter: \" + state.filter);\n    }\n  })\n\n  // Components\n};var AddTodo = function AddTodo(props) {\n  var input = void 0;\n  return React.createElement(\n    \"div\",\n    null,\n    React.createElement(\n      \"form\",\n      { onSubmit: function onSubmit(e) {\n          e.preventDefault();\n          if (!input.value.trim()) {\n            return;\n          }\n          intents.addTodo(input.value);\n          input.value = \"\";\n        } },\n      React.createElement(\"input\", { ref: function ref(node) {\n          input = node;\n        } }),\n      React.createElement(\n        \"button\",\n        { type: \"submit\" },\n        \"Add Todo\"\n      )\n    )\n  );\n};\n\nvar TodoItem = function TodoItem(props) {\n  return React.createElement(\n    \"li\",\n    {\n      onClick: function onClick() {\n        return intents.toggleTodo(props.todo.id);\n      },\n      style: { textDecoration: props.todo.completed ? \"line-through\" : \"none\" }\n    },\n    props.todo.text\n  );\n};\n\nvar TodoList = (0, _connect2.default)({ todos: derived.filteredTodos }, function (props) {\n  return React.createElement(\n    \"ul\",\n    null,\n    props.todos.map(function (todo) {\n      return React.createElement(TodoItem, { key: todo.id, todo: todo });\n    })\n  );\n});\n\nvar Footer = function Footer(props) {\n  return React.createElement(\n    \"p\",\n    null,\n    \"Show:\",\n    \" \",\n    React.createElement(\n      \"a\",\n      { id: \"all\", href: \"#all\", onClick: function onClick(e) {\n          e.preventDefault();intents.setFilter(\"all\");\n        } },\n      \"All\"\n    ),\n    \", \",\n    React.createElement(\n      \"a\",\n      { id: \"active\", href: \"#active\", onClick: function onClick(e) {\n          e.preventDefault();intents.setFilter(\"active\");\n        } },\n      \"Active\"\n    ),\n    \", \",\n    React.createElement(\n      \"a\",\n      { id: \"completed\", href: \"#completed\", onClick: function onClick(e) {\n          e.preventDefault();intents.setFilter(\"completed\");\n        } },\n      \"Completed\"\n    )\n  );\n};\n\nvar App = function App(props) {\n  return React.createElement(\n    \"div\",\n    null,\n    React.createElement(AddTodo, null),\n    React.createElement(TodoList, null),\n    React.createElement(Footer, null)\n  );\n};\n\nReactDOM.render(React.createElement(App, null), document.getElementById(\"root\"));\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/index.js\n// module id = 15\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/index.js?");

/***/ }),
/* 16 */
/*!**************************!*\
  !*** ./client-2/chan.js ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\n// chan is both an Observable and a Function\nexports.default = function (mapFn) {\n  var subj = new Subject();\n  var obs = subj.map(mapFn);\n  var fn = function fn() {\n    return subj.next.apply(subj, arguments);\n  };\n  Object.setPrototypeOf(fn, obs); // slow, not a problem as calls are super rare (init time only)\n  return fn;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/chan.js\n// module id = 16\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/chan.js?");

/***/ }),
/* 17 */
/*!*****************************!*\
  !*** ./client-2/connect.js ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nexports.default = connect;\n\nvar _react = __webpack_require__(/*! react */ 8);\n\nvar _combineLatestObj = __webpack_require__(/*! ./combineLatestObj */ 18);\n\nvar _combineLatestObj2 = _interopRequireDefault(_combineLatestObj);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nfunction connect(streamsToProps, ComponentToWrap) {\n  var Container = function (_Component) {\n    _inherits(Container, _Component);\n\n    function Container(props) {\n      _classCallCheck(this, Container);\n\n      var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this, props));\n\n      _this.state = {}; // will be replaced with initialState on componentWillMount (before first render)\n      return _this;\n    }\n\n    _createClass(Container, [{\n      key: \"componentWillMount\",\n      value: function componentWillMount() {\n        var _this2 = this;\n\n        var props = (0, _combineLatestObj2.default)(streamsToProps);\n        this.$ = props.subscribe(function (data) {\n          _this2.setState(data);\n        });\n      }\n    }, {\n      key: \"componentWillUnmount\",\n      value: function componentWillUnmount() {\n        this.$.unsubscribe();\n      }\n    }, {\n      key: \"render\",\n      value: function render() {\n        return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children);\n      }\n    }]);\n\n    return Container;\n  }(_react.Component);\n\n  return Container;\n}\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/connect.js\n// module id = 17\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/connect.js?");

/***/ }),
/* 18 */
/*!**************************************!*\
  !*** ./client-2/combineLatestObj.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js\nvar combineLatestObj = function combineLatestObj(obj) {\n  var keys = Object.keys(obj); // stream names\n  var values = Object.values(obj); // streams\n  return Observable.combineLatest(values, function () {\n    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {\n      args[_key] = arguments[_key];\n    }\n\n    return R.zipObj(keys, args);\n  });\n};\n\n// let s1 = Observable.of(1)\n// let s2 = Observable.of(2)\n// let s3 = Observable.of(3)\n//\n// let sc = combineLatestObj({s1, s2, s3})\n//\n// sc.subscribe((data) => {\n//   console.log(data)\n// })\n\nmodule.exports = combineLatestObj;\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/combineLatestObj.js\n// module id = 18\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/combineLatestObj.js?");

/***/ }),
/* 19 */
/*!***************************!*\
  !*** ./client-2/store.js ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nfunction _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }\n\nvar noop = function noop(x) {\n  return null;\n};\n\n// (State, Object (Observable (State -> State)), () -> null) -> Observable State\nvar store = exports.store = function store(initialState, actions) {\n  var _Observable;\n\n  var spyFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;\n\n  actions = Object.values(actions); // converts objects, leaves arrays untouched\n  return (_Observable = Observable).merge.apply(_Observable, _toConsumableArray(actions)).startWith(initialState).scan(function (state, fn) {\n    if (typeof fn != \"function\") {\n      throw Error(\"invalid fn \" + fn + \" dispatched\");\n    } else {\n      return fn(state);\n    }\n  }).distinctUntilChanged(R.equals).do(spyFn).shareReplay(1);\n};\n\n// Observable State, (State -> State) -> Observable State\nvar derive = exports.derive = function derive(state, deriveFn) {\n  return state.map(deriveFn).distinctUntilChanged().shareReplay(1);\n};\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/store.js\n// module id = 19\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-2/store.js?");

/***/ })
/******/ ]);
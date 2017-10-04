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
/******/ 	return __webpack_require__(__webpack_require__.s = 18);
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
/* 8 */,
/* 9 */,
/* 10 */
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = React;\n\n//////////////////\n// WEBPACK FOOTER\n// external \"React\"\n// module id = 10\n// module chunks = 1 2\n\n//# sourceURL=webpack:///external_%22React%22?");

/***/ }),
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/*!***************************!*\
  !*** ./client-1/index.js ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _react = __webpack_require__(/*! react */ 10);\n\nvar _chan = __webpack_require__(/*! ./chan */ 19);\n\nvar _chan2 = _interopRequireDefault(_chan);\n\nvar _connect = __webpack_require__(/*! ./connect */ 20);\n\nvar _connect2 = _interopRequireDefault(_connect);\n\nvar _store = __webpack_require__(/*! ./store */ 22);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n// Actions\nvar actions = {\n  addTodo: (0, _chan2.default)(function (text) {\n    return function (state) {\n      var id = String(Object.values(state.todos).length + 1);\n      return R.setL([\"todos\", id], {\n        id: id,\n        text: text,\n        completed: false,\n        addedAt: new Date().toISOString()\n      }, state);\n    };\n  })\n\n  // toggleTodo: chan(id => R.overL([\"todos\", id, \"completed\"], x => !x)),\n\n  // setFilter: chan(filter => R.setL([\"filter\"], filter)),\n};\n\nvar canUndo = function canUndo(state) {\n  return state.i > Math.max(0, R.findIndex(R.id, state.log));\n};\n\nvar canRedo = function canRedo(state) {\n  return state.i < state.log.length - 1;\n};\n\nvar historyActions = {\n  undo: (0, _chan2.default)(function () {\n    return function (state) {\n      return R.overL([\"i\"], function (i) {\n        return canUndo(state) ? i - 1 : i;\n      }, state);\n    };\n  }),\n\n  redo: (0, _chan2.default)(function () {\n    return function (state) {\n      return R.overL([\"i\"], function (i) {\n        return canRedo(state) ? i + 1 : i;\n      }, state);\n    };\n  })\n\n  // State\n};var initialState = {\n  todos: {},\n  filter: \"all\"\n};\n\nvar state = (0, _store.historyStore)(initialState, actions, historyActions, 3, function (hs) {\n  console.log(\"state spy:\", hs);\n  console.log();\n});\n\nvar derived = {\n  filteredTodos: (0, _store.derive)(state, function (state) {\n    switch (state.filter) {\n      case \"all\":\n        return Object.values(state.todos);\n      case \"completed\":\n        return R.sortBy(function (t) {\n          return t.addedAt;\n        }, R.filter(function (t) {\n          return t.completed;\n        }, Object.values(state.todos)));\n      case \"active\":\n        return R.sortBy(function (t) {\n          return t.addedAt;\n        }, R.filter(function (t) {\n          return !t.completed;\n        }, Object.values(state.todos)));\n      default:\n        throw Error(\"Unknown filter: \" + state.filter);\n    }\n  })\n\n  // Components\n};var AddTodo = function AddTodo(props) {\n  var input = void 0;\n  return React.createElement(\n    \"div\",\n    null,\n    React.createElement(\n      \"form\",\n      { onSubmit: function onSubmit(e) {\n          e.preventDefault();\n          if (!input.value.trim()) {\n            return;\n          }\n          actions.addTodo(input.value);\n          input.value = \"\";\n        } },\n      React.createElement(\"input\", { ref: function ref(node) {\n          input = node;\n        } }),\n      React.createElement(\n        \"button\",\n        { type: \"submit\" },\n        \"Add Todo\"\n      )\n    )\n  );\n};\n\nvar TodoItem = function TodoItem(props) {\n  return React.createElement(\n    \"li\",\n    {\n      onClick: function onClick() {\n        return actions.toggleTodo(props.todo.id);\n      },\n      style: { textDecoration: props.todo.completed ? \"line-through\" : \"none\" }\n    },\n    props.todo.text\n  );\n};\n\nvar TodoList = (0, _connect2.default)({ todos: derived.filteredTodos }, function (props) {\n  return React.createElement(\n    \"ul\",\n    null,\n    props.todos.map(function (todo) {\n      return React.createElement(TodoItem, { key: todo.id, todo: todo });\n    })\n  );\n});\n\nvar Footer = function Footer(props) {\n  return React.createElement(\n    \"p\",\n    null,\n    \"Show:\",\n    \" \",\n    React.createElement(\n      \"a\",\n      { id: \"all\", href: \"#all\", onClick: function onClick(e) {\n          e.preventDefault();actions.setFilter(\"all\");\n        } },\n      \"All\"\n    ),\n    \", \",\n    React.createElement(\n      \"a\",\n      { id: \"active\", href: \"#active\", onClick: function onClick(e) {\n          e.preventDefault();actions.setFilter(\"active\");\n        } },\n      \"Active\"\n    ),\n    \", \",\n    React.createElement(\n      \"a\",\n      { id: \"completed\", href: \"#completed\", onClick: function onClick(e) {\n          e.preventDefault();actions.setFilter(\"completed\");\n        } },\n      \"Completed\"\n    )\n  );\n};\n\nvar UndoRedo = function UndoRedo(props) {\n  return React.createElement(\n    \"div\",\n    null,\n    React.createElement(\n      \"button\",\n      { onClick: function onClick() {\n          return historyActions.undo();\n        } },\n      \"Undo\"\n    ),\n    \" \",\n    React.createElement(\n      \"button\",\n      { onClick: function onClick() {\n          return historyActions.redo();\n        } },\n      \"Redo\"\n    )\n  );\n};\n\nvar App = function App(props) {\n  return React.createElement(\n    \"div\",\n    null,\n    React.createElement(AddTodo, null),\n    React.createElement(TodoList, null),\n    React.createElement(Footer, null),\n    React.createElement(UndoRedo, null)\n  );\n};\n\nReactDOM.render(React.createElement(App, null), document.getElementById(\"root\"));\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-1/index.js\n// module id = 18\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-1/index.js?");

/***/ }),
/* 19 */
/*!**************************!*\
  !*** ./client-1/chan.js ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\n// chan is both an Observable and a Function\nexports.default = function (mapFn) {\n  var subj = new Subject();\n  var obs = subj.map(mapFn);\n  var fn = function channel() {\n    return subj.next.apply(subj, arguments);\n  };\n  Object.setPrototypeOf(fn, obs); // slow, not a problem as calls are super rare (init time only)\n  return fn;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-1/chan.js\n// module id = 19\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-1/chan.js?");

/***/ }),
/* 20 */
/*!*****************************!*\
  !*** ./client-1/connect.js ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nexports.default = connect;\n\nvar _react = __webpack_require__(/*! react */ 10);\n\nvar _combineLatestObj = __webpack_require__(/*! ./combineLatestObj */ 21);\n\nvar _combineLatestObj2 = _interopRequireDefault(_combineLatestObj);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nfunction connect(streamsToProps, ComponentToWrap) {\n  var Container = function (_Component) {\n    _inherits(Container, _Component);\n\n    function Container(props) {\n      _classCallCheck(this, Container);\n\n      var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this, props));\n\n      _this.state = {}; // will be replaced with initialState on componentWillMount (before first render)\n      return _this;\n    }\n\n    _createClass(Container, [{\n      key: \"componentWillMount\",\n      value: function componentWillMount() {\n        var _this2 = this;\n\n        var props = (0, _combineLatestObj2.default)(streamsToProps);\n        this.$ = props.subscribe(function (data) {\n          _this2.setState(data);\n        });\n      }\n    }, {\n      key: \"componentWillUnmount\",\n      value: function componentWillUnmount() {\n        this.$.unsubscribe();\n      }\n    }, {\n      key: \"render\",\n      value: function render() {\n        return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children);\n      }\n    }]);\n\n    return Container;\n  }(_react.Component);\n\n  return Container;\n}\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-1/connect.js\n// module id = 20\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-1/connect.js?");

/***/ }),
/* 21 */
/*!**************************************!*\
  !*** ./client-1/combineLatestObj.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// a nicer analogy of https://github.com/staltz/combineLatestObj/blob/master/index.js\nvar combineLatestObj = function combineLatestObj(obj) {\n  var keys = Object.keys(obj); // stream names\n  var values = Object.values(obj); // streams\n  return Observable.combineLatest(values, function () {\n    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {\n      args[_key] = arguments[_key];\n    }\n\n    return R.zipObj(keys, args);\n  });\n};\n\n// let s1 = Observable.of(1)\n// let s2 = Observable.of(2)\n// let s3 = Observable.of(3)\n//\n// let sc = combineLatestObj({s1, s2, s3})\n//\n// sc.subscribe((data) => {\n//   console.log(data)\n// })\n\nmodule.exports = combineLatestObj;\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-1/combineLatestObj.js\n// module id = 21\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-1/combineLatestObj.js?");

/***/ }),
/* 22 */
/*!***************************!*\
  !*** ./client-1/store.js ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nfunction _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }\n\n// type Noop = (x) -> ()\n// type Actions = Object (Observable (State -> State)\n\n// (State, Actions, Noop) -> Observable State\nvar store = exports.store = function store(initialState, actions) {\n  var _Observable;\n\n  var mapFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : R.id;\n\n  actions = Object.values(actions); // converts objects, leaves arrays untouched\n  return (_Observable = Observable).merge.apply(_Observable, _toConsumableArray(actions)).startWith(initialState).scan(function (state, fn) {\n    if (typeof fn != \"function\") {\n      throw Error(\"invalid fn \" + fn + \" dispatched\");\n    } else {\n      return fn(state);\n    }\n  }).map(mapFn).distinctUntilChanged(R.equals).shareReplay(1);\n};\n\n// (State, Actions, Actions, Number, Noop) -> Observable State\nvar historyStore = exports.historyStore = function historyStore(initialState, stateActions, historyActions, historyLength, spyFn) {\n  stateActions = Object.values(stateActions); // converts objects, leaves arrays untouched\n  historyActions = Object.values(historyActions); // ...\n\n  var normalizeLog = function normalizeLog(log) {\n    return R.takeLast(historyLength, [].concat(_toConsumableArray(R.repeat(null, historyLength)), _toConsumableArray(log)));\n  };\n\n  var normalizeI = function normalizeI(i) {\n    return i > historyLength - 1 ? historyLength - 1 : i;\n  };\n\n  initialState = {\n    log: normalizeLog([initialState]), // [null, null, <state>]\n    i: historyLength - 1 //  0     1     2!\n  };\n\n  stateActions = stateActions.map(function (channel) {\n    return channel.map(function (fn) {\n      return function (hs) {\n        if (hs.i < historyLength - 1) {\n          hs = R.merge(hs, {\n            log: normalizeLog(R.slice(0, hs.i + 1, hs.log)),\n            i: historyLength - 1\n          });\n        }\n        return R.setL([\"log\"], tailAppend(fn(hs.log[hs.i]), hs.log), hs);\n      };\n    });\n  });\n\n  return store(initialState, stateActions.concat(historyActions), function (state) {\n    spyFn(state);\n    return state.log[state.i];\n  });\n};\n\n// (Observable State, (State -> State)) -> Observable State\nvar derive = exports.derive = function derive(state, deriveFn) {\n  return state.map(deriveFn).distinctUntilChanged().shareReplay(1);\n};\n\nvar tailAppend = R.curry(function (x, xs) {\n  return R.append(x, R.tail(xs));\n});\n\n/*\nNormal case\n  log = [null, null, {a}]\n  i = 2\n\n  1) after change (both setL)\n  log = [null, null, {a}, {b}]\n  i = 3\n\n  2) after normalization (both overL)\n  log = [null, {a}, {b}]\n  i = 2\n\nShifted case\n  log = [null, {a}, {b}]\n  i = 1\n\n  1) after change (both setL)\n  log = [null, {a}, {c}]\n  i = 2\n\n  2) after normalization (both overL)\n  log = [null, {a}, {c}]\n  i = 2\n*/\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-1/store.js\n// module id = 22\n// module chunks = 1 2\n\n//# sourceURL=webpack:///./client-1/store.js?");

/***/ })
/******/ ]);
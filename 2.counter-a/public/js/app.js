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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ({

/***/ 6:
/*!*************************!*\
  !*** ./client/index.js ***!
  \*************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ 7);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ 8);

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var stateCycle = new ReplaySubject(1);

// User intents
var intents = {
  increment: new Subject(),
  decrement: new Subject(),
  incrementIfOdd: new Subject()

  // State actions
};var actions = {
  increment: Observable.merge(intents.increment, stateCycle.sample(intents.incrementIfOdd).filter(function (state) {
    return state.counter % 2;
  })).map(function () {
    return function (state) {
      return R.assoc("counter", state.counter + 1, state);
    };
  }),
  decrement: intents.decrement.map(function () {
    return function (state) {
      return R.assoc("counter", state.counter - 1, state);
    };
  })

  // State stream
};var initialState = { counter: 0 };

var state = Observable.merge(actions.increment, actions.decrement).startWith(initialState).scan(function (state, fn) {
  return fn(state);
}).do(function (state) {
  console.log("state spy:", state);
  stateCycle.next(state);
}).distinctUntilChanged().shareReplay(1);

// Rendering & Events

var App = function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      var _this2 = this;

      this.$ = state.subscribe(function (state) {
        _this2.setState(state);
      });
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.$.unsubscribe();
    }
  }, {
    key: "render",
    value: function render() {
      var state = this.state;

      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(
          "p",
          null,
          "Clicked: ",
          _react2.default.createElement(
            "span",
            { id: "value" },
            state.counter
          ),
          " times",
          _react2.default.createElement(
            "button",
            { id: "increment", onClick: function onClick() {
                return intents.increment.next();
              } },
            "+"
          ),
          _react2.default.createElement(
            "button",
            { id: "decrement", onClick: function onClick() {
                return intents.increment.next();
              } },
            "-"
          ),
          _react2.default.createElement(
            "button",
            { id: "incrementIfOdd", onClick: function onClick() {
                return intents.incrementIfOdd.next();
              } },
            "Increment if odd"
          ),
          _react2.default.createElement(
            "button",
            { id: "incrementAsync", onClick: function onClick() {
                return setTimeout(function () {
                  return intents.increment.next();
                }, 500);
              } },
            "Increment async"
          )
        )
      );
    }
  }]);

  return App;
}(_react.Component);

_reactDom2.default.render(_react2.default.createElement(App, null), document.getElementById("root"));

/***/ }),

/***/ 7:
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = React;

/***/ }),

/***/ 8:
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ })

/******/ });
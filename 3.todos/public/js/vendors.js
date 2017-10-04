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
/******/ 	return __webpack_require__(__webpack_require__.s = 50);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*****************************************!*\
  !*** ./node_modules/rxjs/Observable.js ***!
  \*****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar root_1 = __webpack_require__(/*! ./util/root */ 5);\nvar toSubscriber_1 = __webpack_require__(/*! ./util/toSubscriber */ 91);\nvar observable_1 = __webpack_require__(/*! ./symbol/observable */ 42);\n/**\n * A representation of any set of values over any amount of time. This is the most basic building block\n * of RxJS.\n *\n * @class Observable<T>\n */\nvar Observable = function () {\n    /**\n     * @constructor\n     * @param {Function} subscribe the function that is called when the Observable is\n     * initially subscribed to. This function is given a Subscriber, to which new values\n     * can be `next`ed, or an `error` method can be called to raise an error, or\n     * `complete` can be called to notify of a successful completion.\n     */\n    function Observable(subscribe) {\n        this._isScalar = false;\n        if (subscribe) {\n            this._subscribe = subscribe;\n        }\n    }\n    /**\n     * Creates a new Observable, with this Observable as the source, and the passed\n     * operator defined as the new observable's operator.\n     * @method lift\n     * @param {Operator} operator the operator defining the operation to take on the observable\n     * @return {Observable} a new observable with the Operator applied\n     */\n    Observable.prototype.lift = function (operator) {\n        var observable = new Observable();\n        observable.source = this;\n        observable.operator = operator;\n        return observable;\n    };\n    /**\n     * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.\n     *\n     * <span class=\"informal\">Use it when you have all these Observables, but still nothing is happening.</span>\n     *\n     * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It\n     * might be for example a function that you passed to a {@link create} static factory, but most of the time it is\n     * a library implementation, which defines what and when will be emitted by an Observable. This means that calling\n     * `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often\n     * thought.\n     *\n     * Apart from starting the execution of an Observable, this method allows you to listen for values\n     * that an Observable emits, as well as for when it completes or errors. You can achieve this in two\n     * following ways.\n     *\n     * The first way is creating an object that implements {@link Observer} interface. It should have methods\n     * defined by that interface, but note that it should be just a regular JavaScript object, which you can create\n     * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular do\n     * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also\n     * that your object does not have to implement all methods. If you find yourself creating a method that doesn't\n     * do anything, you can simply omit it. Note however, that if `error` method is not provided, all errors will\n     * be left uncaught.\n     *\n     * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.\n     * This means you can provide three functions as arguments to `subscribe`, where first function is equivalent\n     * of a `next` method, second of an `error` method and third of a `complete` method. Just as in case of Observer,\n     * if you do not need to listen for something, you can omit a function, preferably by passing `undefined` or `null`,\n     * since `subscribe` recognizes these functions by where they were placed in function call. When it comes\n     * to `error` function, just as before, if not provided, errors emitted by an Observable will be thrown.\n     *\n     * Whatever style of calling `subscribe` you use, in both cases it returns a Subscription object.\n     * This object allows you to call `unsubscribe` on it, which in turn will stop work that an Observable does and will clean\n     * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback\n     * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.\n     *\n     * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.\n     * It is an Observable itself that decides when these functions will be called. For example {@link of}\n     * by default emits all its values synchronously. Always check documentation for how given Observable\n     * will behave when subscribed and if its default behavior can be modified with a {@link Scheduler}.\n     *\n     * @example <caption>Subscribe with an Observer</caption>\n     * const sumObserver = {\n     *   sum: 0,\n     *   next(value) {\n     *     console.log('Adding: ' + value);\n     *     this.sum = this.sum + value;\n     *   },\n     *   error() { // We actually could just remove this method,\n     *   },        // since we do not really care about errors right now.\n     *   complete() {\n     *     console.log('Sum equals: ' + this.sum);\n     *   }\n     * };\n     *\n     * Rx.Observable.of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.\n     * .subscribe(sumObserver);\n     *\n     * // Logs:\n     * // \"Adding: 1\"\n     * // \"Adding: 2\"\n     * // \"Adding: 3\"\n     * // \"Sum equals: 6\"\n     *\n     *\n     * @example <caption>Subscribe with functions</caption>\n     * let sum = 0;\n     *\n     * Rx.Observable.of(1, 2, 3)\n     * .subscribe(\n     *   function(value) {\n     *     console.log('Adding: ' + value);\n     *     sum = sum + value;\n     *   },\n     *   undefined,\n     *   function() {\n     *     console.log('Sum equals: ' + sum);\n     *   }\n     * );\n     *\n     * // Logs:\n     * // \"Adding: 1\"\n     * // \"Adding: 2\"\n     * // \"Adding: 3\"\n     * // \"Sum equals: 6\"\n     *\n     *\n     * @example <caption>Cancel a subscription</caption>\n     * const subscription = Rx.Observable.interval(1000).subscribe(\n     *   num => console.log(num),\n     *   undefined,\n     *   () => console.log('completed!') // Will not be called, even\n     * );                                // when cancelling subscription\n     *\n     *\n     * setTimeout(() => {\n     *   subscription.unsubscribe();\n     *   console.log('unsubscribed!');\n     * }, 2500);\n     *\n     * // Logs:\n     * // 0 after 1s\n     * // 1 after 2s\n     * // \"unsubscribed!\" after 2.5s\n     *\n     *\n     * @param {Observer|Function} observerOrNext (optional) Either an observer with methods to be called,\n     *  or the first of three possible handlers, which is the handler for each value emitted from the subscribed\n     *  Observable.\n     * @param {Function} error (optional) A handler for a terminal event resulting from an error. If no error handler is provided,\n     *  the error will be thrown as unhandled.\n     * @param {Function} complete (optional) A handler for a terminal event resulting from successful completion.\n     * @return {ISubscription} a subscription reference to the registered handlers\n     * @method subscribe\n     */\n    Observable.prototype.subscribe = function (observerOrNext, error, complete) {\n        var operator = this.operator;\n        var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);\n        if (operator) {\n            operator.call(sink, this.source);\n        } else {\n            sink.add(this.source ? this._subscribe(sink) : this._trySubscribe(sink));\n        }\n        if (sink.syncErrorThrowable) {\n            sink.syncErrorThrowable = false;\n            if (sink.syncErrorThrown) {\n                throw sink.syncErrorValue;\n            }\n        }\n        return sink;\n    };\n    Observable.prototype._trySubscribe = function (sink) {\n        try {\n            return this._subscribe(sink);\n        } catch (err) {\n            sink.syncErrorThrown = true;\n            sink.syncErrorValue = err;\n            sink.error(err);\n        }\n    };\n    /**\n     * @method forEach\n     * @param {Function} next a handler for each value emitted by the observable\n     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise\n     * @return {Promise} a promise that either resolves on observable completion or\n     *  rejects with the handled error\n     */\n    Observable.prototype.forEach = function (next, PromiseCtor) {\n        var _this = this;\n        if (!PromiseCtor) {\n            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {\n                PromiseCtor = root_1.root.Rx.config.Promise;\n            } else if (root_1.root.Promise) {\n                PromiseCtor = root_1.root.Promise;\n            }\n        }\n        if (!PromiseCtor) {\n            throw new Error('no Promise impl found');\n        }\n        return new PromiseCtor(function (resolve, reject) {\n            // Must be declared in a separate statement to avoid a RefernceError when\n            // accessing subscription below in the closure due to Temporal Dead Zone.\n            var subscription;\n            subscription = _this.subscribe(function (value) {\n                if (subscription) {\n                    // if there is a subscription, then we can surmise\n                    // the next handling is asynchronous. Any errors thrown\n                    // need to be rejected explicitly and unsubscribe must be\n                    // called manually\n                    try {\n                        next(value);\n                    } catch (err) {\n                        reject(err);\n                        subscription.unsubscribe();\n                    }\n                } else {\n                    // if there is NO subscription, then we're getting a nexted\n                    // value synchronously during subscription. We can just call it.\n                    // If it errors, Observable's `subscribe` will ensure the\n                    // unsubscription logic is called, then synchronously rethrow the error.\n                    // After that, Promise will trap the error and send it\n                    // down the rejection path.\n                    next(value);\n                }\n            }, reject, resolve);\n        });\n    };\n    Observable.prototype._subscribe = function (subscriber) {\n        return this.source.subscribe(subscriber);\n    };\n    /**\n     * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable\n     * @method Symbol.observable\n     * @return {Observable} this instance of the observable\n     */\n    Observable.prototype[observable_1.observable] = function () {\n        return this;\n    };\n    // HACK: Since TypeScript inherits static properties too, we have to\n    // fight against TypeScript here so Subject can have a different static create signature\n    /**\n     * Creates a new cold Observable by calling the Observable constructor\n     * @static true\n     * @owner Observable\n     * @method create\n     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor\n     * @return {Observable} a new cold observable\n     */\n    Observable.create = function (subscribe) {\n        return new Observable(subscribe);\n    };\n    return Observable;\n}();\nexports.Observable = Observable;\n//# sourceMappingURL=Observable.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/Observable.js\n// module id = 0\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/Observable.js?");

/***/ }),
/* 1 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_curry2.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./_curry1 */ 2);\nvar _isPlaceholder = __webpack_require__(/*! ./_isPlaceholder */ 11);\n\n/**\n * Optimized internal two-arity curry function.\n *\n * @private\n * @category Function\n * @param {Function} fn The function to curry.\n * @return {Function} The curried function.\n */\nmodule.exports = function _curry2(fn) {\n  return function f2(a, b) {\n    switch (arguments.length) {\n      case 0:\n        return f2;\n      case 1:\n        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {\n          return fn(a, _b);\n        });\n      default:\n        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {\n          return fn(_a, b);\n        }) : _isPlaceholder(b) ? _curry1(function (_b) {\n          return fn(a, _b);\n        }) : fn(a, b);\n    }\n  };\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_curry2.js\n// module id = 1\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_curry2.js?");

/***/ }),
/* 2 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_curry1.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _isPlaceholder = __webpack_require__(/*! ./_isPlaceholder */ 11);\n\n/**\n * Optimized internal one-arity curry function.\n *\n * @private\n * @category Function\n * @param {Function} fn The function to curry.\n * @return {Function} The curried function.\n */\nmodule.exports = function _curry1(fn) {\n  return function f1(a) {\n    if (arguments.length === 0 || _isPlaceholder(a)) {\n      return f1;\n    } else {\n      return fn.apply(this, arguments);\n    }\n  };\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_curry1.js\n// module id = 2\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_curry1.js?");

/***/ }),
/* 3 */
/*!*****************************************!*\
  !*** ./node_modules/rxjs/Subscriber.js ***!
  \*****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar isFunction_1 = __webpack_require__(/*! ./util/isFunction */ 38);\nvar Subscription_1 = __webpack_require__(/*! ./Subscription */ 6);\nvar Observer_1 = __webpack_require__(/*! ./Observer */ 41);\nvar rxSubscriber_1 = __webpack_require__(/*! ./symbol/rxSubscriber */ 27);\n/**\n * Implements the {@link Observer} interface and extends the\n * {@link Subscription} class. While the {@link Observer} is the public API for\n * consuming the values of an {@link Observable}, all Observers get converted to\n * a Subscriber, in order to provide Subscription-like capabilities such as\n * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for\n * implementing operators, but it is rarely used as a public API.\n *\n * @class Subscriber<T>\n */\nvar Subscriber = function (_super) {\n    __extends(Subscriber, _super);\n    /**\n     * @param {Observer|function(value: T): void} [destinationOrNext] A partially\n     * defined Observer or a `next` callback function.\n     * @param {function(e: ?any): void} [error] The `error` callback of an\n     * Observer.\n     * @param {function(): void} [complete] The `complete` callback of an\n     * Observer.\n     */\n    function Subscriber(destinationOrNext, error, complete) {\n        _super.call(this);\n        this.syncErrorValue = null;\n        this.syncErrorThrown = false;\n        this.syncErrorThrowable = false;\n        this.isStopped = false;\n        switch (arguments.length) {\n            case 0:\n                this.destination = Observer_1.empty;\n                break;\n            case 1:\n                if (!destinationOrNext) {\n                    this.destination = Observer_1.empty;\n                    break;\n                }\n                if ((typeof destinationOrNext === 'undefined' ? 'undefined' : _typeof(destinationOrNext)) === 'object') {\n                    if (destinationOrNext instanceof Subscriber) {\n                        this.destination = destinationOrNext;\n                        this.destination.add(this);\n                    } else {\n                        this.syncErrorThrowable = true;\n                        this.destination = new SafeSubscriber(this, destinationOrNext);\n                    }\n                    break;\n                }\n            default:\n                this.syncErrorThrowable = true;\n                this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);\n                break;\n        }\n    }\n    Subscriber.prototype[rxSubscriber_1.rxSubscriber] = function () {\n        return this;\n    };\n    /**\n     * A static factory for a Subscriber, given a (potentially partial) definition\n     * of an Observer.\n     * @param {function(x: ?T): void} [next] The `next` callback of an Observer.\n     * @param {function(e: ?any): void} [error] The `error` callback of an\n     * Observer.\n     * @param {function(): void} [complete] The `complete` callback of an\n     * Observer.\n     * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)\n     * Observer represented by the given arguments.\n     */\n    Subscriber.create = function (next, error, complete) {\n        var subscriber = new Subscriber(next, error, complete);\n        subscriber.syncErrorThrowable = false;\n        return subscriber;\n    };\n    /**\n     * The {@link Observer} callback to receive notifications of type `next` from\n     * the Observable, with a value. The Observable may call this method 0 or more\n     * times.\n     * @param {T} [value] The `next` value.\n     * @return {void}\n     */\n    Subscriber.prototype.next = function (value) {\n        if (!this.isStopped) {\n            this._next(value);\n        }\n    };\n    /**\n     * The {@link Observer} callback to receive notifications of type `error` from\n     * the Observable, with an attached {@link Error}. Notifies the Observer that\n     * the Observable has experienced an error condition.\n     * @param {any} [err] The `error` exception.\n     * @return {void}\n     */\n    Subscriber.prototype.error = function (err) {\n        if (!this.isStopped) {\n            this.isStopped = true;\n            this._error(err);\n        }\n    };\n    /**\n     * The {@link Observer} callback to receive a valueless notification of type\n     * `complete` from the Observable. Notifies the Observer that the Observable\n     * has finished sending push-based notifications.\n     * @return {void}\n     */\n    Subscriber.prototype.complete = function () {\n        if (!this.isStopped) {\n            this.isStopped = true;\n            this._complete();\n        }\n    };\n    Subscriber.prototype.unsubscribe = function () {\n        if (this.closed) {\n            return;\n        }\n        this.isStopped = true;\n        _super.prototype.unsubscribe.call(this);\n    };\n    Subscriber.prototype._next = function (value) {\n        this.destination.next(value);\n    };\n    Subscriber.prototype._error = function (err) {\n        this.destination.error(err);\n        this.unsubscribe();\n    };\n    Subscriber.prototype._complete = function () {\n        this.destination.complete();\n        this.unsubscribe();\n    };\n    Subscriber.prototype._unsubscribeAndRecycle = function () {\n        var _a = this,\n            _parent = _a._parent,\n            _parents = _a._parents;\n        this._parent = null;\n        this._parents = null;\n        this.unsubscribe();\n        this.closed = false;\n        this.isStopped = false;\n        this._parent = _parent;\n        this._parents = _parents;\n        return this;\n    };\n    return Subscriber;\n}(Subscription_1.Subscription);\nexports.Subscriber = Subscriber;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar SafeSubscriber = function (_super) {\n    __extends(SafeSubscriber, _super);\n    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {\n        _super.call(this);\n        this._parentSubscriber = _parentSubscriber;\n        var next;\n        var context = this;\n        if (isFunction_1.isFunction(observerOrNext)) {\n            next = observerOrNext;\n        } else if (observerOrNext) {\n            next = observerOrNext.next;\n            error = observerOrNext.error;\n            complete = observerOrNext.complete;\n            if (observerOrNext !== Observer_1.empty) {\n                context = Object.create(observerOrNext);\n                if (isFunction_1.isFunction(context.unsubscribe)) {\n                    this.add(context.unsubscribe.bind(context));\n                }\n                context.unsubscribe = this.unsubscribe.bind(this);\n            }\n        }\n        this._context = context;\n        this._next = next;\n        this._error = error;\n        this._complete = complete;\n    }\n    SafeSubscriber.prototype.next = function (value) {\n        if (!this.isStopped && this._next) {\n            var _parentSubscriber = this._parentSubscriber;\n            if (!_parentSubscriber.syncErrorThrowable) {\n                this.__tryOrUnsub(this._next, value);\n            } else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {\n                this.unsubscribe();\n            }\n        }\n    };\n    SafeSubscriber.prototype.error = function (err) {\n        if (!this.isStopped) {\n            var _parentSubscriber = this._parentSubscriber;\n            if (this._error) {\n                if (!_parentSubscriber.syncErrorThrowable) {\n                    this.__tryOrUnsub(this._error, err);\n                    this.unsubscribe();\n                } else {\n                    this.__tryOrSetError(_parentSubscriber, this._error, err);\n                    this.unsubscribe();\n                }\n            } else if (!_parentSubscriber.syncErrorThrowable) {\n                this.unsubscribe();\n                throw err;\n            } else {\n                _parentSubscriber.syncErrorValue = err;\n                _parentSubscriber.syncErrorThrown = true;\n                this.unsubscribe();\n            }\n        }\n    };\n    SafeSubscriber.prototype.complete = function () {\n        var _this = this;\n        if (!this.isStopped) {\n            var _parentSubscriber = this._parentSubscriber;\n            if (this._complete) {\n                var wrappedComplete = function wrappedComplete() {\n                    return _this._complete.call(_this._context);\n                };\n                if (!_parentSubscriber.syncErrorThrowable) {\n                    this.__tryOrUnsub(wrappedComplete);\n                    this.unsubscribe();\n                } else {\n                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);\n                    this.unsubscribe();\n                }\n            } else {\n                this.unsubscribe();\n            }\n        }\n    };\n    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {\n        try {\n            fn.call(this._context, value);\n        } catch (err) {\n            this.unsubscribe();\n            throw err;\n        }\n    };\n    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {\n        try {\n            fn.call(this._context, value);\n        } catch (err) {\n            parent.syncErrorValue = err;\n            parent.syncErrorThrown = true;\n            return true;\n        }\n        return false;\n    };\n    SafeSubscriber.prototype._unsubscribe = function () {\n        var _parentSubscriber = this._parentSubscriber;\n        this._context = null;\n        this._parentSubscriber = null;\n        _parentSubscriber.unsubscribe();\n    };\n    return SafeSubscriber;\n}(Subscriber);\n//# sourceMappingURL=Subscriber.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/Subscriber.js\n// module id = 3\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/Subscriber.js?");

/***/ }),
/* 4 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_curry3.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./_curry1 */ 2);\nvar _curry2 = __webpack_require__(/*! ./_curry2 */ 1);\nvar _isPlaceholder = __webpack_require__(/*! ./_isPlaceholder */ 11);\n\n/**\n * Optimized internal three-arity curry function.\n *\n * @private\n * @category Function\n * @param {Function} fn The function to curry.\n * @return {Function} The curried function.\n */\nmodule.exports = function _curry3(fn) {\n  return function f3(a, b, c) {\n    switch (arguments.length) {\n      case 0:\n        return f3;\n      case 1:\n        return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {\n          return fn(a, _b, _c);\n        });\n      case 2:\n        return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {\n          return fn(_a, b, _c);\n        }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {\n          return fn(a, _b, _c);\n        }) : _curry1(function (_c) {\n          return fn(a, b, _c);\n        });\n      default:\n        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {\n          return fn(_a, _b, c);\n        }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {\n          return fn(_a, b, _c);\n        }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {\n          return fn(a, _b, _c);\n        }) : _isPlaceholder(a) ? _curry1(function (_a) {\n          return fn(_a, b, c);\n        }) : _isPlaceholder(b) ? _curry1(function (_b) {\n          return fn(a, _b, c);\n        }) : _isPlaceholder(c) ? _curry1(function (_c) {\n          return fn(a, b, _c);\n        }) : fn(a, b, c);\n    }\n  };\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_curry3.js\n// module id = 4\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_curry3.js?");

/***/ }),
/* 5 */
/*!****************************************!*\
  !*** ./node_modules/rxjs/util/root.js ***!
  \****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(global) {\n// CommonJS / Node have global context exposed as \"global\" variable.\n// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake\n// the global \"global\" var for now.\n\nvar __window = typeof window !== 'undefined' && window;\nvar __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope && self;\nvar __global = typeof global !== 'undefined' && global;\nvar _root = __window || __global || __self;\nexports.root = _root;\n// Workaround Closure Compiler restriction: The body of a goog.module cannot use throw.\n// This is needed when used with angular/tsickle which inserts a goog.module statement.\n// Wrap in IIFE\n(function () {\n    if (!_root) {\n        throw new Error('RxJS could not find any global context (window, self, global)');\n    }\n})();\n//# sourceMappingURL=root.js.map\n/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./../../webpack/buildin/global.js */ 90)))\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/root.js\n// module id = 5\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/root.js?");

/***/ }),
/* 6 */
/*!*******************************************!*\
  !*** ./node_modules/rxjs/Subscription.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\nvar isArray_1 = __webpack_require__(/*! ./util/isArray */ 25);\nvar isObject_1 = __webpack_require__(/*! ./util/isObject */ 39);\nvar isFunction_1 = __webpack_require__(/*! ./util/isFunction */ 38);\nvar tryCatch_1 = __webpack_require__(/*! ./util/tryCatch */ 40);\nvar errorObject_1 = __webpack_require__(/*! ./util/errorObject */ 26);\nvar UnsubscriptionError_1 = __webpack_require__(/*! ./util/UnsubscriptionError */ 92);\n/**\n * Represents a disposable resource, such as the execution of an Observable. A\n * Subscription has one important method, `unsubscribe`, that takes no argument\n * and just disposes the resource held by the subscription.\n *\n * Additionally, subscriptions may be grouped together through the `add()`\n * method, which will attach a child Subscription to the current Subscription.\n * When a Subscription is unsubscribed, all its children (and its grandchildren)\n * will be unsubscribed as well.\n *\n * @class Subscription\n */\nvar Subscription = function () {\n    /**\n     * @param {function(): void} [unsubscribe] A function describing how to\n     * perform the disposal of resources when the `unsubscribe` method is called.\n     */\n    function Subscription(unsubscribe) {\n        /**\n         * A flag to indicate whether this Subscription has already been unsubscribed.\n         * @type {boolean}\n         */\n        this.closed = false;\n        this._parent = null;\n        this._parents = null;\n        this._subscriptions = null;\n        if (unsubscribe) {\n            this._unsubscribe = unsubscribe;\n        }\n    }\n    /**\n     * Disposes the resources held by the subscription. May, for instance, cancel\n     * an ongoing Observable execution or cancel any other type of work that\n     * started when the Subscription was created.\n     * @return {void}\n     */\n    Subscription.prototype.unsubscribe = function () {\n        var hasErrors = false;\n        var errors;\n        if (this.closed) {\n            return;\n        }\n        var _a = this,\n            _parent = _a._parent,\n            _parents = _a._parents,\n            _unsubscribe = _a._unsubscribe,\n            _subscriptions = _a._subscriptions;\n        this.closed = true;\n        this._parent = null;\n        this._parents = null;\n        // null out _subscriptions first so any child subscriptions that attempt\n        // to remove themselves from this subscription will noop\n        this._subscriptions = null;\n        var index = -1;\n        var len = _parents ? _parents.length : 0;\n        // if this._parent is null, then so is this._parents, and we\n        // don't have to remove ourselves from any parent subscriptions.\n        while (_parent) {\n            _parent.remove(this);\n            // if this._parents is null or index >= len,\n            // then _parent is set to null, and the loop exits\n            _parent = ++index < len && _parents[index] || null;\n        }\n        if (isFunction_1.isFunction(_unsubscribe)) {\n            var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);\n            if (trial === errorObject_1.errorObject) {\n                hasErrors = true;\n                errors = errors || (errorObject_1.errorObject.e instanceof UnsubscriptionError_1.UnsubscriptionError ? flattenUnsubscriptionErrors(errorObject_1.errorObject.e.errors) : [errorObject_1.errorObject.e]);\n            }\n        }\n        if (isArray_1.isArray(_subscriptions)) {\n            index = -1;\n            len = _subscriptions.length;\n            while (++index < len) {\n                var sub = _subscriptions[index];\n                if (isObject_1.isObject(sub)) {\n                    var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);\n                    if (trial === errorObject_1.errorObject) {\n                        hasErrors = true;\n                        errors = errors || [];\n                        var err = errorObject_1.errorObject.e;\n                        if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {\n                            errors = errors.concat(flattenUnsubscriptionErrors(err.errors));\n                        } else {\n                            errors.push(err);\n                        }\n                    }\n                }\n            }\n        }\n        if (hasErrors) {\n            throw new UnsubscriptionError_1.UnsubscriptionError(errors);\n        }\n    };\n    /**\n     * Adds a tear down to be called during the unsubscribe() of this\n     * Subscription.\n     *\n     * If the tear down being added is a subscription that is already\n     * unsubscribed, is the same reference `add` is being called on, or is\n     * `Subscription.EMPTY`, it will not be added.\n     *\n     * If this subscription is already in an `closed` state, the passed\n     * tear down logic will be executed immediately.\n     *\n     * @param {TeardownLogic} teardown The additional logic to execute on\n     * teardown.\n     * @return {Subscription} Returns the Subscription used or created to be\n     * added to the inner subscriptions list. This Subscription can be used with\n     * `remove()` to remove the passed teardown logic from the inner subscriptions\n     * list.\n     */\n    Subscription.prototype.add = function (teardown) {\n        if (!teardown || teardown === Subscription.EMPTY) {\n            return Subscription.EMPTY;\n        }\n        if (teardown === this) {\n            return this;\n        }\n        var subscription = teardown;\n        switch (typeof teardown === 'undefined' ? 'undefined' : _typeof(teardown)) {\n            case 'function':\n                subscription = new Subscription(teardown);\n            case 'object':\n                if (subscription.closed || typeof subscription.unsubscribe !== 'function') {\n                    return subscription;\n                } else if (this.closed) {\n                    subscription.unsubscribe();\n                    return subscription;\n                } else if (typeof subscription._addParent !== 'function' /* quack quack */) {\n                        var tmp = subscription;\n                        subscription = new Subscription();\n                        subscription._subscriptions = [tmp];\n                    }\n                break;\n            default:\n                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');\n        }\n        var subscriptions = this._subscriptions || (this._subscriptions = []);\n        subscriptions.push(subscription);\n        subscription._addParent(this);\n        return subscription;\n    };\n    /**\n     * Removes a Subscription from the internal list of subscriptions that will\n     * unsubscribe during the unsubscribe process of this Subscription.\n     * @param {Subscription} subscription The subscription to remove.\n     * @return {void}\n     */\n    Subscription.prototype.remove = function (subscription) {\n        var subscriptions = this._subscriptions;\n        if (subscriptions) {\n            var subscriptionIndex = subscriptions.indexOf(subscription);\n            if (subscriptionIndex !== -1) {\n                subscriptions.splice(subscriptionIndex, 1);\n            }\n        }\n    };\n    Subscription.prototype._addParent = function (parent) {\n        var _a = this,\n            _parent = _a._parent,\n            _parents = _a._parents;\n        if (!_parent || _parent === parent) {\n            // If we don't have a parent, or the new parent is the same as the\n            // current parent, then set this._parent to the new parent.\n            this._parent = parent;\n        } else if (!_parents) {\n            // If there's already one parent, but not multiple, allocate an Array to\n            // store the rest of the parent Subscriptions.\n            this._parents = [parent];\n        } else if (_parents.indexOf(parent) === -1) {\n            // Only add the new parent to the _parents list if it's not already there.\n            _parents.push(parent);\n        }\n    };\n    Subscription.EMPTY = function (empty) {\n        empty.closed = true;\n        return empty;\n    }(new Subscription());\n    return Subscription;\n}();\nexports.Subscription = Subscription;\nfunction flattenUnsubscriptionErrors(errors) {\n    return errors.reduce(function (errs, err) {\n        return errs.concat(err instanceof UnsubscriptionError_1.UnsubscriptionError ? err.errors : err);\n    }, []);\n}\n//# sourceMappingURL=Subscription.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/Subscription.js\n// module id = 6\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/Subscription.js?");

/***/ }),
/* 7 */
/*!*********************************************************!*\
  !*** ./node_modules/rxjs/observable/ArrayObservable.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ../Observable */ 0);\nvar ScalarObservable_1 = __webpack_require__(/*! ./ScalarObservable */ 46);\nvar EmptyObservable_1 = __webpack_require__(/*! ./EmptyObservable */ 47);\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ 9);\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar ArrayObservable = function (_super) {\n    __extends(ArrayObservable, _super);\n    function ArrayObservable(array, scheduler) {\n        _super.call(this);\n        this.array = array;\n        this.scheduler = scheduler;\n        if (!scheduler && array.length === 1) {\n            this._isScalar = true;\n            this.value = array[0];\n        }\n    }\n    ArrayObservable.create = function (array, scheduler) {\n        return new ArrayObservable(array, scheduler);\n    };\n    /**\n     * Creates an Observable that emits some values you specify as arguments,\n     * immediately one after the other, and then emits a complete notification.\n     *\n     * <span class=\"informal\">Emits the arguments you provide, then completes.\n     * </span>\n     *\n     * <img src=\"./img/of.png\" width=\"100%\">\n     *\n     * This static operator is useful for creating a simple Observable that only\n     * emits the arguments given, and the complete notification thereafter. It can\n     * be used for composing with other Observables, such as with {@link concat}.\n     * By default, it uses a `null` IScheduler, which means the `next`\n     * notifications are sent synchronously, although with a different IScheduler\n     * it is possible to determine when those notifications will be delivered.\n     *\n     * @example <caption>Emit 10, 20, 30, then 'a', 'b', 'c', then start ticking every second.</caption>\n     * var numbers = Rx.Observable.of(10, 20, 30);\n     * var letters = Rx.Observable.of('a', 'b', 'c');\n     * var interval = Rx.Observable.interval(1000);\n     * var result = numbers.concat(letters).concat(interval);\n     * result.subscribe(x => console.log(x));\n     *\n     * @see {@link create}\n     * @see {@link empty}\n     * @see {@link never}\n     * @see {@link throw}\n     *\n     * @param {...T} values Arguments that represent `next` values to be emitted.\n     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling\n     * the emissions of the `next` notifications.\n     * @return {Observable<T>} An Observable that emits each given input value.\n     * @static true\n     * @name of\n     * @owner Observable\n     */\n    ArrayObservable.of = function () {\n        var array = [];\n        for (var _i = 0; _i < arguments.length; _i++) {\n            array[_i - 0] = arguments[_i];\n        }\n        var scheduler = array[array.length - 1];\n        if (isScheduler_1.isScheduler(scheduler)) {\n            array.pop();\n        } else {\n            scheduler = null;\n        }\n        var len = array.length;\n        if (len > 1) {\n            return new ArrayObservable(array, scheduler);\n        } else if (len === 1) {\n            return new ScalarObservable_1.ScalarObservable(array[0], scheduler);\n        } else {\n            return new EmptyObservable_1.EmptyObservable(scheduler);\n        }\n    };\n    ArrayObservable.dispatch = function (state) {\n        var array = state.array,\n            index = state.index,\n            count = state.count,\n            subscriber = state.subscriber;\n        if (index >= count) {\n            subscriber.complete();\n            return;\n        }\n        subscriber.next(array[index]);\n        if (subscriber.closed) {\n            return;\n        }\n        state.index = index + 1;\n        this.schedule(state);\n    };\n    ArrayObservable.prototype._subscribe = function (subscriber) {\n        var index = 0;\n        var array = this.array;\n        var count = array.length;\n        var scheduler = this.scheduler;\n        if (scheduler) {\n            return scheduler.schedule(ArrayObservable.dispatch, 0, {\n                array: array, index: index, count: count, subscriber: subscriber\n            });\n        } else {\n            for (var i = 0; i < count && !subscriber.closed; i++) {\n                subscriber.next(array[i]);\n            }\n            subscriber.complete();\n        }\n    };\n    return ArrayObservable;\n}(Observable_1.Observable);\nexports.ArrayObservable = ArrayObservable;\n//# sourceMappingURL=ArrayObservable.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/observable/ArrayObservable.js\n// module id = 7\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/ArrayObservable.js?");

/***/ }),
/* 8 */,
/* 9 */
/*!***********************************************!*\
  !*** ./node_modules/rxjs/util/isScheduler.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction isScheduler(value) {\n    return value && typeof value.schedule === 'function';\n}\nexports.isScheduler = isScheduler;\n//# sourceMappingURL=isScheduler.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/isScheduler.js\n// module id = 9\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isScheduler.js?");

/***/ }),
/* 10 */
/*!*********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_arity.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _arity(n, fn) {\n  /* eslint-disable no-unused-vars */\n  switch (n) {\n    case 0:\n      return function () {\n        return fn.apply(this, arguments);\n      };\n    case 1:\n      return function (a0) {\n        return fn.apply(this, arguments);\n      };\n    case 2:\n      return function (a0, a1) {\n        return fn.apply(this, arguments);\n      };\n    case 3:\n      return function (a0, a1, a2) {\n        return fn.apply(this, arguments);\n      };\n    case 4:\n      return function (a0, a1, a2, a3) {\n        return fn.apply(this, arguments);\n      };\n    case 5:\n      return function (a0, a1, a2, a3, a4) {\n        return fn.apply(this, arguments);\n      };\n    case 6:\n      return function (a0, a1, a2, a3, a4, a5) {\n        return fn.apply(this, arguments);\n      };\n    case 7:\n      return function (a0, a1, a2, a3, a4, a5, a6) {\n        return fn.apply(this, arguments);\n      };\n    case 8:\n      return function (a0, a1, a2, a3, a4, a5, a6, a7) {\n        return fn.apply(this, arguments);\n      };\n    case 9:\n      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {\n        return fn.apply(this, arguments);\n      };\n    case 10:\n      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {\n        return fn.apply(this, arguments);\n      };\n    default:\n      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');\n  }\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_arity.js\n// module id = 10\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_arity.js?");

/***/ }),
/* 11 */
/*!*****************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_isPlaceholder.js ***!
  \*****************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _isPlaceholder(a) {\n       return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_isPlaceholder.js\n// module id = 11\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_isPlaceholder.js?");

/***/ }),
/* 12 */
/*!*******************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_has.js ***!
  \*******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _has(prop, obj) {\n  return Object.prototype.hasOwnProperty.call(obj, prop);\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_has.js\n// module id = 12\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_has.js?");

/***/ }),
/* 13 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/OuterSubscriber.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ./Subscriber */ 3);\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar OuterSubscriber = function (_super) {\n    __extends(OuterSubscriber, _super);\n    function OuterSubscriber() {\n        _super.apply(this, arguments);\n    }\n    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        this.destination.next(innerValue);\n    };\n    OuterSubscriber.prototype.notifyError = function (error, innerSub) {\n        this.destination.error(error);\n    };\n    OuterSubscriber.prototype.notifyComplete = function (innerSub) {\n        this.destination.complete();\n    };\n    return OuterSubscriber;\n}(Subscriber_1.Subscriber);\nexports.OuterSubscriber = OuterSubscriber;\n//# sourceMappingURL=OuterSubscriber.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/OuterSubscriber.js\n// module id = 13\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/OuterSubscriber.js?");

/***/ }),
/* 14 */
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/util/subscribeToResult.js ***!
  \*****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar root_1 = __webpack_require__(/*! ./root */ 5);\nvar isArrayLike_1 = __webpack_require__(/*! ./isArrayLike */ 105);\nvar isPromise_1 = __webpack_require__(/*! ./isPromise */ 106);\nvar isObject_1 = __webpack_require__(/*! ./isObject */ 39);\nvar Observable_1 = __webpack_require__(/*! ../Observable */ 0);\nvar iterator_1 = __webpack_require__(/*! ../symbol/iterator */ 107);\nvar InnerSubscriber_1 = __webpack_require__(/*! ../InnerSubscriber */ 108);\nvar observable_1 = __webpack_require__(/*! ../symbol/observable */ 42);\nfunction subscribeToResult(outerSubscriber, result, outerValue, outerIndex) {\n    var destination = new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex);\n    if (destination.closed) {\n        return null;\n    }\n    if (result instanceof Observable_1.Observable) {\n        if (result._isScalar) {\n            destination.next(result.value);\n            destination.complete();\n            return null;\n        } else {\n            return result.subscribe(destination);\n        }\n    } else if (isArrayLike_1.isArrayLike(result)) {\n        for (var i = 0, len = result.length; i < len && !destination.closed; i++) {\n            destination.next(result[i]);\n        }\n        if (!destination.closed) {\n            destination.complete();\n        }\n    } else if (isPromise_1.isPromise(result)) {\n        result.then(function (value) {\n            if (!destination.closed) {\n                destination.next(value);\n                destination.complete();\n            }\n        }, function (err) {\n            return destination.error(err);\n        }).then(null, function (err) {\n            // Escaping the Promise trap: globally throw unhandled errors\n            root_1.root.setTimeout(function () {\n                throw err;\n            });\n        });\n        return destination;\n    } else if (result && typeof result[iterator_1.iterator] === 'function') {\n        var iterator = result[iterator_1.iterator]();\n        do {\n            var item = iterator.next();\n            if (item.done) {\n                destination.complete();\n                break;\n            }\n            destination.next(item.value);\n            if (destination.closed) {\n                break;\n            }\n        } while (true);\n    } else if (result && typeof result[observable_1.observable] === 'function') {\n        var obs = result[observable_1.observable]();\n        if (typeof obs.subscribe !== 'function') {\n            destination.error(new TypeError('Provided object does not correctly implement Symbol.observable'));\n        } else {\n            return obs.subscribe(new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex));\n        }\n    } else {\n        var value = isObject_1.isObject(result) ? 'an invalid object' : \"'\" + result + \"'\";\n        var msg = \"You provided \" + value + \" where a stream was expected.\" + ' You can provide an Observable, Promise, Array, or Iterable.';\n        destination.error(new TypeError(msg));\n    }\n    return null;\n}\nexports.subscribeToResult = subscribeToResult;\n//# sourceMappingURL=subscribeToResult.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/subscribeToResult.js\n// module id = 14\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/subscribeToResult.js?");

/***/ }),
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_reduce.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _xwrap = __webpack_require__(/*! ./_xwrap */ 53);\nvar bind = __webpack_require__(/*! ../bind */ 54);\nvar isArrayLike = __webpack_require__(/*! ../isArrayLike */ 55);\n\nmodule.exports = function () {\n  function _arrayReduce(xf, acc, list) {\n    var idx = 0;\n    var len = list.length;\n    while (idx < len) {\n      acc = xf['@@transducer/step'](acc, list[idx]);\n      if (acc && acc['@@transducer/reduced']) {\n        acc = acc['@@transducer/value'];\n        break;\n      }\n      idx += 1;\n    }\n    return xf['@@transducer/result'](acc);\n  }\n\n  function _iterableReduce(xf, acc, iter) {\n    var step = iter.next();\n    while (!step.done) {\n      acc = xf['@@transducer/step'](acc, step.value);\n      if (acc && acc['@@transducer/reduced']) {\n        acc = acc['@@transducer/value'];\n        break;\n      }\n      step = iter.next();\n    }\n    return xf['@@transducer/result'](acc);\n  }\n\n  function _methodReduce(xf, acc, obj) {\n    return xf['@@transducer/result'](obj.reduce(bind(xf['@@transducer/step'], xf), acc));\n  }\n\n  var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';\n  return function _reduce(fn, acc, list) {\n    if (typeof fn === 'function') {\n      fn = _xwrap(fn);\n    }\n    if (isArrayLike(list)) {\n      return _arrayReduce(fn, acc, list);\n    }\n    if (typeof list.reduce === 'function') {\n      return _methodReduce(fn, acc, list);\n    }\n    if (list[symIterator] != null) {\n      return _iterableReduce(fn, acc, list[symIterator]());\n    }\n    if (typeof list.next === 'function') {\n      return _iterableReduce(fn, acc, list);\n    }\n    throw new TypeError('reduce: list must be array or iterable');\n  };\n}();\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_reduce.js\n// module id = 20\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_reduce.js?");

/***/ }),
/* 21 */
/*!***********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_isArray.js ***!
  \***********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("/**\n * Tests whether or not an object is an array.\n *\n * @private\n * @param {*} val The object to test.\n * @return {Boolean} `true` if `val` is an array, `false` otherwise.\n * @example\n *\n *      _isArray([]); //=> true\n *      _isArray(null); //=> false\n *      _isArray({}); //=> false\n */\nmodule.exports = Array.isArray || function _isArray(val) {\n  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_isArray.js\n// module id = 21\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_isArray.js?");

/***/ }),
/* 22 */
/*!************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_isString.js ***!
  \************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _isString(x) {\n  return Object.prototype.toString.call(x) === '[object String]';\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_isString.js\n// module id = 22\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_isString.js?");

/***/ }),
/* 23 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/keys.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\nvar _has = __webpack_require__(/*! ./internal/_has */ 12);\nvar _isArguments = __webpack_require__(/*! ./internal/_isArguments */ 66);\n\n/**\n * Returns a list containing the names of all the enumerable own properties of\n * the supplied object.\n * Note that the order of the output array is not guaranteed to be consistent\n * across different JS platforms.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category Object\n * @sig {k: v} -> [k]\n * @param {Object} obj The object to extract properties from\n * @return {Array} An array of the object's own properties.\n * @example\n *\n *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']\n */\nmodule.exports = function () {\n  // cover IE < 9 keys issues\n  var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');\n  var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];\n  // Safari bug\n  var hasArgsEnumBug = function () {\n    'use strict';\n\n    return arguments.propertyIsEnumerable('length');\n  }();\n\n  var contains = function contains(list, item) {\n    var idx = 0;\n    while (idx < list.length) {\n      if (list[idx] === item) {\n        return true;\n      }\n      idx += 1;\n    }\n    return false;\n  };\n\n  return typeof Object.keys === 'function' && !hasArgsEnumBug ? _curry1(function keys(obj) {\n    return Object(obj) !== obj ? [] : Object.keys(obj);\n  }) : _curry1(function keys(obj) {\n    if (Object(obj) !== obj) {\n      return [];\n    }\n    var prop, nIdx;\n    var ks = [];\n    var checkArgsLength = hasArgsEnumBug && _isArguments(obj);\n    for (prop in obj) {\n      if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {\n        ks[ks.length] = prop;\n      }\n    }\n    if (hasEnumBug) {\n      nIdx = nonEnumerableProps.length - 1;\n      while (nIdx >= 0) {\n        prop = nonEnumerableProps[nIdx];\n        if (_has(prop, obj) && !contains(ks, prop)) {\n          ks[ks.length] = prop;\n        }\n        nIdx -= 1;\n      }\n    }\n    return ks;\n  });\n}();\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/keys.js\n// module id = 23\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/keys.js?");

/***/ }),
/* 24 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/lens.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\nvar map = __webpack_require__(/*! ./map */ 35);\n\n/**\n * Returns a lens for the given getter and setter functions. The getter \"gets\"\n * the value of the focus; the setter \"sets\" the value of the focus. The setter\n * should not mutate the data structure.\n *\n * @func\n * @memberOf R\n * @since v0.8.0\n * @category Object\n * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s\n * @sig (s -> a) -> ((a, s) -> s) -> Lens s a\n * @param {Function} getter\n * @param {Function} setter\n * @return {Lens}\n * @see R.view, R.set, R.over, R.lensIndex, R.lensProp\n * @example\n *\n *      var xLens = R.lens(R.prop('x'), R.assoc('x'));\n *\n *      R.view(xLens, {x: 1, y: 2});            //=> 1\n *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}\n *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}\n */\nmodule.exports = _curry2(function lens(getter, setter) {\n  return function (toFunctorFn) {\n    return function (target) {\n      return map(function (focus) {\n        return setter(focus, target);\n      }, toFunctorFn(getter(target)));\n    };\n  };\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/lens.js\n// module id = 24\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/lens.js?");

/***/ }),
/* 25 */
/*!*******************************************!*\
  !*** ./node_modules/rxjs/util/isArray.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nexports.isArray = Array.isArray || function (x) {\n  return x && typeof x.length === 'number';\n};\n//# sourceMappingURL=isArray.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/isArray.js\n// module id = 25\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isArray.js?");

/***/ }),
/* 26 */
/*!***********************************************!*\
  !*** ./node_modules/rxjs/util/errorObject.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n// typeof any so that it we don't have to cast when comparing a result to the error object\n\nexports.errorObject = { e: {} };\n//# sourceMappingURL=errorObject.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/errorObject.js\n// module id = 26\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/errorObject.js?");

/***/ }),
/* 27 */
/*!**************************************************!*\
  !*** ./node_modules/rxjs/symbol/rxSubscriber.js ***!
  \**************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar root_1 = __webpack_require__(/*! ../util/root */ 5);\nvar _Symbol = root_1.root.Symbol;\nexports.rxSubscriber = typeof _Symbol === 'function' && typeof _Symbol.for === 'function' ? _Symbol.for('rxSubscriber') : '@@rxSubscriber';\n/**\n * @deprecated use rxSubscriber instead\n */\nexports.$$rxSubscriber = exports.rxSubscriber;\n//# sourceMappingURL=rxSubscriber.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/symbol/rxSubscriber.js\n// module id = 27\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/symbol/rxSubscriber.js?");

/***/ }),
/* 28 */
/*!**************************************!*\
  !*** ./node_modules/rxjs/Subject.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ./Observable */ 0);\nvar Subscriber_1 = __webpack_require__(/*! ./Subscriber */ 3);\nvar Subscription_1 = __webpack_require__(/*! ./Subscription */ 6);\nvar ObjectUnsubscribedError_1 = __webpack_require__(/*! ./util/ObjectUnsubscribedError */ 43);\nvar SubjectSubscription_1 = __webpack_require__(/*! ./SubjectSubscription */ 44);\nvar rxSubscriber_1 = __webpack_require__(/*! ./symbol/rxSubscriber */ 27);\n/**\n * @class SubjectSubscriber<T>\n */\nvar SubjectSubscriber = function (_super) {\n    __extends(SubjectSubscriber, _super);\n    function SubjectSubscriber(destination) {\n        _super.call(this, destination);\n        this.destination = destination;\n    }\n    return SubjectSubscriber;\n}(Subscriber_1.Subscriber);\nexports.SubjectSubscriber = SubjectSubscriber;\n/**\n * @class Subject<T>\n */\nvar Subject = function (_super) {\n    __extends(Subject, _super);\n    function Subject() {\n        _super.call(this);\n        this.observers = [];\n        this.closed = false;\n        this.isStopped = false;\n        this.hasError = false;\n        this.thrownError = null;\n    }\n    Subject.prototype[rxSubscriber_1.rxSubscriber] = function () {\n        return new SubjectSubscriber(this);\n    };\n    Subject.prototype.lift = function (operator) {\n        var subject = new AnonymousSubject(this, this);\n        subject.operator = operator;\n        return subject;\n    };\n    Subject.prototype.next = function (value) {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        }\n        if (!this.isStopped) {\n            var observers = this.observers;\n            var len = observers.length;\n            var copy = observers.slice();\n            for (var i = 0; i < len; i++) {\n                copy[i].next(value);\n            }\n        }\n    };\n    Subject.prototype.error = function (err) {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        }\n        this.hasError = true;\n        this.thrownError = err;\n        this.isStopped = true;\n        var observers = this.observers;\n        var len = observers.length;\n        var copy = observers.slice();\n        for (var i = 0; i < len; i++) {\n            copy[i].error(err);\n        }\n        this.observers.length = 0;\n    };\n    Subject.prototype.complete = function () {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        }\n        this.isStopped = true;\n        var observers = this.observers;\n        var len = observers.length;\n        var copy = observers.slice();\n        for (var i = 0; i < len; i++) {\n            copy[i].complete();\n        }\n        this.observers.length = 0;\n    };\n    Subject.prototype.unsubscribe = function () {\n        this.isStopped = true;\n        this.closed = true;\n        this.observers = null;\n    };\n    Subject.prototype._trySubscribe = function (subscriber) {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        } else {\n            return _super.prototype._trySubscribe.call(this, subscriber);\n        }\n    };\n    Subject.prototype._subscribe = function (subscriber) {\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        } else if (this.hasError) {\n            subscriber.error(this.thrownError);\n            return Subscription_1.Subscription.EMPTY;\n        } else if (this.isStopped) {\n            subscriber.complete();\n            return Subscription_1.Subscription.EMPTY;\n        } else {\n            this.observers.push(subscriber);\n            return new SubjectSubscription_1.SubjectSubscription(this, subscriber);\n        }\n    };\n    Subject.prototype.asObservable = function () {\n        var observable = new Observable_1.Observable();\n        observable.source = this;\n        return observable;\n    };\n    Subject.create = function (destination, source) {\n        return new AnonymousSubject(destination, source);\n    };\n    return Subject;\n}(Observable_1.Observable);\nexports.Subject = Subject;\n/**\n * @class AnonymousSubject<T>\n */\nvar AnonymousSubject = function (_super) {\n    __extends(AnonymousSubject, _super);\n    function AnonymousSubject(destination, source) {\n        _super.call(this);\n        this.destination = destination;\n        this.source = source;\n    }\n    AnonymousSubject.prototype.next = function (value) {\n        var destination = this.destination;\n        if (destination && destination.next) {\n            destination.next(value);\n        }\n    };\n    AnonymousSubject.prototype.error = function (err) {\n        var destination = this.destination;\n        if (destination && destination.error) {\n            this.destination.error(err);\n        }\n    };\n    AnonymousSubject.prototype.complete = function () {\n        var destination = this.destination;\n        if (destination && destination.complete) {\n            this.destination.complete();\n        }\n    };\n    AnonymousSubject.prototype._subscribe = function (subscriber) {\n        var source = this.source;\n        if (source) {\n            return this.source.subscribe(subscriber);\n        } else {\n            return Subscription_1.Subscription.EMPTY;\n        }\n    };\n    return AnonymousSubject;\n}(Subject);\nexports.AnonymousSubject = AnonymousSubject;\n//# sourceMappingURL=Subject.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/Subject.js\n// module id = 28\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/Subject.js?");

/***/ }),
/* 29 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/pipe.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _arity = __webpack_require__(/*! ./internal/_arity */ 10);\nvar _pipe = __webpack_require__(/*! ./internal/_pipe */ 52);\nvar reduce = __webpack_require__(/*! ./reduce */ 30);\nvar tail = __webpack_require__(/*! ./tail */ 56);\n\n/**\n * Performs left-to-right function composition. The leftmost function may have\n * any arity; the remaining functions must be unary.\n *\n * In some libraries this function is named `sequence`.\n *\n * **Note:** The result of pipe is not automatically curried.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category Function\n * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)\n * @param {...Function} functions\n * @return {Function}\n * @see R.compose\n * @example\n *\n *      var f = R.pipe(Math.pow, R.negate, R.inc);\n *\n *      f(3, 4); // -(3^4) + 1\n * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))\n */\nmodule.exports = function pipe() {\n  if (arguments.length === 0) {\n    throw new Error('pipe requires at least one argument');\n  }\n  return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/pipe.js\n// module id = 29\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/pipe.js?");

/***/ }),
/* 30 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/reduce.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry3 = __webpack_require__(/*! ./internal/_curry3 */ 4);\nvar _reduce = __webpack_require__(/*! ./internal/_reduce */ 20);\n\n/**\n * Returns a single item by iterating through the list, successively calling\n * the iterator function and passing it an accumulator value and the current\n * value from the array, and then passing the result to the next call.\n *\n * The iterator function receives two values: *(acc, value)*. It may use\n * `R.reduced` to shortcut the iteration.\n *\n * The arguments' order of `reduceRight`'s iterator function is *(value, acc)*.\n *\n * Note: `R.reduce` does not skip deleted or unassigned indices (sparse\n * arrays), unlike the native `Array.prototype.reduce` method. For more details\n * on this behavior, see:\n * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description\n *\n * Dispatches to the `reduce` method of the third argument, if present.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category List\n * @sig ((a, b) -> a) -> a -> [b] -> a\n * @param {Function} fn The iterator function. Receives two values, the accumulator and the\n *        current element from the array.\n * @param {*} acc The accumulator value.\n * @param {Array} list The list to iterate over.\n * @return {*} The final, accumulated value.\n * @see R.reduced, R.addIndex, R.reduceRight\n * @example\n *\n *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10\n *                -               -10\n *               / \\              / \\\n *              -   4           -6   4\n *             / \\              / \\\n *            -   3   ==>     -3   3\n *           / \\              / \\\n *          -   2           -1   2\n *         / \\              / \\\n *        0   1            0   1\n *\n * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)\n */\nmodule.exports = _curry3(_reduce);\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/reduce.js\n// module id = 30\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/reduce.js?");

/***/ }),
/* 31 */
/*!******************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_checkForMethod.js ***!
  \******************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _isArray = __webpack_require__(/*! ./_isArray */ 21);\n\n/**\n * This checks whether a function has a [methodname] function. If it isn't an\n * array it will execute that function otherwise it will default to the ramda\n * implementation.\n *\n * @private\n * @param {Function} fn ramda implemtation\n * @param {String} methodname property to check for a custom implementation\n * @return {Object} Whatever the return value of the method is.\n */\nmodule.exports = function _checkForMethod(methodname, fn) {\n  return function () {\n    var length = arguments.length;\n    if (length === 0) {\n      return fn();\n    }\n    var obj = arguments[length - 1];\n    return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));\n  };\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_checkForMethod.js\n// module id = 31\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_checkForMethod.js?");

/***/ }),
/* 32 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/curryN.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _arity = __webpack_require__(/*! ./internal/_arity */ 10);\nvar _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\nvar _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\nvar _curryN = __webpack_require__(/*! ./internal/_curryN */ 60);\n\n/**\n * Returns a curried equivalent of the provided function, with the specified\n * arity. The curried function has two unusual capabilities. First, its\n * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the\n * following are equivalent:\n *\n *   - `g(1)(2)(3)`\n *   - `g(1)(2, 3)`\n *   - `g(1, 2)(3)`\n *   - `g(1, 2, 3)`\n *\n * Secondly, the special placeholder value `R.__` may be used to specify\n * \"gaps\", allowing partial application of any combination of arguments,\n * regardless of their positions. If `g` is as above and `_` is `R.__`, the\n * following are equivalent:\n *\n *   - `g(1, 2, 3)`\n *   - `g(_, 2, 3)(1)`\n *   - `g(_, _, 3)(1)(2)`\n *   - `g(_, _, 3)(1, 2)`\n *   - `g(_, 2)(1)(3)`\n *   - `g(_, 2)(1, 3)`\n *   - `g(_, 2)(_, 3)(1)`\n *\n * @func\n * @memberOf R\n * @since v0.5.0\n * @category Function\n * @sig Number -> (* -> a) -> (* -> a)\n * @param {Number} length The arity for the returned function.\n * @param {Function} fn The function to curry.\n * @return {Function} A new, curried function.\n * @see R.curry\n * @example\n *\n *      var sumArgs = (...args) => R.sum(args);\n *\n *      var curriedAddFourNumbers = R.curryN(4, sumArgs);\n *      var f = curriedAddFourNumbers(1, 2);\n *      var g = f(3);\n *      g(4); //=> 10\n */\nmodule.exports = _curry2(function curryN(length, fn) {\n  if (length === 1) {\n    return _curry1(fn);\n  }\n  return _arity(length, _curryN(length, [], fn));\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/curryN.js\n// module id = 32\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/curryN.js?");

/***/ }),
/* 33 */
/*!****************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_dispatchable.js ***!
  \****************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _isArray = __webpack_require__(/*! ./_isArray */ 21);\nvar _isTransformer = __webpack_require__(/*! ./_isTransformer */ 69);\n\n/**\n * Returns a function that dispatches with different strategies based on the\n * object in list position (last argument). If it is an array, executes [fn].\n * Otherwise, if it has a function with one of the given method names, it will\n * execute that function (functor case). Otherwise, if it is a transformer,\n * uses transducer [xf] to return a new transformer (transducer case).\n * Otherwise, it will default to executing [fn].\n *\n * @private\n * @param {Array} methodNames properties to check for a custom implementation\n * @param {Function} xf transducer to initialize if object is transformer\n * @param {Function} fn default ramda implementation\n * @return {Function} A function that dispatches on object in list position\n */\nmodule.exports = function _dispatchable(methodNames, xf, fn) {\n  return function () {\n    if (arguments.length === 0) {\n      return fn();\n    }\n    var args = Array.prototype.slice.call(arguments, 0);\n    var obj = args.pop();\n    if (!_isArray(obj)) {\n      var idx = 0;\n      while (idx < methodNames.length) {\n        if (typeof obj[methodNames[idx]] === 'function') {\n          return obj[methodNames[idx]].apply(obj, args);\n        }\n        idx += 1;\n      }\n      if (_isTransformer(obj)) {\n        var transducer = xf.apply(null, args);\n        return transducer(obj);\n      }\n    }\n    return fn.apply(this, arguments);\n  };\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_dispatchable.js\n// module id = 33\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_dispatchable.js?");

/***/ }),
/* 34 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_xfBase.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = {\n  init: function () {\n    return this.xf['@@transducer/init']();\n  },\n  result: function (result) {\n    return this.xf['@@transducer/result'](result);\n  }\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_xfBase.js\n// module id = 34\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_xfBase.js?");

/***/ }),
/* 35 */
/*!*********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/map.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\nvar _dispatchable = __webpack_require__(/*! ./internal/_dispatchable */ 33);\nvar _map = __webpack_require__(/*! ./internal/_map */ 73);\nvar _reduce = __webpack_require__(/*! ./internal/_reduce */ 20);\nvar _xmap = __webpack_require__(/*! ./internal/_xmap */ 74);\nvar curryN = __webpack_require__(/*! ./curryN */ 32);\nvar keys = __webpack_require__(/*! ./keys */ 23);\n\n/**\n * Takes a function and\n * a [functor](https://github.com/fantasyland/fantasy-land#functor),\n * applies the function to each of the functor's values, and returns\n * a functor of the same shape.\n *\n * Ramda provides suitable `map` implementations for `Array` and `Object`,\n * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.\n *\n * Dispatches to the `map` method of the second argument, if present.\n *\n * Acts as a transducer if a transformer is given in list position.\n *\n * Also treats functions as functors and will compose them together.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category List\n * @sig Functor f => (a -> b) -> f a -> f b\n * @param {Function} fn The function to be called on every element of the input `list`.\n * @param {Array} list The list to be iterated over.\n * @return {Array} The new list.\n * @see R.transduce, R.addIndex\n * @example\n *\n *      var double = x => x * 2;\n *\n *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]\n *\n *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}\n * @symb R.map(f, [a, b]) = [f(a), f(b)]\n * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }\n * @symb R.map(f, functor_o) = functor_o.map(f)\n */\nmodule.exports = _curry2(_dispatchable(['map'], _xmap, function map(fn, functor) {\n  switch (Object.prototype.toString.call(functor)) {\n    case '[object Function]':\n      return curryN(functor.length, function () {\n        return fn.call(this, functor.apply(this, arguments));\n      });\n    case '[object Object]':\n      return _reduce(function (acc, key) {\n        acc[key] = fn(functor[key]);\n        return acc;\n      }, {}, keys(functor));\n    default:\n      return _map(fn, functor);\n  }\n}));\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/map.js\n// module id = 35\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/map.js?");

/***/ }),
/* 36 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/always.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\n\n/**\n * Returns a function that always returns the given value. Note that for\n * non-primitives the value returned is a reference to the original value.\n *\n * This function is known as `const`, `constant`, or `K` (for K combinator) in\n * other languages and libraries.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category Function\n * @sig a -> (* -> a)\n * @param {*} val The value to wrap in a function\n * @return {Function} A Function :: * -> val.\n * @example\n *\n *      var t = R.always('Tee');\n *      t(); //=> 'Tee'\n */\nmodule.exports = _curry1(function always(val) {\n  return function () {\n    return val;\n  };\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/always.js\n// module id = 36\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/always.js?");

/***/ }),
/* 37 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/over.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry3 = __webpack_require__(/*! ./internal/_curry3 */ 4);\n\n/**\n * Returns the result of \"setting\" the portion of the given data structure\n * focused by the given lens to the result of applying the given function to\n * the focused value.\n *\n * @func\n * @memberOf R\n * @since v0.16.0\n * @category Object\n * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s\n * @sig Lens s a -> (a -> a) -> s -> s\n * @param {Lens} lens\n * @param {*} v\n * @param {*} x\n * @return {*}\n * @see R.prop, R.lensIndex, R.lensProp\n * @example\n *\n *      var headLens = R.lensIndex(0);\n *\n *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']\n */\nmodule.exports = function () {\n  // `Identity` is a functor that holds a single value, where `map` simply\n  // transforms the held value with the provided function.\n  var Identity = function (x) {\n    return { value: x, map: function (f) {\n        return Identity(f(x));\n      } };\n  };\n\n  return _curry3(function over(lens, f, x) {\n    // The value returned by the getter function is first transformed with `f`,\n    // then set as the value of an `Identity`. This is then mapped over with the\n    // setter function of the lens.\n    return lens(function (y) {\n      return Identity(f(y));\n    })(x).value;\n  });\n}();\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/over.js\n// module id = 37\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/over.js?");

/***/ }),
/* 38 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/util/isFunction.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction isFunction(x) {\n    return typeof x === 'function';\n}\nexports.isFunction = isFunction;\n//# sourceMappingURL=isFunction.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/isFunction.js\n// module id = 38\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isFunction.js?");

/***/ }),
/* 39 */
/*!********************************************!*\
  !*** ./node_modules/rxjs/util/isObject.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\nfunction isObject(x) {\n    return x != null && (typeof x === \"undefined\" ? \"undefined\" : _typeof(x)) === 'object';\n}\nexports.isObject = isObject;\n//# sourceMappingURL=isObject.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/isObject.js\n// module id = 39\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isObject.js?");

/***/ }),
/* 40 */
/*!********************************************!*\
  !*** ./node_modules/rxjs/util/tryCatch.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar errorObject_1 = __webpack_require__(/*! ./errorObject */ 26);\nvar tryCatchTarget;\nfunction tryCatcher() {\n    try {\n        return tryCatchTarget.apply(this, arguments);\n    } catch (e) {\n        errorObject_1.errorObject.e = e;\n        return errorObject_1.errorObject;\n    }\n}\nfunction tryCatch(fn) {\n    tryCatchTarget = fn;\n    return tryCatcher;\n}\nexports.tryCatch = tryCatch;\n;\n//# sourceMappingURL=tryCatch.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/tryCatch.js\n// module id = 40\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/tryCatch.js?");

/***/ }),
/* 41 */
/*!***************************************!*\
  !*** ./node_modules/rxjs/Observer.js ***!
  \***************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nexports.empty = {\n    closed: true,\n    next: function next(value) {},\n    error: function error(err) {\n        throw err;\n    },\n    complete: function complete() {}\n};\n//# sourceMappingURL=Observer.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/Observer.js\n// module id = 41\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/Observer.js?");

/***/ }),
/* 42 */
/*!************************************************!*\
  !*** ./node_modules/rxjs/symbol/observable.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar root_1 = __webpack_require__(/*! ../util/root */ 5);\nfunction getSymbolObservable(context) {\n    var $$observable;\n    var _Symbol = context.Symbol;\n    if (typeof _Symbol === 'function') {\n        if (_Symbol.observable) {\n            $$observable = _Symbol.observable;\n        } else {\n            $$observable = _Symbol('observable');\n            _Symbol.observable = $$observable;\n        }\n    } else {\n        $$observable = '@@observable';\n    }\n    return $$observable;\n}\nexports.getSymbolObservable = getSymbolObservable;\nexports.observable = getSymbolObservable(root_1.root);\n/**\n * @deprecated use observable instead\n */\nexports.$$observable = exports.observable;\n//# sourceMappingURL=observable.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/symbol/observable.js\n// module id = 42\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/symbol/observable.js?");

/***/ }),
/* 43 */
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/util/ObjectUnsubscribedError.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\n/**\n * An error thrown when an action is invalid because the object has been\n * unsubscribed.\n *\n * @see {@link Subject}\n * @see {@link BehaviorSubject}\n *\n * @class ObjectUnsubscribedError\n */\nvar ObjectUnsubscribedError = function (_super) {\n    __extends(ObjectUnsubscribedError, _super);\n    function ObjectUnsubscribedError() {\n        var err = _super.call(this, 'object unsubscribed');\n        this.name = err.name = 'ObjectUnsubscribedError';\n        this.stack = err.stack;\n        this.message = err.message;\n    }\n    return ObjectUnsubscribedError;\n}(Error);\nexports.ObjectUnsubscribedError = ObjectUnsubscribedError;\n//# sourceMappingURL=ObjectUnsubscribedError.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/ObjectUnsubscribedError.js\n// module id = 43\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/ObjectUnsubscribedError.js?");

/***/ }),
/* 44 */
/*!**************************************************!*\
  !*** ./node_modules/rxjs/SubjectSubscription.js ***!
  \**************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscription_1 = __webpack_require__(/*! ./Subscription */ 6);\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar SubjectSubscription = function (_super) {\n    __extends(SubjectSubscription, _super);\n    function SubjectSubscription(subject, subscriber) {\n        _super.call(this);\n        this.subject = subject;\n        this.subscriber = subscriber;\n        this.closed = false;\n    }\n    SubjectSubscription.prototype.unsubscribe = function () {\n        if (this.closed) {\n            return;\n        }\n        this.closed = true;\n        var subject = this.subject;\n        var observers = subject.observers;\n        this.subject = null;\n        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {\n            return;\n        }\n        var subscriberIndex = observers.indexOf(this.subscriber);\n        if (subscriberIndex !== -1) {\n            observers.splice(subscriberIndex, 1);\n        }\n    };\n    return SubjectSubscription;\n}(Subscription_1.Subscription);\nexports.SubjectSubscription = SubjectSubscription;\n//# sourceMappingURL=SubjectSubscription.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/SubjectSubscription.js\n// module id = 44\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/SubjectSubscription.js?");

/***/ }),
/* 45 */
/*!********************************************!*\
  !*** ./node_modules/rxjs/ReplaySubject.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subject_1 = __webpack_require__(/*! ./Subject */ 28);\nvar queue_1 = __webpack_require__(/*! ./scheduler/queue */ 93);\nvar Subscription_1 = __webpack_require__(/*! ./Subscription */ 6);\nvar observeOn_1 = __webpack_require__(/*! ./operator/observeOn */ 100);\nvar ObjectUnsubscribedError_1 = __webpack_require__(/*! ./util/ObjectUnsubscribedError */ 43);\nvar SubjectSubscription_1 = __webpack_require__(/*! ./SubjectSubscription */ 44);\n/**\n * @class ReplaySubject<T>\n */\nvar ReplaySubject = function (_super) {\n    __extends(ReplaySubject, _super);\n    function ReplaySubject(bufferSize, windowTime, scheduler) {\n        if (bufferSize === void 0) {\n            bufferSize = Number.POSITIVE_INFINITY;\n        }\n        if (windowTime === void 0) {\n            windowTime = Number.POSITIVE_INFINITY;\n        }\n        _super.call(this);\n        this.scheduler = scheduler;\n        this._events = [];\n        this._bufferSize = bufferSize < 1 ? 1 : bufferSize;\n        this._windowTime = windowTime < 1 ? 1 : windowTime;\n    }\n    ReplaySubject.prototype.next = function (value) {\n        var now = this._getNow();\n        this._events.push(new ReplayEvent(now, value));\n        this._trimBufferThenGetEvents();\n        _super.prototype.next.call(this, value);\n    };\n    ReplaySubject.prototype._subscribe = function (subscriber) {\n        var _events = this._trimBufferThenGetEvents();\n        var scheduler = this.scheduler;\n        var subscription;\n        if (this.closed) {\n            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();\n        } else if (this.hasError) {\n            subscription = Subscription_1.Subscription.EMPTY;\n        } else if (this.isStopped) {\n            subscription = Subscription_1.Subscription.EMPTY;\n        } else {\n            this.observers.push(subscriber);\n            subscription = new SubjectSubscription_1.SubjectSubscription(this, subscriber);\n        }\n        if (scheduler) {\n            subscriber.add(subscriber = new observeOn_1.ObserveOnSubscriber(subscriber, scheduler));\n        }\n        var len = _events.length;\n        for (var i = 0; i < len && !subscriber.closed; i++) {\n            subscriber.next(_events[i].value);\n        }\n        if (this.hasError) {\n            subscriber.error(this.thrownError);\n        } else if (this.isStopped) {\n            subscriber.complete();\n        }\n        return subscription;\n    };\n    ReplaySubject.prototype._getNow = function () {\n        return (this.scheduler || queue_1.queue).now();\n    };\n    ReplaySubject.prototype._trimBufferThenGetEvents = function () {\n        var now = this._getNow();\n        var _bufferSize = this._bufferSize;\n        var _windowTime = this._windowTime;\n        var _events = this._events;\n        var eventsCount = _events.length;\n        var spliceCount = 0;\n        // Trim events that fall out of the time window.\n        // Start at the front of the list. Break early once\n        // we encounter an event that falls within the window.\n        while (spliceCount < eventsCount) {\n            if (now - _events[spliceCount].time < _windowTime) {\n                break;\n            }\n            spliceCount++;\n        }\n        if (eventsCount > _bufferSize) {\n            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);\n        }\n        if (spliceCount > 0) {\n            _events.splice(0, spliceCount);\n        }\n        return _events;\n    };\n    return ReplaySubject;\n}(Subject_1.Subject);\nexports.ReplaySubject = ReplaySubject;\nvar ReplayEvent = function () {\n    function ReplayEvent(time, value) {\n        this.time = time;\n        this.value = value;\n    }\n    return ReplayEvent;\n}();\n//# sourceMappingURL=ReplaySubject.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/ReplaySubject.js\n// module id = 45\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/ReplaySubject.js?");

/***/ }),
/* 46 */
/*!**********************************************************!*\
  !*** ./node_modules/rxjs/observable/ScalarObservable.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ../Observable */ 0);\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar ScalarObservable = function (_super) {\n    __extends(ScalarObservable, _super);\n    function ScalarObservable(value, scheduler) {\n        _super.call(this);\n        this.value = value;\n        this.scheduler = scheduler;\n        this._isScalar = true;\n        if (scheduler) {\n            this._isScalar = false;\n        }\n    }\n    ScalarObservable.create = function (value, scheduler) {\n        return new ScalarObservable(value, scheduler);\n    };\n    ScalarObservable.dispatch = function (state) {\n        var done = state.done,\n            value = state.value,\n            subscriber = state.subscriber;\n        if (done) {\n            subscriber.complete();\n            return;\n        }\n        subscriber.next(value);\n        if (subscriber.closed) {\n            return;\n        }\n        state.done = true;\n        this.schedule(state);\n    };\n    ScalarObservable.prototype._subscribe = function (subscriber) {\n        var value = this.value;\n        var scheduler = this.scheduler;\n        if (scheduler) {\n            return scheduler.schedule(ScalarObservable.dispatch, 0, {\n                done: false, value: value, subscriber: subscriber\n            });\n        } else {\n            subscriber.next(value);\n            if (!subscriber.closed) {\n                subscriber.complete();\n            }\n        }\n    };\n    return ScalarObservable;\n}(Observable_1.Observable);\nexports.ScalarObservable = ScalarObservable;\n//# sourceMappingURL=ScalarObservable.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/observable/ScalarObservable.js\n// module id = 46\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/ScalarObservable.js?");

/***/ }),
/* 47 */
/*!*********************************************************!*\
  !*** ./node_modules/rxjs/observable/EmptyObservable.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Observable_1 = __webpack_require__(/*! ../Observable */ 0);\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @extends {Ignored}\n * @hide true\n */\nvar EmptyObservable = function (_super) {\n    __extends(EmptyObservable, _super);\n    function EmptyObservable(scheduler) {\n        _super.call(this);\n        this.scheduler = scheduler;\n    }\n    /**\n     * Creates an Observable that emits no items to the Observer and immediately\n     * emits a complete notification.\n     *\n     * <span class=\"informal\">Just emits 'complete', and nothing else.\n     * </span>\n     *\n     * <img src=\"./img/empty.png\" width=\"100%\">\n     *\n     * This static operator is useful for creating a simple Observable that only\n     * emits the complete notification. It can be used for composing with other\n     * Observables, such as in a {@link mergeMap}.\n     *\n     * @example <caption>Emit the number 7, then complete.</caption>\n     * var result = Rx.Observable.empty().startWith(7);\n     * result.subscribe(x => console.log(x));\n     *\n     * @example <caption>Map and flatten only odd numbers to the sequence 'a', 'b', 'c'</caption>\n     * var interval = Rx.Observable.interval(1000);\n     * var result = interval.mergeMap(x =>\n     *   x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.empty()\n     * );\n     * result.subscribe(x => console.log(x));\n     *\n     * // Results in the following to the console:\n     * // x is equal to the count on the interval eg(0,1,2,3,...)\n     * // x will occur every 1000ms\n     * // if x % 2 is equal to 1 print abc\n     * // if x % 2 is not equal to 1 nothing will be output\n     *\n     * @see {@link create}\n     * @see {@link never}\n     * @see {@link of}\n     * @see {@link throw}\n     *\n     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling\n     * the emission of the complete notification.\n     * @return {Observable} An \"empty\" Observable: emits only the complete\n     * notification.\n     * @static true\n     * @name empty\n     * @owner Observable\n     */\n    EmptyObservable.create = function (scheduler) {\n        return new EmptyObservable(scheduler);\n    };\n    EmptyObservable.dispatch = function (arg) {\n        var subscriber = arg.subscriber;\n        subscriber.complete();\n    };\n    EmptyObservable.prototype._subscribe = function (subscriber) {\n        var scheduler = this.scheduler;\n        if (scheduler) {\n            return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber: subscriber });\n        } else {\n            subscriber.complete();\n        }\n    };\n    return EmptyObservable;\n}(Observable_1.Observable);\nexports.EmptyObservable = EmptyObservable;\n//# sourceMappingURL=EmptyObservable.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/observable/EmptyObservable.js\n// module id = 47\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/EmptyObservable.js?");

/***/ }),
/* 48 */
/*!************************************************!*\
  !*** ./node_modules/rxjs/operator/mergeAll.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ 13);\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ 14);\n/**\n * Converts a higher-order Observable into a first-order Observable which\n * concurrently delivers all values that are emitted on the inner Observables.\n *\n * <span class=\"informal\">Flattens an Observable-of-Observables.</span>\n *\n * <img src=\"./img/mergeAll.png\" width=\"100%\">\n *\n * `mergeAll` subscribes to an Observable that emits Observables, also known as\n * a higher-order Observable. Each time it observes one of these emitted inner\n * Observables, it subscribes to that and delivers all the values from the\n * inner Observable on the output Observable. The output Observable only\n * completes once all inner Observables have completed. Any error delivered by\n * a inner Observable will be immediately emitted on the output Observable.\n *\n * @example <caption>Spawn a new interval Observable for each click event, and blend their outputs as one Observable</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));\n * var firstOrder = higherOrder.mergeAll();\n * firstOrder.subscribe(x => console.log(x));\n *\n * @example <caption>Count from 0 to 9 every second for each click, but only allow 2 concurrent timers</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000).take(10));\n * var firstOrder = higherOrder.mergeAll(2);\n * firstOrder.subscribe(x => console.log(x));\n *\n * @see {@link combineAll}\n * @see {@link concatAll}\n * @see {@link exhaust}\n * @see {@link merge}\n * @see {@link mergeMap}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n * @see {@link switch}\n * @see {@link zipAll}\n *\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of inner\n * Observables being subscribed to concurrently.\n * @return {Observable} An Observable that emits values coming from all the\n * inner Observables emitted by the source Observable.\n * @method mergeAll\n * @owner Observable\n */\nfunction mergeAll(concurrent) {\n    if (concurrent === void 0) {\n        concurrent = Number.POSITIVE_INFINITY;\n    }\n    return this.lift(new MergeAllOperator(concurrent));\n}\nexports.mergeAll = mergeAll;\nvar MergeAllOperator = function () {\n    function MergeAllOperator(concurrent) {\n        this.concurrent = concurrent;\n    }\n    MergeAllOperator.prototype.call = function (observer, source) {\n        return source.subscribe(new MergeAllSubscriber(observer, this.concurrent));\n    };\n    return MergeAllOperator;\n}();\nexports.MergeAllOperator = MergeAllOperator;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar MergeAllSubscriber = function (_super) {\n    __extends(MergeAllSubscriber, _super);\n    function MergeAllSubscriber(destination, concurrent) {\n        _super.call(this, destination);\n        this.concurrent = concurrent;\n        this.hasCompleted = false;\n        this.buffer = [];\n        this.active = 0;\n    }\n    MergeAllSubscriber.prototype._next = function (observable) {\n        if (this.active < this.concurrent) {\n            this.active++;\n            this.add(subscribeToResult_1.subscribeToResult(this, observable));\n        } else {\n            this.buffer.push(observable);\n        }\n    };\n    MergeAllSubscriber.prototype._complete = function () {\n        this.hasCompleted = true;\n        if (this.active === 0 && this.buffer.length === 0) {\n            this.destination.complete();\n        }\n    };\n    MergeAllSubscriber.prototype.notifyComplete = function (innerSub) {\n        var buffer = this.buffer;\n        this.remove(innerSub);\n        this.active--;\n        if (buffer.length > 0) {\n            this._next(buffer.shift());\n        } else if (this.active === 0 && this.hasCompleted) {\n            this.destination.complete();\n        }\n    };\n    return MergeAllSubscriber;\n}(OuterSubscriber_1.OuterSubscriber);\nexports.MergeAllSubscriber = MergeAllSubscriber;\n//# sourceMappingURL=mergeAll.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/mergeAll.js\n// module id = 48\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/mergeAll.js?");

/***/ }),
/* 49 */
/*!*******************************************!*\
  !*** ./node_modules/rxjs/operator/map.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ 3);\n/**\n * Applies a given `project` function to each value emitted by the source\n * Observable, and emits the resulting values as an Observable.\n *\n * <span class=\"informal\">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),\n * it passes each source value through a transformation function to get\n * corresponding output values.</span>\n *\n * <img src=\"./img/map.png\" width=\"100%\">\n *\n * Similar to the well known `Array.prototype.map` function, this operator\n * applies a projection to each value and emits that projection in the output\n * Observable.\n *\n * @example <caption>Map every click to the clientX position of that click</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var positions = clicks.map(ev => ev.clientX);\n * positions.subscribe(x => console.log(x));\n *\n * @see {@link mapTo}\n * @see {@link pluck}\n *\n * @param {function(value: T, index: number): R} project The function to apply\n * to each `value` emitted by the source Observable. The `index` parameter is\n * the number `i` for the i-th emission that has happened since the\n * subscription, starting from the number `0`.\n * @param {any} [thisArg] An optional argument to define what `this` is in the\n * `project` function.\n * @return {Observable<R>} An Observable that emits the values from the source\n * Observable transformed by the given `project` function.\n * @method map\n * @owner Observable\n */\nfunction map(project, thisArg) {\n    if (typeof project !== 'function') {\n        throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');\n    }\n    return this.lift(new MapOperator(project, thisArg));\n}\nexports.map = map;\nvar MapOperator = function () {\n    function MapOperator(project, thisArg) {\n        this.project = project;\n        this.thisArg = thisArg;\n    }\n    MapOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));\n    };\n    return MapOperator;\n}();\nexports.MapOperator = MapOperator;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar MapSubscriber = function (_super) {\n    __extends(MapSubscriber, _super);\n    function MapSubscriber(destination, project, thisArg) {\n        _super.call(this, destination);\n        this.project = project;\n        this.count = 0;\n        this.thisArg = thisArg || this;\n    }\n    // NOTE: This looks unoptimized, but it's actually purposefully NOT\n    // using try/catch optimizations.\n    MapSubscriber.prototype._next = function (value) {\n        var result;\n        try {\n            result = this.project.call(this.thisArg, value, this.count++);\n        } catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        this.destination.next(result);\n    };\n    return MapSubscriber;\n}(Subscriber_1.Subscriber);\n//# sourceMappingURL=map.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/map.js\n// module id = 49\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/map.js?");

/***/ }),
/* 50 */
/*!*****************************!*\
  !*** ./client-2/vendors.js ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _compose = __webpack_require__(/*! ramda/src/compose */ 51);\n\nvar _compose2 = _interopRequireDefault(_compose);\n\nvar _curry = __webpack_require__(/*! ramda/src/curry */ 59);\n\nvar _curry2 = _interopRequireDefault(_curry);\n\nvar _equals = __webpack_require__(/*! ramda/src/equals */ 61);\n\nvar _equals2 = _interopRequireDefault(_equals);\n\nvar _filter = __webpack_require__(/*! ramda/src/filter */ 68);\n\nvar _filter2 = _interopRequireDefault(_filter);\n\nvar _lens = __webpack_require__(/*! ramda/src/lens */ 24);\n\nvar _lens2 = _interopRequireDefault(_lens);\n\nvar _lensIndex = __webpack_require__(/*! ramda/src/lensIndex */ 75);\n\nvar _lensIndex2 = _interopRequireDefault(_lensIndex);\n\nvar _lensProp = __webpack_require__(/*! ramda/src/lensProp */ 80);\n\nvar _lensProp2 = _interopRequireDefault(_lensProp);\n\nvar _map = __webpack_require__(/*! ramda/src/map */ 35);\n\nvar _map2 = _interopRequireDefault(_map);\n\nvar _merge = __webpack_require__(/*! ramda/src/merge */ 83);\n\nvar _merge2 = _interopRequireDefault(_merge);\n\nvar _over = __webpack_require__(/*! ramda/src/over */ 37);\n\nvar _over2 = _interopRequireDefault(_over);\n\nvar _pipe = __webpack_require__(/*! ramda/src/pipe */ 29);\n\nvar _pipe2 = _interopRequireDefault(_pipe);\n\nvar _reduce = __webpack_require__(/*! ramda/src/reduce */ 30);\n\nvar _reduce2 = _interopRequireDefault(_reduce);\n\nvar _set = __webpack_require__(/*! ramda/src/set */ 86);\n\nvar _set2 = _interopRequireDefault(_set);\n\nvar _sortBy = __webpack_require__(/*! ramda/src/sortBy */ 87);\n\nvar _sortBy2 = _interopRequireDefault(_sortBy);\n\nvar _view = __webpack_require__(/*! ramda/src/view */ 88);\n\nvar _view2 = _interopRequireDefault(_view);\n\nvar _zipObj = __webpack_require__(/*! ramda/src/zipObj */ 89);\n\nvar _zipObj2 = _interopRequireDefault(_zipObj);\n\nvar _Observable = __webpack_require__(/*! rxjs/Observable */ 0);\n\nvar _Subject = __webpack_require__(/*! rxjs/Subject */ 28);\n\nvar _ReplaySubject = __webpack_require__(/*! rxjs/ReplaySubject */ 45);\n\n__webpack_require__(/*! rxjs/add/observable/combineLatest */ 102);\n\n__webpack_require__(/*! rxjs/add/observable/merge */ 109);\n\n__webpack_require__(/*! rxjs/add/observable/of */ 112);\n\n__webpack_require__(/*! rxjs/add/operator/distinctUntilChanged */ 114);\n\n__webpack_require__(/*! rxjs/add/operator/do */ 116);\n\n__webpack_require__(/*! rxjs/add/operator/filter */ 118);\n\n__webpack_require__(/*! rxjs/add/operator/map */ 120);\n\n__webpack_require__(/*! rxjs/add/operator/pluck */ 121);\n\n__webpack_require__(/*! rxjs/add/operator/sample */ 123);\n\n__webpack_require__(/*! rxjs/add/operator/scan */ 125);\n\n__webpack_require__(/*! rxjs/add/operator/shareReplay */ 127);\n\n__webpack_require__(/*! rxjs/add/operator/startWith */ 131);\n\n__webpack_require__(/*! rxjs/add/operator/withLatestFrom */ 134);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n// RAMDA ===========================================================================================\n// assoc, assocPath are replace with lenses\nvar id = function id(x) {\n  return x;\n};\nvar always = (0, _curry2.default)(function (x, y) {\n  return x;\n});\n\nwindow.R = { always: always, compose: _compose2.default, curry: _curry2.default, equals: _equals2.default, id: id, filter: _filter2.default,\n  lens: _lens2.default, lensIndex: _lensIndex2.default, lensProp: _lensProp2.default, map: _map2.default, merge: _merge2.default, over: _over2.default, pipe: _pipe2.default,\n  reduce: _reduce2.default, set: _set2.default, sortBy: _sortBy2.default, view: _view2.default, zipObj: _zipObj2.default\n\n  // Helpers\n};var lensify = function lensify(lens) {\n  if (lens instanceof Array) {\n    return (0, _reduce2.default)(function (z, s) {\n      return (0, _compose2.default)(z, typeof s == \"number\" ? (0, _lensIndex2.default)(s) : (0, _lensProp2.default)(s));\n    }, id, lens);\n  } else if (lens instanceof Function) {\n    return lens;\n  } else {\n    throw Error(\"invalid lens \" + lens);\n  }\n};\n\n// Changing global namespace for brevity (bad for libs, ok for apps)\nwindow.R.viewL = (0, _curry2.default)(function (lens, obj) {\n  return (0, _view2.default)(lensify(lens), obj);\n});\nwindow.R.setL = (0, _curry2.default)(function (lens, val, obj) {\n  return (0, _set2.default)(lensify(lens), val, obj);\n});\nwindow.R.overL = (0, _curry2.default)(function (lens, fn, obj) {\n  return (0, _over2.default)(lensify(lens), fn, obj);\n});\n\n// RXJS ============================================================================================\n\n\n// Observable functions\n\n\n// Observable methods\n\n\nwindow.Observable = _Observable.Observable;\nwindow.Subject = _Subject.Subject;\nwindow.ReplaySubject = _ReplaySubject.ReplaySubject;\n\n//////////////////\n// WEBPACK FOOTER\n// ./client-2/vendors.js\n// module id = 50\n// module chunks = 0\n\n//# sourceURL=webpack:///./client-2/vendors.js?");

/***/ }),
/* 51 */
/*!*************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/compose.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var pipe = __webpack_require__(/*! ./pipe */ 29);\nvar reverse = __webpack_require__(/*! ./reverse */ 58);\n\n/**\n * Performs right-to-left function composition. The rightmost function may have\n * any arity; the remaining functions must be unary.\n *\n * **Note:** The result of compose is not automatically curried.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category Function\n * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)\n * @param {...Function} ...functions The functions to compose\n * @return {Function}\n * @see R.pipe\n * @example\n *\n *      var classyGreeting = (firstName, lastName) => \"The name's \" + lastName + \", \" + firstName + \" \" + lastName\n *      var yellGreeting = R.compose(R.toUpper, classyGreeting);\n *      yellGreeting('James', 'Bond'); //=> \"THE NAME'S BOND, JAMES BOND\"\n *\n *      R.compose(Math.abs, R.add(1), R.multiply(2))(-4) //=> 7\n *\n * @symb R.compose(f, g, h)(a, b) = f(g(h(a, b)))\n */\nmodule.exports = function compose() {\n  if (arguments.length === 0) {\n    throw new Error('compose requires at least one argument');\n  }\n  return pipe.apply(this, reverse(arguments));\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/compose.js\n// module id = 51\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/compose.js?");

/***/ }),
/* 52 */
/*!********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_pipe.js ***!
  \********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _pipe(f, g) {\n  return function () {\n    return g.call(this, f.apply(this, arguments));\n  };\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_pipe.js\n// module id = 52\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_pipe.js?");

/***/ }),
/* 53 */
/*!*********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_xwrap.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function () {\n  function XWrap(fn) {\n    this.f = fn;\n  }\n  XWrap.prototype['@@transducer/init'] = function () {\n    throw new Error('init not implemented on XWrap');\n  };\n  XWrap.prototype['@@transducer/result'] = function (acc) {\n    return acc;\n  };\n  XWrap.prototype['@@transducer/step'] = function (acc, x) {\n    return this.f(acc, x);\n  };\n\n  return function _xwrap(fn) {\n    return new XWrap(fn);\n  };\n}();\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_xwrap.js\n// module id = 53\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_xwrap.js?");

/***/ }),
/* 54 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/bind.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _arity = __webpack_require__(/*! ./internal/_arity */ 10);\nvar _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\n\n/**\n * Creates a function that is bound to a context.\n * Note: `R.bind` does not provide the additional argument-binding capabilities of\n * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).\n *\n * @func\n * @memberOf R\n * @since v0.6.0\n * @category Function\n * @category Object\n * @sig (* -> *) -> {*} -> (* -> *)\n * @param {Function} fn The function to bind to context\n * @param {Object} thisObj The context to bind `fn` to\n * @return {Function} A function that will execute in the context of `thisObj`.\n * @see R.partial\n * @example\n *\n *      var log = R.bind(console.log, console);\n *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}\n *      // logs {a: 2}\n * @symb R.bind(f, o)(a, b) = f.call(o, a, b)\n */\nmodule.exports = _curry2(function bind(fn, thisObj) {\n  return _arity(fn.length, function () {\n    return fn.apply(thisObj, arguments);\n  });\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/bind.js\n// module id = 54\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/bind.js?");

/***/ }),
/* 55 */
/*!*****************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/isArrayLike.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\nvar _isArray = __webpack_require__(/*! ./internal/_isArray */ 21);\nvar _isString = __webpack_require__(/*! ./internal/_isString */ 22);\n\n/**\n * Tests whether or not an object is similar to an array.\n *\n * @func\n * @memberOf R\n * @since v0.5.0\n * @category Type\n * @category List\n * @sig * -> Boolean\n * @param {*} x The object to test.\n * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.\n * @deprecated since v0.23.0\n * @example\n *\n *      R.isArrayLike([]); //=> true\n *      R.isArrayLike(true); //=> false\n *      R.isArrayLike({}); //=> false\n *      R.isArrayLike({length: 10}); //=> false\n *      R.isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true\n */\nmodule.exports = _curry1(function isArrayLike(x) {\n  if (_isArray(x)) {\n    return true;\n  }\n  if (!x) {\n    return false;\n  }\n  if (typeof x !== 'object') {\n    return false;\n  }\n  if (_isString(x)) {\n    return false;\n  }\n  if (x.nodeType === 1) {\n    return !!x.length;\n  }\n  if (x.length === 0) {\n    return true;\n  }\n  if (x.length > 0) {\n    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);\n  }\n  return false;\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/isArrayLike.js\n// module id = 55\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/isArrayLike.js?");

/***/ }),
/* 56 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/tail.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _checkForMethod = __webpack_require__(/*! ./internal/_checkForMethod */ 31);\nvar _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\nvar slice = __webpack_require__(/*! ./slice */ 57);\n\n/**\n * Returns all but the first element of the given list or string (or object\n * with a `tail` method).\n *\n * Dispatches to the `slice` method of the first argument, if present.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category List\n * @sig [a] -> [a]\n * @sig String -> String\n * @param {*} list\n * @return {*}\n * @see R.head, R.init, R.last\n * @example\n *\n *      R.tail([1, 2, 3]);  //=> [2, 3]\n *      R.tail([1, 2]);     //=> [2]\n *      R.tail([1]);        //=> []\n *      R.tail([]);         //=> []\n *\n *      R.tail('abc');  //=> 'bc'\n *      R.tail('ab');   //=> 'b'\n *      R.tail('a');    //=> ''\n *      R.tail('');     //=> ''\n */\nmodule.exports = _curry1(_checkForMethod('tail', slice(1, Infinity)));\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/tail.js\n// module id = 56\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/tail.js?");

/***/ }),
/* 57 */
/*!***********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/slice.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _checkForMethod = __webpack_require__(/*! ./internal/_checkForMethod */ 31);\nvar _curry3 = __webpack_require__(/*! ./internal/_curry3 */ 4);\n\n/**\n * Returns the elements of the given list or string (or object with a `slice`\n * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).\n *\n * Dispatches to the `slice` method of the third argument, if present.\n *\n * @func\n * @memberOf R\n * @since v0.1.4\n * @category List\n * @sig Number -> Number -> [a] -> [a]\n * @sig Number -> Number -> String -> String\n * @param {Number} fromIndex The start index (inclusive).\n * @param {Number} toIndex The end index (exclusive).\n * @param {*} list\n * @return {*}\n * @example\n *\n *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']\n *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']\n *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']\n *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']\n *      R.slice(0, 3, 'ramda');                     //=> 'ram'\n */\nmodule.exports = _curry3(_checkForMethod('slice', function slice(fromIndex, toIndex, list) {\n  return Array.prototype.slice.call(list, fromIndex, toIndex);\n}));\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/slice.js\n// module id = 57\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/slice.js?");

/***/ }),
/* 58 */
/*!*************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/reverse.js ***!
  \*************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\nvar _isString = __webpack_require__(/*! ./internal/_isString */ 22);\n\n/**\n * Returns a new list or string with the elements or characters in reverse\n * order.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category List\n * @sig [a] -> [a]\n * @sig String -> String\n * @param {Array|String} list\n * @return {Array|String}\n * @example\n *\n *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]\n *      R.reverse([1, 2]);     //=> [2, 1]\n *      R.reverse([1]);        //=> [1]\n *      R.reverse([]);         //=> []\n *\n *      R.reverse('abc');      //=> 'cba'\n *      R.reverse('ab');       //=> 'ba'\n *      R.reverse('a');        //=> 'a'\n *      R.reverse('');         //=> ''\n */\nmodule.exports = _curry1(function reverse(list) {\n  return _isString(list) ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse();\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/reverse.js\n// module id = 58\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/reverse.js?");

/***/ }),
/* 59 */
/*!***********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/curry.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\nvar curryN = __webpack_require__(/*! ./curryN */ 32);\n\n/**\n * Returns a curried equivalent of the provided function. The curried function\n * has two unusual capabilities. First, its arguments needn't be provided one\n * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the\n * following are equivalent:\n *\n *   - `g(1)(2)(3)`\n *   - `g(1)(2, 3)`\n *   - `g(1, 2)(3)`\n *   - `g(1, 2, 3)`\n *\n * Secondly, the special placeholder value `R.__` may be used to specify\n * \"gaps\", allowing partial application of any combination of arguments,\n * regardless of their positions. If `g` is as above and `_` is `R.__`, the\n * following are equivalent:\n *\n *   - `g(1, 2, 3)`\n *   - `g(_, 2, 3)(1)`\n *   - `g(_, _, 3)(1)(2)`\n *   - `g(_, _, 3)(1, 2)`\n *   - `g(_, 2)(1)(3)`\n *   - `g(_, 2)(1, 3)`\n *   - `g(_, 2)(_, 3)(1)`\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category Function\n * @sig (* -> a) -> (* -> a)\n * @param {Function} fn The function to curry.\n * @return {Function} A new, curried function.\n * @see R.curryN\n * @example\n *\n *      var addFourNumbers = (a, b, c, d) => a + b + c + d;\n *\n *      var curriedAddFourNumbers = R.curry(addFourNumbers);\n *      var f = curriedAddFourNumbers(1, 2);\n *      var g = f(3);\n *      g(4); //=> 10\n */\nmodule.exports = _curry1(function curry(fn) {\n  return curryN(fn.length, fn);\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/curry.js\n// module id = 59\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/curry.js?");

/***/ }),
/* 60 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_curryN.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _arity = __webpack_require__(/*! ./_arity */ 10);\nvar _isPlaceholder = __webpack_require__(/*! ./_isPlaceholder */ 11);\n\n/**\n * Internal curryN function.\n *\n * @private\n * @category Function\n * @param {Number} length The arity of the curried function.\n * @param {Array} received An array of arguments received thus far.\n * @param {Function} fn The function to curry.\n * @return {Function} The curried function.\n */\nmodule.exports = function _curryN(length, received, fn) {\n  return function () {\n    var combined = [];\n    var argsIdx = 0;\n    var left = length;\n    var combinedIdx = 0;\n    while (combinedIdx < received.length || argsIdx < arguments.length) {\n      var result;\n      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {\n        result = received[combinedIdx];\n      } else {\n        result = arguments[argsIdx];\n        argsIdx += 1;\n      }\n      combined[combinedIdx] = result;\n      if (!_isPlaceholder(result)) {\n        left -= 1;\n      }\n      combinedIdx += 1;\n    }\n    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));\n  };\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_curryN.js\n// module id = 60\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_curryN.js?");

/***/ }),
/* 61 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/equals.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\nvar _equals = __webpack_require__(/*! ./internal/_equals */ 62);\n\n/**\n * Returns `true` if its arguments are equivalent, `false` otherwise. Handles\n * cyclical data structures.\n *\n * Dispatches symmetrically to the `equals` methods of both arguments, if\n * present.\n *\n * @func\n * @memberOf R\n * @since v0.15.0\n * @category Relation\n * @sig a -> b -> Boolean\n * @param {*} a\n * @param {*} b\n * @return {Boolean}\n * @example\n *\n *      R.equals(1, 1); //=> true\n *      R.equals(1, '1'); //=> false\n *      R.equals([1, 2, 3], [1, 2, 3]); //=> true\n *\n *      var a = {}; a.v = a;\n *      var b = {}; b.v = b;\n *      R.equals(a, b); //=> true\n */\nmodule.exports = _curry2(function equals(a, b) {\n  return _equals(a, b, [], []);\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/equals.js\n// module id = 61\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/equals.js?");

/***/ }),
/* 62 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_equals.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _arrayFromIterator = __webpack_require__(/*! ./_arrayFromIterator */ 63);\nvar _functionName = __webpack_require__(/*! ./_functionName */ 64);\nvar _has = __webpack_require__(/*! ./_has */ 12);\nvar identical = __webpack_require__(/*! ../identical */ 65);\nvar keys = __webpack_require__(/*! ../keys */ 23);\nvar type = __webpack_require__(/*! ../type */ 67);\n\nmodule.exports = function _equals(a, b, stackA, stackB) {\n  if (identical(a, b)) {\n    return true;\n  }\n\n  if (type(a) !== type(b)) {\n    return false;\n  }\n\n  if (a == null || b == null) {\n    return false;\n  }\n\n  if (typeof a.equals === 'function' || typeof b.equals === 'function') {\n    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);\n  }\n\n  switch (type(a)) {\n    case 'Arguments':\n    case 'Array':\n    case 'Object':\n      if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {\n        return a === b;\n      }\n      break;\n    case 'Boolean':\n    case 'Number':\n    case 'String':\n      if (!(typeof a === typeof b && identical(a.valueOf(), b.valueOf()))) {\n        return false;\n      }\n      break;\n    case 'Date':\n      if (!identical(a.valueOf(), b.valueOf())) {\n        return false;\n      }\n      break;\n    case 'Error':\n      return a.name === b.name && a.message === b.message;\n    case 'RegExp':\n      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {\n        return false;\n      }\n      break;\n    case 'Map':\n    case 'Set':\n      if (!_equals(_arrayFromIterator(a.entries()), _arrayFromIterator(b.entries()), stackA, stackB)) {\n        return false;\n      }\n      break;\n    case 'Int8Array':\n    case 'Uint8Array':\n    case 'Uint8ClampedArray':\n    case 'Int16Array':\n    case 'Uint16Array':\n    case 'Int32Array':\n    case 'Uint32Array':\n    case 'Float32Array':\n    case 'Float64Array':\n      break;\n    case 'ArrayBuffer':\n      break;\n    default:\n      // Values of other types are only equal if identical.\n      return false;\n  }\n\n  var keysA = keys(a);\n  if (keysA.length !== keys(b).length) {\n    return false;\n  }\n\n  var idx = stackA.length - 1;\n  while (idx >= 0) {\n    if (stackA[idx] === a) {\n      return stackB[idx] === b;\n    }\n    idx -= 1;\n  }\n\n  stackA.push(a);\n  stackB.push(b);\n  idx = keysA.length - 1;\n  while (idx >= 0) {\n    var key = keysA[idx];\n    if (!(_has(key, b) && _equals(b[key], a[key], stackA, stackB))) {\n      return false;\n    }\n    idx -= 1;\n  }\n  stackA.pop();\n  stackB.pop();\n  return true;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_equals.js\n// module id = 62\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_equals.js?");

/***/ }),
/* 63 */
/*!*********************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_arrayFromIterator.js ***!
  \*********************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _arrayFromIterator(iter) {\n  var list = [];\n  var next;\n  while (!(next = iter.next()).done) {\n    list.push(next.value);\n  }\n  return list;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_arrayFromIterator.js\n// module id = 63\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_arrayFromIterator.js?");

/***/ }),
/* 64 */
/*!****************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_functionName.js ***!
  \****************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _functionName(f) {\n  // String(x => x) evaluates to \"x => x\", so the pattern may not match.\n  var match = String(f).match(/^function (\\w*)/);\n  return match == null ? '' : match[1];\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_functionName.js\n// module id = 64\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_functionName.js?");

/***/ }),
/* 65 */
/*!***************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/identical.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\n\n/**\n * Returns true if its arguments are identical, false otherwise. Values are\n * identical if they reference the same memory. `NaN` is identical to `NaN`;\n * `0` and `-0` are not identical.\n *\n * @func\n * @memberOf R\n * @since v0.15.0\n * @category Relation\n * @sig a -> a -> Boolean\n * @param {*} a\n * @param {*} b\n * @return {Boolean}\n * @example\n *\n *      var o = {};\n *      R.identical(o, o); //=> true\n *      R.identical(1, 1); //=> true\n *      R.identical(1, '1'); //=> false\n *      R.identical([], []); //=> false\n *      R.identical(0, -0); //=> false\n *      R.identical(NaN, NaN); //=> true\n */\nmodule.exports = _curry2(function identical(a, b) {\n  // SameValue algorithm\n  if (a === b) {\n    // Steps 1-5, 7-10\n    // Steps 6.b-6.e: +0 != -0\n    return a !== 0 || 1 / a === 1 / b;\n  } else {\n    // Step 6.a: NaN == NaN\n    return a !== a && b !== b;\n  }\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/identical.js\n// module id = 65\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/identical.js?");

/***/ }),
/* 66 */
/*!***************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_isArguments.js ***!
  \***************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _has = __webpack_require__(/*! ./_has */ 12);\n\nmodule.exports = function () {\n  var toString = Object.prototype.toString;\n  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {\n    return toString.call(x) === '[object Arguments]';\n  } : function _isArguments(x) {\n    return _has('callee', x);\n  };\n}();\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_isArguments.js\n// module id = 66\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_isArguments.js?");

/***/ }),
/* 67 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/type.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\n\n/**\n * Gives a single-word string description of the (native) type of a value,\n * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not\n * attempt to distinguish user Object types any further, reporting them all as\n * 'Object'.\n *\n * @func\n * @memberOf R\n * @since v0.8.0\n * @category Type\n * @sig (* -> {*}) -> String\n * @param {*} val The value to test\n * @return {String}\n * @example\n *\n *      R.type({}); //=> \"Object\"\n *      R.type(1); //=> \"Number\"\n *      R.type(false); //=> \"Boolean\"\n *      R.type('s'); //=> \"String\"\n *      R.type(null); //=> \"Null\"\n *      R.type([]); //=> \"Array\"\n *      R.type(/[A-z]/); //=> \"RegExp\"\n */\nmodule.exports = _curry1(function type(val) {\n  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/type.js\n// module id = 67\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/type.js?");

/***/ }),
/* 68 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/filter.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\nvar _dispatchable = __webpack_require__(/*! ./internal/_dispatchable */ 33);\nvar _filter = __webpack_require__(/*! ./internal/_filter */ 70);\nvar _isObject = __webpack_require__(/*! ./internal/_isObject */ 71);\nvar _reduce = __webpack_require__(/*! ./internal/_reduce */ 20);\nvar _xfilter = __webpack_require__(/*! ./internal/_xfilter */ 72);\nvar keys = __webpack_require__(/*! ./keys */ 23);\n\n/**\n * Takes a predicate and a \"filterable\", and returns a new filterable of the\n * same type containing the members of the given filterable which satisfy the\n * given predicate.\n *\n * Dispatches to the `filter` method of the second argument, if present.\n *\n * Acts as a transducer if a transformer is given in list position.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category List\n * @sig Filterable f => (a -> Boolean) -> f a -> f a\n * @param {Function} pred\n * @param {Array} filterable\n * @return {Array}\n * @see R.reject, R.transduce, R.addIndex\n * @example\n *\n *      var isEven = n => n % 2 === 0;\n *\n *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]\n *\n *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}\n */\nmodule.exports = _curry2(_dispatchable(['filter'], _xfilter, function (pred, filterable) {\n  return _isObject(filterable) ? _reduce(function (acc, key) {\n    if (pred(filterable[key])) {\n      acc[key] = filterable[key];\n    }\n    return acc;\n  }, {}, keys(filterable)) :\n  // else\n  _filter(pred, filterable);\n}));\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/filter.js\n// module id = 68\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/filter.js?");

/***/ }),
/* 69 */
/*!*****************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_isTransformer.js ***!
  \*****************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _isTransformer(obj) {\n  return typeof obj['@@transducer/step'] === 'function';\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_isTransformer.js\n// module id = 69\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_isTransformer.js?");

/***/ }),
/* 70 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_filter.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _filter(fn, list) {\n  var idx = 0;\n  var len = list.length;\n  var result = [];\n\n  while (idx < len) {\n    if (fn(list[idx])) {\n      result[result.length] = list[idx];\n    }\n    idx += 1;\n  }\n  return result;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_filter.js\n// module id = 70\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_filter.js?");

/***/ }),
/* 71 */
/*!************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_isObject.js ***!
  \************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _isObject(x) {\n  return Object.prototype.toString.call(x) === '[object Object]';\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_isObject.js\n// module id = 71\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_isObject.js?");

/***/ }),
/* 72 */
/*!***********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_xfilter.js ***!
  \***********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./_curry2 */ 1);\nvar _xfBase = __webpack_require__(/*! ./_xfBase */ 34);\n\nmodule.exports = function () {\n  function XFilter(f, xf) {\n    this.xf = xf;\n    this.f = f;\n  }\n  XFilter.prototype['@@transducer/init'] = _xfBase.init;\n  XFilter.prototype['@@transducer/result'] = _xfBase.result;\n  XFilter.prototype['@@transducer/step'] = function (result, input) {\n    return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;\n  };\n\n  return _curry2(function _xfilter(f, xf) {\n    return new XFilter(f, xf);\n  });\n}();\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_xfilter.js\n// module id = 72\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_xfilter.js?");

/***/ }),
/* 73 */
/*!*******************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_map.js ***!
  \*******************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("module.exports = function _map(fn, functor) {\n  var idx = 0;\n  var len = functor.length;\n  var result = Array(len);\n  while (idx < len) {\n    result[idx] = fn(functor[idx]);\n    idx += 1;\n  }\n  return result;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_map.js\n// module id = 73\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_map.js?");

/***/ }),
/* 74 */
/*!********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_xmap.js ***!
  \********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./_curry2 */ 1);\nvar _xfBase = __webpack_require__(/*! ./_xfBase */ 34);\n\nmodule.exports = function () {\n  function XMap(f, xf) {\n    this.xf = xf;\n    this.f = f;\n  }\n  XMap.prototype['@@transducer/init'] = _xfBase.init;\n  XMap.prototype['@@transducer/result'] = _xfBase.result;\n  XMap.prototype['@@transducer/step'] = function (result, input) {\n    return this.xf['@@transducer/step'](result, this.f(input));\n  };\n\n  return _curry2(function _xmap(f, xf) {\n    return new XMap(f, xf);\n  });\n}();\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_xmap.js\n// module id = 74\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_xmap.js?");

/***/ }),
/* 75 */
/*!***************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/lensIndex.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\nvar lens = __webpack_require__(/*! ./lens */ 24);\nvar nth = __webpack_require__(/*! ./nth */ 76);\nvar update = __webpack_require__(/*! ./update */ 77);\n\n/**\n * Returns a lens whose focus is the specified index.\n *\n * @func\n * @memberOf R\n * @since v0.14.0\n * @category Object\n * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s\n * @sig Number -> Lens s a\n * @param {Number} n\n * @return {Lens}\n * @see R.view, R.set, R.over\n * @example\n *\n *      var headLens = R.lensIndex(0);\n *\n *      R.view(headLens, ['a', 'b', 'c']);            //=> 'a'\n *      R.set(headLens, 'x', ['a', 'b', 'c']);        //=> ['x', 'b', 'c']\n *      R.over(headLens, R.toUpper, ['a', 'b', 'c']); //=> ['A', 'b', 'c']\n */\nmodule.exports = _curry1(function lensIndex(n) {\n  return lens(nth(n), update(n));\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/lensIndex.js\n// module id = 75\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/lensIndex.js?");

/***/ }),
/* 76 */
/*!*********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/nth.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\nvar _isString = __webpack_require__(/*! ./internal/_isString */ 22);\n\n/**\n * Returns the nth element of the given list or string. If n is negative the\n * element at index length + n is returned.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category List\n * @sig Number -> [a] -> a | Undefined\n * @sig Number -> String -> String\n * @param {Number} offset\n * @param {*} list\n * @return {*}\n * @example\n *\n *      var list = ['foo', 'bar', 'baz', 'quux'];\n *      R.nth(1, list); //=> 'bar'\n *      R.nth(-1, list); //=> 'quux'\n *      R.nth(-99, list); //=> undefined\n *\n *      R.nth(2, 'abc'); //=> 'c'\n *      R.nth(3, 'abc'); //=> ''\n * @symb R.nth(-1, [a, b, c]) = c\n * @symb R.nth(0, [a, b, c]) = a\n * @symb R.nth(1, [a, b, c]) = b\n */\nmodule.exports = _curry2(function nth(offset, list) {\n  var idx = offset < 0 ? list.length + offset : offset;\n  return _isString(list) ? list.charAt(idx) : list[idx];\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/nth.js\n// module id = 76\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/nth.js?");

/***/ }),
/* 77 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/update.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry3 = __webpack_require__(/*! ./internal/_curry3 */ 4);\nvar adjust = __webpack_require__(/*! ./adjust */ 78);\nvar always = __webpack_require__(/*! ./always */ 36);\n\n/**\n * Returns a new copy of the array with the element at the provided index\n * replaced with the given value.\n *\n * @func\n * @memberOf R\n * @since v0.14.0\n * @category List\n * @sig Number -> a -> [a] -> [a]\n * @param {Number} idx The index to update.\n * @param {*} x The value to exist at the given index of the returned array.\n * @param {Array|Arguments} list The source array-like object to be updated.\n * @return {Array} A copy of `list` with the value at index `idx` replaced with `x`.\n * @see R.adjust\n * @example\n *\n *      R.update(1, 11, [0, 1, 2]);     //=> [0, 11, 2]\n *      R.update(1)(11)([0, 1, 2]);     //=> [0, 11, 2]\n * @symb R.update(-1, a, [b, c]) = [b, a]\n * @symb R.update(0, a, [b, c]) = [a, c]\n * @symb R.update(1, a, [b, c]) = [b, a]\n */\nmodule.exports = _curry3(function update(idx, x, list) {\n  return adjust(always(x), idx, list);\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/update.js\n// module id = 77\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/update.js?");

/***/ }),
/* 78 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/adjust.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _concat = __webpack_require__(/*! ./internal/_concat */ 79);\nvar _curry3 = __webpack_require__(/*! ./internal/_curry3 */ 4);\n\n/**\n * Applies a function to the value at the given index of an array, returning a\n * new copy of the array with the element at the given index replaced with the\n * result of the function application.\n *\n * @func\n * @memberOf R\n * @since v0.14.0\n * @category List\n * @sig (a -> a) -> Number -> [a] -> [a]\n * @param {Function} fn The function to apply.\n * @param {Number} idx The index.\n * @param {Array|Arguments} list An array-like object whose value\n *        at the supplied index will be replaced.\n * @return {Array} A copy of the supplied array-like object with\n *         the element at index `idx` replaced with the value\n *         returned by applying `fn` to the existing element.\n * @see R.update\n * @example\n *\n *      R.adjust(R.add(10), 1, [1, 2, 3]);     //=> [1, 12, 3]\n *      R.adjust(R.add(10))(1)([1, 2, 3]);     //=> [1, 12, 3]\n * @symb R.adjust(f, -1, [a, b]) = [a, f(b)]\n * @symb R.adjust(f, 0, [a, b]) = [f(a), b]\n */\nmodule.exports = _curry3(function adjust(fn, idx, list) {\n  if (idx >= list.length || idx < -list.length) {\n    return list;\n  }\n  var start = idx < 0 ? list.length : 0;\n  var _idx = start + idx;\n  var _list = _concat(list);\n  _list[_idx] = fn(list[_idx]);\n  return _list;\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/adjust.js\n// module id = 78\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/adjust.js?");

/***/ }),
/* 79 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_concat.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("/**\n * Private `concat` function to merge two array-like objects.\n *\n * @private\n * @param {Array|Arguments} [set1=[]] An array-like object.\n * @param {Array|Arguments} [set2=[]] An array-like object.\n * @return {Array} A new, merged array.\n * @example\n *\n *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]\n */\nmodule.exports = function _concat(set1, set2) {\n  set1 = set1 || [];\n  set2 = set2 || [];\n  var idx;\n  var len1 = set1.length;\n  var len2 = set2.length;\n  var result = [];\n\n  idx = 0;\n  while (idx < len1) {\n    result[result.length] = set1[idx];\n    idx += 1;\n  }\n  idx = 0;\n  while (idx < len2) {\n    result[result.length] = set2[idx];\n    idx += 1;\n  }\n  return result;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_concat.js\n// module id = 79\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_concat.js?");

/***/ }),
/* 80 */
/*!**************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/lensProp.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry1 = __webpack_require__(/*! ./internal/_curry1 */ 2);\nvar assoc = __webpack_require__(/*! ./assoc */ 81);\nvar lens = __webpack_require__(/*! ./lens */ 24);\nvar prop = __webpack_require__(/*! ./prop */ 82);\n\n/**\n * Returns a lens whose focus is the specified property.\n *\n * @func\n * @memberOf R\n * @since v0.14.0\n * @category Object\n * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s\n * @sig String -> Lens s a\n * @param {String} k\n * @return {Lens}\n * @see R.view, R.set, R.over\n * @example\n *\n *      var xLens = R.lensProp('x');\n *\n *      R.view(xLens, {x: 1, y: 2});            //=> 1\n *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}\n *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}\n */\nmodule.exports = _curry1(function lensProp(k) {\n  return lens(prop(k), assoc(k));\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/lensProp.js\n// module id = 80\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/lensProp.js?");

/***/ }),
/* 81 */
/*!***********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/assoc.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry3 = __webpack_require__(/*! ./internal/_curry3 */ 4);\n\n/**\n * Makes a shallow clone of an object, setting or overriding the specified\n * property with the given value. Note that this copies and flattens prototype\n * properties onto the new object as well. All non-primitive properties are\n * copied by reference.\n *\n * @func\n * @memberOf R\n * @since v0.8.0\n * @category Object\n * @sig String -> a -> {k: v} -> {k: v}\n * @param {String} prop The property name to set\n * @param {*} val The new value\n * @param {Object} obj The object to clone\n * @return {Object} A new object equivalent to the original except for the changed property.\n * @see R.dissoc\n * @example\n *\n *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}\n */\nmodule.exports = _curry3(function assoc(prop, val, obj) {\n  var result = {};\n  for (var p in obj) {\n    result[p] = obj[p];\n  }\n  result[prop] = val;\n  return result;\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/assoc.js\n// module id = 81\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/assoc.js?");

/***/ }),
/* 82 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/prop.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\n\n/**\n * Returns a function that when supplied an object returns the indicated\n * property of that object, if it exists.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category Object\n * @sig s -> {s: a} -> a | Undefined\n * @param {String} p The property name\n * @param {Object} obj The object to query\n * @return {*} The value at `obj.p`.\n * @see R.path\n * @example\n *\n *      R.prop('x', {x: 100}); //=> 100\n *      R.prop('x', {}); //=> undefined\n */\nmodule.exports = _curry2(function prop(p, obj) {\n  return obj[p];\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/prop.js\n// module id = 82\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/prop.js?");

/***/ }),
/* 83 */
/*!***********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/merge.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _assign = __webpack_require__(/*! ./internal/_assign */ 84);\nvar _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\n\n/**\n * Create a new object with the own properties of the first object merged with\n * the own properties of the second object. If a key exists in both objects,\n * the value from the second object will be used.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category Object\n * @sig {k: v} -> {k: v} -> {k: v}\n * @param {Object} l\n * @param {Object} r\n * @return {Object}\n * @see R.mergeWith, R.mergeWithKey\n * @example\n *\n *      R.merge({ 'name': 'fred', 'age': 10 }, { 'age': 40 });\n *      //=> { 'name': 'fred', 'age': 40 }\n *\n *      var resetToDefault = R.merge(R.__, {x: 0});\n *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}\n * @symb R.merge({ x: 1, y: 2 }, { y: 5, z: 3 }) = { x: 1, y: 5, z: 3 }\n */\nmodule.exports = _curry2(function merge(l, r) {\n  return _assign({}, l, r);\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/merge.js\n// module id = 83\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/merge.js?");

/***/ }),
/* 84 */
/*!**********************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_assign.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _objectAssign = __webpack_require__(/*! ./_objectAssign */ 85);\n\nmodule.exports = typeof Object.assign === 'function' ? Object.assign : _objectAssign;\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_assign.js\n// module id = 84\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_assign.js?");

/***/ }),
/* 85 */
/*!****************************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/internal/_objectAssign.js ***!
  \****************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _has = __webpack_require__(/*! ./_has */ 12);\n\n// Based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign\nmodule.exports = function _objectAssign(target) {\n  if (target == null) {\n    throw new TypeError('Cannot convert undefined or null to object');\n  }\n\n  var output = Object(target);\n  var idx = 1;\n  var length = arguments.length;\n  while (idx < length) {\n    var source = arguments[idx];\n    if (source != null) {\n      for (var nextKey in source) {\n        if (_has(nextKey, source)) {\n          output[nextKey] = source[nextKey];\n        }\n      }\n    }\n    idx += 1;\n  }\n  return output;\n};\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/internal/_objectAssign.js\n// module id = 85\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/internal/_objectAssign.js?");

/***/ }),
/* 86 */
/*!*********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/set.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry3 = __webpack_require__(/*! ./internal/_curry3 */ 4);\nvar always = __webpack_require__(/*! ./always */ 36);\nvar over = __webpack_require__(/*! ./over */ 37);\n\n/**\n * Returns the result of \"setting\" the portion of the given data structure\n * focused by the given lens to the given value.\n *\n * @func\n * @memberOf R\n * @since v0.16.0\n * @category Object\n * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s\n * @sig Lens s a -> a -> s -> s\n * @param {Lens} lens\n * @param {*} v\n * @param {*} x\n * @return {*}\n * @see R.prop, R.lensIndex, R.lensProp\n * @example\n *\n *      var xLens = R.lensProp('x');\n *\n *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}\n *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}\n */\nmodule.exports = _curry3(function set(lens, v, x) {\n  return over(lens, always(v), x);\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/set.js\n// module id = 86\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/set.js?");

/***/ }),
/* 87 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/sortBy.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\n\n/**\n * Sorts the list according to the supplied function.\n *\n * @func\n * @memberOf R\n * @since v0.1.0\n * @category Relation\n * @sig Ord b => (a -> b) -> [a] -> [a]\n * @param {Function} fn\n * @param {Array} list The list to sort.\n * @return {Array} A new list sorted by the keys generated by `fn`.\n * @example\n *\n *      var sortByFirstItem = R.sortBy(R.prop(0));\n *      var sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));\n *      var pairs = [[-1, 1], [-2, 2], [-3, 3]];\n *      sortByFirstItem(pairs); //=> [[-3, 3], [-2, 2], [-1, 1]]\n *      var alice = {\n *        name: 'ALICE',\n *        age: 101\n *      };\n *      var bob = {\n *        name: 'Bob',\n *        age: -10\n *      };\n *      var clara = {\n *        name: 'clara',\n *        age: 314.159\n *      };\n *      var people = [clara, bob, alice];\n *      sortByNameCaseInsensitive(people); //=> [alice, bob, clara]\n */\nmodule.exports = _curry2(function sortBy(fn, list) {\n  return Array.prototype.slice.call(list, 0).sort(function (a, b) {\n    var aa = fn(a);\n    var bb = fn(b);\n    return aa < bb ? -1 : aa > bb ? 1 : 0;\n  });\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/sortBy.js\n// module id = 87\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/sortBy.js?");

/***/ }),
/* 88 */
/*!**********************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/view.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\n\n/**\n * Returns a \"view\" of the given data structure, determined by the given lens.\n * The lens's focus determines which portion of the data structure is visible.\n *\n * @func\n * @memberOf R\n * @since v0.16.0\n * @category Object\n * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s\n * @sig Lens s a -> s -> a\n * @param {Lens} lens\n * @param {*} x\n * @return {*}\n * @see R.prop, R.lensIndex, R.lensProp\n * @example\n *\n *      var xLens = R.lensProp('x');\n *\n *      R.view(xLens, {x: 1, y: 2});  //=> 1\n *      R.view(xLens, {x: 4, y: 2});  //=> 4\n */\nmodule.exports = function () {\n  // `Const` is a functor that effectively ignores the function given to `map`.\n  var Const = function (x) {\n    return { value: x, map: function () {\n        return this;\n      } };\n  };\n\n  return _curry2(function view(lens, x) {\n    // Using `Const` effectively ignores the setter function of the `lens`,\n    // leaving the value returned by the getter function unmodified.\n    return lens(Const)(x).value;\n  });\n}();\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/view.js\n// module id = 88\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/view.js?");

/***/ }),
/* 89 */
/*!************************************************************!*\
  !*** /Users/ivankleshnin/node_modules/ramda/src/zipObj.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

eval("var _curry2 = __webpack_require__(/*! ./internal/_curry2 */ 1);\n\n/**\n * Creates a new object out of a list of keys and a list of values.\n * Key/value pairing is truncated to the length of the shorter of the two lists.\n * Note: `zipObj` is equivalent to `pipe(zipWith(pair), fromPairs)`.\n *\n * @func\n * @memberOf R\n * @since v0.3.0\n * @category List\n * @sig [String] -> [*] -> {String: *}\n * @param {Array} keys The array that will be properties on the output object.\n * @param {Array} values The list of values on the output object.\n * @return {Object} The object made by pairing up same-indexed elements of `keys` and `values`.\n * @example\n *\n *      R.zipObj(['a', 'b', 'c'], [1, 2, 3]); //=> {a: 1, b: 2, c: 3}\n */\nmodule.exports = _curry2(function zipObj(keys, values) {\n  var idx = 0;\n  var len = Math.min(keys.length, values.length);\n  var out = {};\n  while (idx < len) {\n    out[keys[idx]] = values[idx];\n    idx += 1;\n  }\n  return out;\n});\n\n//////////////////\n// WEBPACK FOOTER\n// /Users/ivankleshnin/node_modules/ramda/src/zipObj.js\n// module id = 89\n// module chunks = 0\n\n//# sourceURL=webpack:////Users/ivankleshnin/node_modules/ramda/src/zipObj.js?");

/***/ }),
/* 90 */
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\nvar g;\n\n// This works in non-strict mode\ng = function () {\n\treturn this;\n}();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || Function(\"return this\")() || (1, eval)(\"this\");\n} catch (e) {\n\t// This works if the window reference is available\n\tif ((typeof window === \"undefined\" ? \"undefined\" : _typeof(window)) === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n//////////////////\n// WEBPACK FOOTER\n// (webpack)/buildin/global.js\n// module id = 90\n// module chunks = 0\n\n//# sourceURL=webpack:///(webpack)/buildin/global.js?");

/***/ }),
/* 91 */
/*!************************************************!*\
  !*** ./node_modules/rxjs/util/toSubscriber.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ 3);\nvar rxSubscriber_1 = __webpack_require__(/*! ../symbol/rxSubscriber */ 27);\nvar Observer_1 = __webpack_require__(/*! ../Observer */ 41);\nfunction toSubscriber(nextOrObserver, error, complete) {\n    if (nextOrObserver) {\n        if (nextOrObserver instanceof Subscriber_1.Subscriber) {\n            return nextOrObserver;\n        }\n        if (nextOrObserver[rxSubscriber_1.rxSubscriber]) {\n            return nextOrObserver[rxSubscriber_1.rxSubscriber]();\n        }\n    }\n    if (!nextOrObserver && !error && !complete) {\n        return new Subscriber_1.Subscriber(Observer_1.empty);\n    }\n    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);\n}\nexports.toSubscriber = toSubscriber;\n//# sourceMappingURL=toSubscriber.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/toSubscriber.js\n// module id = 91\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/toSubscriber.js?");

/***/ }),
/* 92 */
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/util/UnsubscriptionError.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\n/**\n * An error thrown when one or more errors have occurred during the\n * `unsubscribe` of a {@link Subscription}.\n */\nvar UnsubscriptionError = function (_super) {\n    __extends(UnsubscriptionError, _super);\n    function UnsubscriptionError(errors) {\n        _super.call(this);\n        this.errors = errors;\n        var err = Error.call(this, errors ? errors.length + \" errors occurred during unsubscription:\\n  \" + errors.map(function (err, i) {\n            return i + 1 + \") \" + err.toString();\n        }).join('\\n  ') : '');\n        this.name = err.name = 'UnsubscriptionError';\n        this.stack = err.stack;\n        this.message = err.message;\n    }\n    return UnsubscriptionError;\n}(Error);\nexports.UnsubscriptionError = UnsubscriptionError;\n//# sourceMappingURL=UnsubscriptionError.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/UnsubscriptionError.js\n// module id = 92\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/UnsubscriptionError.js?");

/***/ }),
/* 93 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/scheduler/queue.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar QueueAction_1 = __webpack_require__(/*! ./QueueAction */ 94);\nvar QueueScheduler_1 = __webpack_require__(/*! ./QueueScheduler */ 97);\n/**\n *\n * Queue Scheduler\n *\n * <span class=\"informal\">Put every next task on a queue, instead of executing it immediately</span>\n *\n * `queue` scheduler, when used with delay, behaves the same as {@link async} scheduler.\n *\n * When used without delay, it schedules given task synchronously - executes it right when\n * it is scheduled. However when called recursively, that is when inside the scheduled task,\n * another task is scheduled with queue scheduler, instead of executing immediately as well,\n * that task will be put on a queue and wait for current one to finish.\n *\n * This means that when you execute task with `queue` scheduler, you are sure it will end\n * before any other task scheduled with that scheduler will start.\n *\n * @examples <caption>Schedule recursively first, then do something</caption>\n *\n * Rx.Scheduler.queue.schedule(() => {\n *   Rx.Scheduler.queue.schedule(() => console.log('second')); // will not happen now, but will be put on a queue\n *\n *   console.log('first');\n * });\n *\n * // Logs:\n * // \"first\"\n * // \"second\"\n *\n *\n * @example <caption>Reschedule itself recursively</caption>\n *\n * Rx.Scheduler.queue.schedule(function(state) {\n *   if (state !== 0) {\n *     console.log('before', state);\n *     this.schedule(state - 1); // `this` references currently executing Action,\n *                               // which we reschedule with new state\n *     console.log('after', state);\n *   }\n * }, 0, 3);\n *\n * // In scheduler that runs recursively, you would expect:\n * // \"before\", 3\n * // \"before\", 2\n * // \"before\", 1\n * // \"after\", 1\n * // \"after\", 2\n * // \"after\", 3\n *\n * // But with queue it logs:\n * // \"before\", 3\n * // \"after\", 3\n * // \"before\", 2\n * // \"after\", 2\n * // \"before\", 1\n * // \"after\", 1\n *\n *\n * @static true\n * @name queue\n * @owner Scheduler\n */\nexports.queue = new QueueScheduler_1.QueueScheduler(QueueAction_1.QueueAction);\n//# sourceMappingURL=queue.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/scheduler/queue.js\n// module id = 93\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/queue.js?");

/***/ }),
/* 94 */
/*!****************************************************!*\
  !*** ./node_modules/rxjs/scheduler/QueueAction.js ***!
  \****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar AsyncAction_1 = __webpack_require__(/*! ./AsyncAction */ 95);\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar QueueAction = function (_super) {\n    __extends(QueueAction, _super);\n    function QueueAction(scheduler, work) {\n        _super.call(this, scheduler, work);\n        this.scheduler = scheduler;\n        this.work = work;\n    }\n    QueueAction.prototype.schedule = function (state, delay) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        if (delay > 0) {\n            return _super.prototype.schedule.call(this, state, delay);\n        }\n        this.delay = delay;\n        this.state = state;\n        this.scheduler.flush(this);\n        return this;\n    };\n    QueueAction.prototype.execute = function (state, delay) {\n        return delay > 0 || this.closed ? _super.prototype.execute.call(this, state, delay) : this._execute(state, delay);\n    };\n    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        // If delay exists and is greater than 0, or if the delay is null (the\n        // action wasn't rescheduled) but was originally scheduled as an async\n        // action, then recycle as an async action.\n        if (delay !== null && delay > 0 || delay === null && this.delay > 0) {\n            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);\n        }\n        // Otherwise flush the scheduler starting with this action.\n        return scheduler.flush(this);\n    };\n    return QueueAction;\n}(AsyncAction_1.AsyncAction);\nexports.QueueAction = QueueAction;\n//# sourceMappingURL=QueueAction.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/scheduler/QueueAction.js\n// module id = 94\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/QueueAction.js?");

/***/ }),
/* 95 */
/*!****************************************************!*\
  !*** ./node_modules/rxjs/scheduler/AsyncAction.js ***!
  \****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar root_1 = __webpack_require__(/*! ../util/root */ 5);\nvar Action_1 = __webpack_require__(/*! ./Action */ 96);\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar AsyncAction = function (_super) {\n    __extends(AsyncAction, _super);\n    function AsyncAction(scheduler, work) {\n        _super.call(this, scheduler, work);\n        this.scheduler = scheduler;\n        this.work = work;\n        this.pending = false;\n    }\n    AsyncAction.prototype.schedule = function (state, delay) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        if (this.closed) {\n            return this;\n        }\n        // Always replace the current state with the new state.\n        this.state = state;\n        // Set the pending flag indicating that this action has been scheduled, or\n        // has recursively rescheduled itself.\n        this.pending = true;\n        var id = this.id;\n        var scheduler = this.scheduler;\n        //\n        // Important implementation note:\n        //\n        // Actions only execute once by default, unless rescheduled from within the\n        // scheduled callback. This allows us to implement single and repeat\n        // actions via the same code path, without adding API surface area, as well\n        // as mimic traditional recursion but across asynchronous boundaries.\n        //\n        // However, JS runtimes and timers distinguish between intervals achieved by\n        // serial `setTimeout` calls vs. a single `setInterval` call. An interval of\n        // serial `setTimeout` calls can be individually delayed, which delays\n        // scheduling the next `setTimeout`, and so on. `setInterval` attempts to\n        // guarantee the interval callback will be invoked more precisely to the\n        // interval period, regardless of load.\n        //\n        // Therefore, we use `setInterval` to schedule single and repeat actions.\n        // If the action reschedules itself with the same delay, the interval is not\n        // canceled. If the action doesn't reschedule, or reschedules with a\n        // different delay, the interval will be canceled after scheduled callback\n        // execution.\n        //\n        if (id != null) {\n            this.id = this.recycleAsyncId(scheduler, id, delay);\n        }\n        this.delay = delay;\n        // If this action has already an async Id, don't request a new one.\n        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);\n        return this;\n    };\n    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        return root_1.root.setInterval(scheduler.flush.bind(scheduler, this), delay);\n    };\n    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        // If this action is rescheduled with the same delay time, don't clear the interval id.\n        if (delay !== null && this.delay === delay && this.pending === false) {\n            return id;\n        }\n        // Otherwise, if the action's delay time is different from the current delay,\n        // or the action has been rescheduled before it's executed, clear the interval id\n        return root_1.root.clearInterval(id) && undefined || undefined;\n    };\n    /**\n     * Immediately executes this action and the `work` it contains.\n     * @return {any}\n     */\n    AsyncAction.prototype.execute = function (state, delay) {\n        if (this.closed) {\n            return new Error('executing a cancelled action');\n        }\n        this.pending = false;\n        var error = this._execute(state, delay);\n        if (error) {\n            return error;\n        } else if (this.pending === false && this.id != null) {\n            // Dequeue if the action didn't reschedule itself. Don't call\n            // unsubscribe(), because the action could reschedule later.\n            // For example:\n            // ```\n            // scheduler.schedule(function doWork(counter) {\n            //   /* ... I'm a busy worker bee ... */\n            //   var originalAction = this;\n            //   /* wait 100ms before rescheduling the action */\n            //   setTimeout(function () {\n            //     originalAction.schedule(counter + 1);\n            //   }, 100);\n            // }, 1000);\n            // ```\n            this.id = this.recycleAsyncId(this.scheduler, this.id, null);\n        }\n    };\n    AsyncAction.prototype._execute = function (state, delay) {\n        var errored = false;\n        var errorValue = undefined;\n        try {\n            this.work(state);\n        } catch (e) {\n            errored = true;\n            errorValue = !!e && e || new Error(e);\n        }\n        if (errored) {\n            this.unsubscribe();\n            return errorValue;\n        }\n    };\n    AsyncAction.prototype._unsubscribe = function () {\n        var id = this.id;\n        var scheduler = this.scheduler;\n        var actions = scheduler.actions;\n        var index = actions.indexOf(this);\n        this.work = null;\n        this.state = null;\n        this.pending = false;\n        this.scheduler = null;\n        if (index !== -1) {\n            actions.splice(index, 1);\n        }\n        if (id != null) {\n            this.id = this.recycleAsyncId(scheduler, id, null);\n        }\n        this.delay = null;\n    };\n    return AsyncAction;\n}(Action_1.Action);\nexports.AsyncAction = AsyncAction;\n//# sourceMappingURL=AsyncAction.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/scheduler/AsyncAction.js\n// module id = 95\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/AsyncAction.js?");

/***/ }),
/* 96 */
/*!***********************************************!*\
  !*** ./node_modules/rxjs/scheduler/Action.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscription_1 = __webpack_require__(/*! ../Subscription */ 6);\n/**\n * A unit of work to be executed in a {@link Scheduler}. An action is typically\n * created from within a Scheduler and an RxJS user does not need to concern\n * themselves about creating and manipulating an Action.\n *\n * ```ts\n * class Action<T> extends Subscription {\n *   new (scheduler: Scheduler, work: (state?: T) => void);\n *   schedule(state?: T, delay: number = 0): Subscription;\n * }\n * ```\n *\n * @class Action<T>\n */\nvar Action = function (_super) {\n    __extends(Action, _super);\n    function Action(scheduler, work) {\n        _super.call(this);\n    }\n    /**\n     * Schedules this action on its parent Scheduler for execution. May be passed\n     * some context object, `state`. May happen at some point in the future,\n     * according to the `delay` parameter, if specified.\n     * @param {T} [state] Some contextual data that the `work` function uses when\n     * called by the Scheduler.\n     * @param {number} [delay] Time to wait before executing the work, where the\n     * time unit is implicit and defined by the Scheduler.\n     * @return {void}\n     */\n    Action.prototype.schedule = function (state, delay) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        return this;\n    };\n    return Action;\n}(Subscription_1.Subscription);\nexports.Action = Action;\n//# sourceMappingURL=Action.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/scheduler/Action.js\n// module id = 96\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/Action.js?");

/***/ }),
/* 97 */
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/scheduler/QueueScheduler.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar AsyncScheduler_1 = __webpack_require__(/*! ./AsyncScheduler */ 98);\nvar QueueScheduler = function (_super) {\n    __extends(QueueScheduler, _super);\n    function QueueScheduler() {\n        _super.apply(this, arguments);\n    }\n    return QueueScheduler;\n}(AsyncScheduler_1.AsyncScheduler);\nexports.QueueScheduler = QueueScheduler;\n//# sourceMappingURL=QueueScheduler.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/scheduler/QueueScheduler.js\n// module id = 97\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/QueueScheduler.js?");

/***/ }),
/* 98 */
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/scheduler/AsyncScheduler.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Scheduler_1 = __webpack_require__(/*! ../Scheduler */ 99);\nvar AsyncScheduler = function (_super) {\n    __extends(AsyncScheduler, _super);\n    function AsyncScheduler() {\n        _super.apply(this, arguments);\n        this.actions = [];\n        /**\n         * A flag to indicate whether the Scheduler is currently executing a batch of\n         * queued actions.\n         * @type {boolean}\n         */\n        this.active = false;\n        /**\n         * An internal ID used to track the latest asynchronous task such as those\n         * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and\n         * others.\n         * @type {any}\n         */\n        this.scheduled = undefined;\n    }\n    AsyncScheduler.prototype.flush = function (action) {\n        var actions = this.actions;\n        if (this.active) {\n            actions.push(action);\n            return;\n        }\n        var error;\n        this.active = true;\n        do {\n            if (error = action.execute(action.state, action.delay)) {\n                break;\n            }\n        } while (action = actions.shift()); // exhaust the scheduler queue\n        this.active = false;\n        if (error) {\n            while (action = actions.shift()) {\n                action.unsubscribe();\n            }\n            throw error;\n        }\n    };\n    return AsyncScheduler;\n}(Scheduler_1.Scheduler);\nexports.AsyncScheduler = AsyncScheduler;\n//# sourceMappingURL=AsyncScheduler.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/scheduler/AsyncScheduler.js\n// module id = 98\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/scheduler/AsyncScheduler.js?");

/***/ }),
/* 99 */
/*!****************************************!*\
  !*** ./node_modules/rxjs/Scheduler.js ***!
  \****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n/**\n * An execution context and a data structure to order tasks and schedule their\n * execution. Provides a notion of (potentially virtual) time, through the\n * `now()` getter method.\n *\n * Each unit of work in a Scheduler is called an {@link Action}.\n *\n * ```ts\n * class Scheduler {\n *   now(): number;\n *   schedule(work, delay?, state?): Subscription;\n * }\n * ```\n *\n * @class Scheduler\n */\n\nvar Scheduler = function () {\n    function Scheduler(SchedulerAction, now) {\n        if (now === void 0) {\n            now = Scheduler.now;\n        }\n        this.SchedulerAction = SchedulerAction;\n        this.now = now;\n    }\n    /**\n     * Schedules a function, `work`, for execution. May happen at some point in\n     * the future, according to the `delay` parameter, if specified. May be passed\n     * some context object, `state`, which will be passed to the `work` function.\n     *\n     * The given arguments will be processed an stored as an Action object in a\n     * queue of actions.\n     *\n     * @param {function(state: ?T): ?Subscription} work A function representing a\n     * task, or some unit of work to be executed by the Scheduler.\n     * @param {number} [delay] Time to wait before executing the work, where the\n     * time unit is implicit and defined by the Scheduler itself.\n     * @param {T} [state] Some contextual data that the `work` function uses when\n     * called by the Scheduler.\n     * @return {Subscription} A subscription in order to be able to unsubscribe\n     * the scheduled work.\n     */\n    Scheduler.prototype.schedule = function (work, delay, state) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        return new this.SchedulerAction(this, work).schedule(state, delay);\n    };\n    Scheduler.now = Date.now ? Date.now : function () {\n        return +new Date();\n    };\n    return Scheduler;\n}();\nexports.Scheduler = Scheduler;\n//# sourceMappingURL=Scheduler.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/Scheduler.js\n// module id = 99\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/Scheduler.js?");

/***/ }),
/* 100 */
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operator/observeOn.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ 3);\nvar Notification_1 = __webpack_require__(/*! ../Notification */ 101);\n/**\n *\n * Re-emits all notifications from source Observable with specified scheduler.\n *\n * <span class=\"informal\">Ensure a specific scheduler is used, from outside of an Observable.</span>\n *\n * `observeOn` is an operator that accepts a scheduler as a first parameter, which will be used to reschedule\n * notifications emitted by the source Observable. It might be useful, if you do not have control over\n * internal scheduler of a given Observable, but want to control when its values are emitted nevertheless.\n *\n * Returned Observable emits the same notifications (nexted values, complete and error events) as the source Observable,\n * but rescheduled with provided scheduler. Note that this doesn't mean that source Observables internal\n * scheduler will be replaced in any way. Original scheduler still will be used, but when the source Observable emits\n * notification, it will be immediately scheduled again - this time with scheduler passed to `observeOn`.\n * An anti-pattern would be calling `observeOn` on Observable that emits lots of values synchronously, to split\n * that emissions into asynchronous chunks. For this to happen, scheduler would have to be passed into the source\n * Observable directly (usually into the operator that creates it). `observeOn` simply delays notifications a\n * little bit more, to ensure that they are emitted at expected moments.\n *\n * As a matter of fact, `observeOn` accepts second parameter, which specifies in milliseconds with what delay notifications\n * will be emitted. The main difference between {@link delay} operator and `observeOn` is that `observeOn`\n * will delay all notifications - including error notifications - while `delay` will pass through error\n * from source Observable immediately when it is emitted. In general it is highly recommended to use `delay` operator\n * for any kind of delaying of values in the stream, while using `observeOn` to specify which scheduler should be used\n * for notification emissions in general.\n *\n * @example <caption>Ensure values in subscribe are called just before browser repaint.</caption>\n * const intervals = Rx.Observable.interval(10); // Intervals are scheduled\n *                                               // with async scheduler by default...\n *\n * intervals\n * .observeOn(Rx.Scheduler.animationFrame)       // ...but we will observe on animationFrame\n * .subscribe(val => {                           // scheduler to ensure smooth animation.\n *   someDiv.style.height = val + 'px';\n * });\n *\n * @see {@link delay}\n *\n * @param {IScheduler} scheduler Scheduler that will be used to reschedule notifications from source Observable.\n * @param {number} [delay] Number of milliseconds that states with what delay every notification should be rescheduled.\n * @return {Observable<T>} Observable that emits the same notifications as the source Observable,\n * but with provided scheduler.\n *\n * @method observeOn\n * @owner Observable\n */\nfunction observeOn(scheduler, delay) {\n    if (delay === void 0) {\n        delay = 0;\n    }\n    return this.lift(new ObserveOnOperator(scheduler, delay));\n}\nexports.observeOn = observeOn;\nvar ObserveOnOperator = function () {\n    function ObserveOnOperator(scheduler, delay) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        this.scheduler = scheduler;\n        this.delay = delay;\n    }\n    ObserveOnOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));\n    };\n    return ObserveOnOperator;\n}();\nexports.ObserveOnOperator = ObserveOnOperator;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar ObserveOnSubscriber = function (_super) {\n    __extends(ObserveOnSubscriber, _super);\n    function ObserveOnSubscriber(destination, scheduler, delay) {\n        if (delay === void 0) {\n            delay = 0;\n        }\n        _super.call(this, destination);\n        this.scheduler = scheduler;\n        this.delay = delay;\n    }\n    ObserveOnSubscriber.dispatch = function (arg) {\n        var notification = arg.notification,\n            destination = arg.destination;\n        notification.observe(destination);\n        this.unsubscribe();\n    };\n    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {\n        this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));\n    };\n    ObserveOnSubscriber.prototype._next = function (value) {\n        this.scheduleMessage(Notification_1.Notification.createNext(value));\n    };\n    ObserveOnSubscriber.prototype._error = function (err) {\n        this.scheduleMessage(Notification_1.Notification.createError(err));\n    };\n    ObserveOnSubscriber.prototype._complete = function () {\n        this.scheduleMessage(Notification_1.Notification.createComplete());\n    };\n    return ObserveOnSubscriber;\n}(Subscriber_1.Subscriber);\nexports.ObserveOnSubscriber = ObserveOnSubscriber;\nvar ObserveOnMessage = function () {\n    function ObserveOnMessage(notification, destination) {\n        this.notification = notification;\n        this.destination = destination;\n    }\n    return ObserveOnMessage;\n}();\nexports.ObserveOnMessage = ObserveOnMessage;\n//# sourceMappingURL=observeOn.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/observeOn.js\n// module id = 100\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/observeOn.js?");

/***/ }),
/* 101 */
/*!*******************************************!*\
  !*** ./node_modules/rxjs/Notification.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ./Observable */ 0);\n/**\n * Represents a push-based event or value that an {@link Observable} can emit.\n * This class is particularly useful for operators that manage notifications,\n * like {@link materialize}, {@link dematerialize}, {@link observeOn}, and\n * others. Besides wrapping the actual delivered value, it also annotates it\n * with metadata of, for instance, what type of push message it is (`next`,\n * `error`, or `complete`).\n *\n * @see {@link materialize}\n * @see {@link dematerialize}\n * @see {@link observeOn}\n *\n * @class Notification<T>\n */\nvar Notification = function () {\n    function Notification(kind, value, error) {\n        this.kind = kind;\n        this.value = value;\n        this.error = error;\n        this.hasValue = kind === 'N';\n    }\n    /**\n     * Delivers to the given `observer` the value wrapped by this Notification.\n     * @param {Observer} observer\n     * @return\n     */\n    Notification.prototype.observe = function (observer) {\n        switch (this.kind) {\n            case 'N':\n                return observer.next && observer.next(this.value);\n            case 'E':\n                return observer.error && observer.error(this.error);\n            case 'C':\n                return observer.complete && observer.complete();\n        }\n    };\n    /**\n     * Given some {@link Observer} callbacks, deliver the value represented by the\n     * current Notification to the correctly corresponding callback.\n     * @param {function(value: T): void} next An Observer `next` callback.\n     * @param {function(err: any): void} [error] An Observer `error` callback.\n     * @param {function(): void} [complete] An Observer `complete` callback.\n     * @return {any}\n     */\n    Notification.prototype.do = function (next, error, complete) {\n        var kind = this.kind;\n        switch (kind) {\n            case 'N':\n                return next && next(this.value);\n            case 'E':\n                return error && error(this.error);\n            case 'C':\n                return complete && complete();\n        }\n    };\n    /**\n     * Takes an Observer or its individual callback functions, and calls `observe`\n     * or `do` methods accordingly.\n     * @param {Observer|function(value: T): void} nextOrObserver An Observer or\n     * the `next` callback.\n     * @param {function(err: any): void} [error] An Observer `error` callback.\n     * @param {function(): void} [complete] An Observer `complete` callback.\n     * @return {any}\n     */\n    Notification.prototype.accept = function (nextOrObserver, error, complete) {\n        if (nextOrObserver && typeof nextOrObserver.next === 'function') {\n            return this.observe(nextOrObserver);\n        } else {\n            return this.do(nextOrObserver, error, complete);\n        }\n    };\n    /**\n     * Returns a simple Observable that just delivers the notification represented\n     * by this Notification instance.\n     * @return {any}\n     */\n    Notification.prototype.toObservable = function () {\n        var kind = this.kind;\n        switch (kind) {\n            case 'N':\n                return Observable_1.Observable.of(this.value);\n            case 'E':\n                return Observable_1.Observable.throw(this.error);\n            case 'C':\n                return Observable_1.Observable.empty();\n        }\n        throw new Error('unexpected notification kind value');\n    };\n    /**\n     * A shortcut to create a Notification instance of the type `next` from a\n     * given value.\n     * @param {T} value The `next` value.\n     * @return {Notification<T>} The \"next\" Notification representing the\n     * argument.\n     */\n    Notification.createNext = function (value) {\n        if (typeof value !== 'undefined') {\n            return new Notification('N', value);\n        }\n        return Notification.undefinedValueNotification;\n    };\n    /**\n     * A shortcut to create a Notification instance of the type `error` from a\n     * given error.\n     * @param {any} [err] The `error` error.\n     * @return {Notification<T>} The \"error\" Notification representing the\n     * argument.\n     */\n    Notification.createError = function (err) {\n        return new Notification('E', undefined, err);\n    };\n    /**\n     * A shortcut to create a Notification instance of the type `complete`.\n     * @return {Notification<any>} The valueless \"complete\" Notification.\n     */\n    Notification.createComplete = function () {\n        return Notification.completeNotification;\n    };\n    Notification.completeNotification = new Notification('C');\n    Notification.undefinedValueNotification = new Notification('N', undefined);\n    return Notification;\n}();\nexports.Notification = Notification;\n//# sourceMappingURL=Notification.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/Notification.js\n// module id = 101\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/Notification.js?");

/***/ }),
/* 102 */
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/add/observable/combineLatest.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar combineLatest_1 = __webpack_require__(/*! ../../observable/combineLatest */ 103);\nObservable_1.Observable.combineLatest = combineLatest_1.combineLatest;\n//# sourceMappingURL=combineLatest.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/observable/combineLatest.js\n// module id = 102\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/observable/combineLatest.js?");

/***/ }),
/* 103 */
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/observable/combineLatest.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ 9);\nvar isArray_1 = __webpack_require__(/*! ../util/isArray */ 25);\nvar ArrayObservable_1 = __webpack_require__(/*! ./ArrayObservable */ 7);\nvar combineLatest_1 = __webpack_require__(/*! ../operator/combineLatest */ 104);\n/* tslint:enable:max-line-length */\n/**\n * Combines multiple Observables to create an Observable whose values are\n * calculated from the latest values of each of its input Observables.\n *\n * <span class=\"informal\">Whenever any input Observable emits a value, it\n * computes a formula using the latest values from all the inputs, then emits\n * the output of that formula.</span>\n *\n * <img src=\"./img/combineLatest.png\" width=\"100%\">\n *\n * `combineLatest` combines the values from all the Observables passed as\n * arguments. This is done by subscribing to each Observable in order and,\n * whenever any Observable emits, collecting an array of the most recent\n * values from each Observable. So if you pass `n` Observables to operator,\n * returned Observable will always emit an array of `n` values, in order\n * corresponding to order of passed Observables (value from the first Observable\n * on the first place and so on).\n *\n * Static version of `combineLatest` accepts either an array of Observables\n * or each Observable can be put directly as an argument. Note that array of\n * Observables is good choice, if you don't know beforehand how many Observables\n * you will combine. Passing empty array will result in Observable that\n * completes immediately.\n *\n * To ensure output array has always the same length, `combineLatest` will\n * actually wait for all input Observables to emit at least once,\n * before it starts emitting results. This means if some Observable emits\n * values before other Observables started emitting, all that values but last\n * will be lost. On the other hand, is some Observable does not emit value but\n * completes, resulting Observable will complete at the same moment without\n * emitting anything, since it will be now impossible to include value from\n * completed Observable in resulting array. Also, if some input Observable does\n * not emit any value and never completes, `combineLatest` will also never emit\n * and never complete, since, again, it will wait for all streams to emit some\n * value.\n *\n * If at least one Observable was passed to `combineLatest` and all passed Observables\n * emitted something, resulting Observable will complete when all combined\n * streams complete. So even if some Observable completes, result of\n * `combineLatest` will still emit values when other Observables do. In case\n * of completed Observable, its value from now on will always be the last\n * emitted value. On the other hand, if any Observable errors, `combineLatest`\n * will error immediately as well, and all other Observables will be unsubscribed.\n *\n * `combineLatest` accepts as optional parameter `project` function, which takes\n * as arguments all values that would normally be emitted by resulting Observable.\n * `project` can return any kind of value, which will be then emitted by Observable\n * instead of default array. Note that `project` does not take as argument that array\n * of values, but values themselves. That means default `project` can be imagined\n * as function that takes all its arguments and puts them into an array.\n *\n *\n * @example <caption>Combine two timer Observables</caption>\n * const firstTimer = Rx.Observable.timer(0, 1000); // emit 0, 1, 2... after every second, starting from now\n * const secondTimer = Rx.Observable.timer(500, 1000); // emit 0, 1, 2... after every second, starting 0,5s from now\n * const combinedTimers = Rx.Observable.combineLatest(firstTimer, secondTimer);\n * combinedTimers.subscribe(value => console.log(value));\n * // Logs\n * // [0, 0] after 0.5s\n * // [1, 0] after 1s\n * // [1, 1] after 1.5s\n * // [2, 1] after 2s\n *\n *\n * @example <caption>Combine an array of Observables</caption>\n * const observables = [1, 5, 10].map(\n *   n => Rx.Observable.of(n).delay(n * 1000).startWith(0) // emit 0 and then emit n after n seconds\n * );\n * const combined = Rx.Observable.combineLatest(observables);\n * combined.subscribe(value => console.log(value));\n * // Logs\n * // [0, 0, 0] immediately\n * // [1, 0, 0] after 1s\n * // [1, 5, 0] after 5s\n * // [1, 5, 10] after 10s\n *\n *\n * @example <caption>Use project function to dynamically calculate the Body-Mass Index</caption>\n * var weight = Rx.Observable.of(70, 72, 76, 79, 75);\n * var height = Rx.Observable.of(1.76, 1.77, 1.78);\n * var bmi = Rx.Observable.combineLatest(weight, height, (w, h) => w / (h * h));\n * bmi.subscribe(x => console.log('BMI is ' + x));\n *\n * // With output to console:\n * // BMI is 24.212293388429753\n * // BMI is 23.93948099205209\n * // BMI is 23.671253629592222\n *\n *\n * @see {@link combineAll}\n * @see {@link merge}\n * @see {@link withLatestFrom}\n *\n * @param {ObservableInput} observable1 An input Observable to combine with other Observables.\n * @param {ObservableInput} observable2 An input Observable to combine with other Observables.\n * More than one input Observables may be given as arguments\n * or an array of Observables may be given as the first argument.\n * @param {function} [project] An optional function to project the values from\n * the combined latest values into a new value on the output Observable.\n * @param {Scheduler} [scheduler=null] The IScheduler to use for subscribing to\n * each input Observable.\n * @return {Observable} An Observable of projected values from the most recent\n * values from each input Observable, or an array of the most recent values from\n * each input Observable.\n * @static true\n * @name combineLatest\n * @owner Observable\n */\nfunction combineLatest() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    var project = null;\n    var scheduler = null;\n    if (isScheduler_1.isScheduler(observables[observables.length - 1])) {\n        scheduler = observables.pop();\n    }\n    if (typeof observables[observables.length - 1] === 'function') {\n        project = observables.pop();\n    }\n    // if the first and only other argument besides the resultSelector is an array\n    // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`\n    if (observables.length === 1 && isArray_1.isArray(observables[0])) {\n        observables = observables[0];\n    }\n    return new ArrayObservable_1.ArrayObservable(observables, scheduler).lift(new combineLatest_1.CombineLatestOperator(project));\n}\nexports.combineLatest = combineLatest;\n//# sourceMappingURL=combineLatest.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/observable/combineLatest.js\n// module id = 103\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/combineLatest.js?");

/***/ }),
/* 104 */
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/operator/combineLatest.js ***!
  \*****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar ArrayObservable_1 = __webpack_require__(/*! ../observable/ArrayObservable */ 7);\nvar isArray_1 = __webpack_require__(/*! ../util/isArray */ 25);\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ 13);\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ 14);\nvar none = {};\n/* tslint:enable:max-line-length */\n/**\n * Combines multiple Observables to create an Observable whose values are\n * calculated from the latest values of each of its input Observables.\n *\n * <span class=\"informal\">Whenever any input Observable emits a value, it\n * computes a formula using the latest values from all the inputs, then emits\n * the output of that formula.</span>\n *\n * <img src=\"./img/combineLatest.png\" width=\"100%\">\n *\n * `combineLatest` combines the values from this Observable with values from\n * Observables passed as arguments. This is done by subscribing to each\n * Observable, in order, and collecting an array of each of the most recent\n * values any time any of the input Observables emits, then either taking that\n * array and passing it as arguments to an optional `project` function and\n * emitting the return value of that, or just emitting the array of recent\n * values directly if there is no `project` function.\n *\n * @example <caption>Dynamically calculate the Body-Mass Index from an Observable of weight and one for height</caption>\n * var weight = Rx.Observable.of(70, 72, 76, 79, 75);\n * var height = Rx.Observable.of(1.76, 1.77, 1.78);\n * var bmi = weight.combineLatest(height, (w, h) => w / (h * h));\n * bmi.subscribe(x => console.log('BMI is ' + x));\n *\n * // With output to console:\n * // BMI is 24.212293388429753\n * // BMI is 23.93948099205209\n * // BMI is 23.671253629592222\n *\n * @see {@link combineAll}\n * @see {@link merge}\n * @see {@link withLatestFrom}\n *\n * @param {ObservableInput} other An input Observable to combine with the source\n * Observable. More than one input Observables may be given as argument.\n * @param {function} [project] An optional function to project the values from\n * the combined latest values into a new value on the output Observable.\n * @return {Observable} An Observable of projected values from the most recent\n * values from each input Observable, or an array of the most recent values from\n * each input Observable.\n * @method combineLatest\n * @owner Observable\n */\nfunction combineLatest() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    var project = null;\n    if (typeof observables[observables.length - 1] === 'function') {\n        project = observables.pop();\n    }\n    // if the first and only other argument besides the resultSelector is an array\n    // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`\n    if (observables.length === 1 && isArray_1.isArray(observables[0])) {\n        observables = observables[0].slice();\n    }\n    observables.unshift(this);\n    return this.lift.call(new ArrayObservable_1.ArrayObservable(observables), new CombineLatestOperator(project));\n}\nexports.combineLatest = combineLatest;\nvar CombineLatestOperator = function () {\n    function CombineLatestOperator(project) {\n        this.project = project;\n    }\n    CombineLatestOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new CombineLatestSubscriber(subscriber, this.project));\n    };\n    return CombineLatestOperator;\n}();\nexports.CombineLatestOperator = CombineLatestOperator;\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar CombineLatestSubscriber = function (_super) {\n    __extends(CombineLatestSubscriber, _super);\n    function CombineLatestSubscriber(destination, project) {\n        _super.call(this, destination);\n        this.project = project;\n        this.active = 0;\n        this.values = [];\n        this.observables = [];\n    }\n    CombineLatestSubscriber.prototype._next = function (observable) {\n        this.values.push(none);\n        this.observables.push(observable);\n    };\n    CombineLatestSubscriber.prototype._complete = function () {\n        var observables = this.observables;\n        var len = observables.length;\n        if (len === 0) {\n            this.destination.complete();\n        } else {\n            this.active = len;\n            this.toRespond = len;\n            for (var i = 0; i < len; i++) {\n                var observable = observables[i];\n                this.add(subscribeToResult_1.subscribeToResult(this, observable, observable, i));\n            }\n        }\n    };\n    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {\n        if ((this.active -= 1) === 0) {\n            this.destination.complete();\n        }\n    };\n    CombineLatestSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        var values = this.values;\n        var oldVal = values[outerIndex];\n        var toRespond = !this.toRespond ? 0 : oldVal === none ? --this.toRespond : this.toRespond;\n        values[outerIndex] = innerValue;\n        if (toRespond === 0) {\n            if (this.project) {\n                this._tryProject(values);\n            } else {\n                this.destination.next(values.slice());\n            }\n        }\n    };\n    CombineLatestSubscriber.prototype._tryProject = function (values) {\n        var result;\n        try {\n            result = this.project.apply(this, values);\n        } catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        this.destination.next(result);\n    };\n    return CombineLatestSubscriber;\n}(OuterSubscriber_1.OuterSubscriber);\nexports.CombineLatestSubscriber = CombineLatestSubscriber;\n//# sourceMappingURL=combineLatest.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/combineLatest.js\n// module id = 104\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/combineLatest.js?");

/***/ }),
/* 105 */
/*!***********************************************!*\
  !*** ./node_modules/rxjs/util/isArrayLike.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nexports.isArrayLike = function (x) {\n  return x && typeof x.length === 'number';\n};\n//# sourceMappingURL=isArrayLike.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/isArrayLike.js\n// module id = 105\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isArrayLike.js?");

/***/ }),
/* 106 */
/*!*********************************************!*\
  !*** ./node_modules/rxjs/util/isPromise.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction isPromise(value) {\n    return value && typeof value.subscribe !== 'function' && typeof value.then === 'function';\n}\nexports.isPromise = isPromise;\n//# sourceMappingURL=isPromise.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/util/isPromise.js\n// module id = 106\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/util/isPromise.js?");

/***/ }),
/* 107 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/symbol/iterator.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar root_1 = __webpack_require__(/*! ../util/root */ 5);\nfunction symbolIteratorPonyfill(root) {\n    var _Symbol = root.Symbol;\n    if (typeof _Symbol === 'function') {\n        if (!_Symbol.iterator) {\n            _Symbol.iterator = _Symbol('iterator polyfill');\n        }\n        return _Symbol.iterator;\n    } else {\n        // [for Mozilla Gecko 27-35:](https://mzl.la/2ewE1zC)\n        var Set_1 = root.Set;\n        if (Set_1 && typeof new Set_1()['@@iterator'] === 'function') {\n            return '@@iterator';\n        }\n        var Map_1 = root.Map;\n        // required for compatability with es6-shim\n        if (Map_1) {\n            var keys = Object.getOwnPropertyNames(Map_1.prototype);\n            for (var i = 0; i < keys.length; ++i) {\n                var key = keys[i];\n                // according to spec, Map.prototype[@@iterator] and Map.orototype.entries must be equal.\n                if (key !== 'entries' && key !== 'size' && Map_1.prototype[key] === Map_1.prototype['entries']) {\n                    return key;\n                }\n            }\n        }\n        return '@@iterator';\n    }\n}\nexports.symbolIteratorPonyfill = symbolIteratorPonyfill;\nexports.iterator = symbolIteratorPonyfill(root_1.root);\n/**\n * @deprecated use iterator instead\n */\nexports.$$iterator = exports.iterator;\n//# sourceMappingURL=iterator.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/symbol/iterator.js\n// module id = 107\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/symbol/iterator.js?");

/***/ }),
/* 108 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/InnerSubscriber.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ./Subscriber */ 3);\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar InnerSubscriber = function (_super) {\n    __extends(InnerSubscriber, _super);\n    function InnerSubscriber(parent, outerValue, outerIndex) {\n        _super.call(this);\n        this.parent = parent;\n        this.outerValue = outerValue;\n        this.outerIndex = outerIndex;\n        this.index = 0;\n    }\n    InnerSubscriber.prototype._next = function (value) {\n        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);\n    };\n    InnerSubscriber.prototype._error = function (error) {\n        this.parent.notifyError(error, this);\n        this.unsubscribe();\n    };\n    InnerSubscriber.prototype._complete = function () {\n        this.parent.notifyComplete(this);\n        this.unsubscribe();\n    };\n    return InnerSubscriber;\n}(Subscriber_1.Subscriber);\nexports.InnerSubscriber = InnerSubscriber;\n//# sourceMappingURL=InnerSubscriber.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/InnerSubscriber.js\n// module id = 108\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/InnerSubscriber.js?");

/***/ }),
/* 109 */
/*!***************************************************!*\
  !*** ./node_modules/rxjs/add/observable/merge.js ***!
  \***************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar merge_1 = __webpack_require__(/*! ../../observable/merge */ 110);\nObservable_1.Observable.merge = merge_1.merge;\n//# sourceMappingURL=merge.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/observable/merge.js\n// module id = 109\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/observable/merge.js?");

/***/ }),
/* 110 */
/*!***********************************************!*\
  !*** ./node_modules/rxjs/observable/merge.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar merge_1 = __webpack_require__(/*! ../operator/merge */ 111);\nexports.merge = merge_1.mergeStatic;\n//# sourceMappingURL=merge.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/observable/merge.js\n// module id = 110\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/merge.js?");

/***/ }),
/* 111 */
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operator/merge.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../Observable */ 0);\nvar ArrayObservable_1 = __webpack_require__(/*! ../observable/ArrayObservable */ 7);\nvar mergeAll_1 = __webpack_require__(/*! ./mergeAll */ 48);\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ 9);\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which concurrently emits all values from every\n * given input Observable.\n *\n * <span class=\"informal\">Flattens multiple Observables together by blending\n * their values into one Observable.</span>\n *\n * <img src=\"./img/merge.png\" width=\"100%\">\n *\n * `merge` subscribes to each given input Observable (either the source or an\n * Observable given as argument), and simply forwards (without doing any\n * transformation) all the values from all the input Observables to the output\n * Observable. The output Observable only completes once all input Observables\n * have completed. Any error delivered by an input Observable will be immediately\n * emitted on the output Observable.\n *\n * @example <caption>Merge together two Observables: 1s interval and clicks</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var timer = Rx.Observable.interval(1000);\n * var clicksOrTimer = clicks.merge(timer);\n * clicksOrTimer.subscribe(x => console.log(x));\n *\n * @example <caption>Merge together 3 Observables, but only 2 run concurrently</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var concurrent = 2; // the argument\n * var merged = timer1.merge(timer2, timer3, concurrent);\n * merged.subscribe(x => console.log(x));\n *\n * @see {@link mergeAll}\n * @see {@link mergeMap}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n *\n * @param {ObservableInput} other An input Observable to merge with the source\n * Observable. More than one input Observables may be given as argument.\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input\n * Observables being subscribed to concurrently.\n * @param {Scheduler} [scheduler=null] The IScheduler to use for managing\n * concurrency of input Observables.\n * @return {Observable} An Observable that emits items that are the result of\n * every input Observable.\n * @method merge\n * @owner Observable\n */\nfunction merge() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    return this.lift.call(mergeStatic.apply(void 0, [this].concat(observables)));\n}\nexports.merge = merge;\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which concurrently emits all values from every\n * given input Observable.\n *\n * <span class=\"informal\">Flattens multiple Observables together by blending\n * their values into one Observable.</span>\n *\n * <img src=\"./img/merge.png\" width=\"100%\">\n *\n * `merge` subscribes to each given input Observable (as arguments), and simply\n * forwards (without doing any transformation) all the values from all the input\n * Observables to the output Observable. The output Observable only completes\n * once all input Observables have completed. Any error delivered by an input\n * Observable will be immediately emitted on the output Observable.\n *\n * @example <caption>Merge together two Observables: 1s interval and clicks</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var timer = Rx.Observable.interval(1000);\n * var clicksOrTimer = Rx.Observable.merge(clicks, timer);\n * clicksOrTimer.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // timer will emit ascending values, one every second(1000ms) to console\n * // clicks logs MouseEvents to console everytime the \"document\" is clicked\n * // Since the two streams are merged you see these happening\n * // as they occur.\n *\n * @example <caption>Merge together 3 Observables, but only 2 run concurrently</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var concurrent = 2; // the argument\n * var merged = Rx.Observable.merge(timer1, timer2, timer3, concurrent);\n * merged.subscribe(x => console.log(x));\n *\n * // Results in the following:\n * // - First timer1 and timer2 will run concurrently\n * // - timer1 will emit a value every 1000ms for 10 iterations\n * // - timer2 will emit a value every 2000ms for 6 iterations\n * // - after timer1 hits it's max iteration, timer2 will\n * //   continue, and timer3 will start to run concurrently with timer2\n * // - when timer2 hits it's max iteration it terminates, and\n * //   timer3 will continue to emit a value every 500ms until it is complete\n *\n * @see {@link mergeAll}\n * @see {@link mergeMap}\n * @see {@link mergeMapTo}\n * @see {@link mergeScan}\n *\n * @param {...ObservableInput} observables Input Observables to merge together.\n * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input\n * Observables being subscribed to concurrently.\n * @param {Scheduler} [scheduler=null] The IScheduler to use for managing\n * concurrency of input Observables.\n * @return {Observable} an Observable that emits items that are the result of\n * every input Observable.\n * @static true\n * @name merge\n * @owner Observable\n */\nfunction mergeStatic() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    var concurrent = Number.POSITIVE_INFINITY;\n    var scheduler = null;\n    var last = observables[observables.length - 1];\n    if (isScheduler_1.isScheduler(last)) {\n        scheduler = observables.pop();\n        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {\n            concurrent = observables.pop();\n        }\n    } else if (typeof last === 'number') {\n        concurrent = observables.pop();\n    }\n    if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable_1.Observable) {\n        return observables[0];\n    }\n    return new ArrayObservable_1.ArrayObservable(observables, scheduler).lift(new mergeAll_1.MergeAllOperator(concurrent));\n}\nexports.mergeStatic = mergeStatic;\n//# sourceMappingURL=merge.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/merge.js\n// module id = 111\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/merge.js?");

/***/ }),
/* 112 */
/*!************************************************!*\
  !*** ./node_modules/rxjs/add/observable/of.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar of_1 = __webpack_require__(/*! ../../observable/of */ 113);\nObservable_1.Observable.of = of_1.of;\n//# sourceMappingURL=of.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/observable/of.js\n// module id = 112\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/observable/of.js?");

/***/ }),
/* 113 */
/*!********************************************!*\
  !*** ./node_modules/rxjs/observable/of.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar ArrayObservable_1 = __webpack_require__(/*! ./ArrayObservable */ 7);\nexports.of = ArrayObservable_1.ArrayObservable.of;\n//# sourceMappingURL=of.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/observable/of.js\n// module id = 113\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/of.js?");

/***/ }),
/* 114 */
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/add/operator/distinctUntilChanged.js ***!
  \****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar distinctUntilChanged_1 = __webpack_require__(/*! ../../operator/distinctUntilChanged */ 115);\nObservable_1.Observable.prototype.distinctUntilChanged = distinctUntilChanged_1.distinctUntilChanged;\n//# sourceMappingURL=distinctUntilChanged.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/distinctUntilChanged.js\n// module id = 114\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/distinctUntilChanged.js?");

/***/ }),
/* 115 */
/*!************************************************************!*\
  !*** ./node_modules/rxjs/operator/distinctUntilChanged.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ 3);\nvar tryCatch_1 = __webpack_require__(/*! ../util/tryCatch */ 40);\nvar errorObject_1 = __webpack_require__(/*! ../util/errorObject */ 26);\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.\n *\n * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.\n *\n * If a comparator function is not provided, an equality check is used by default.\n *\n * @example <caption>A simple example with numbers</caption>\n * Observable.of(1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4)\n *   .distinctUntilChanged()\n *   .subscribe(x => console.log(x)); // 1, 2, 1, 2, 3, 4\n *\n * @example <caption>An example using a compare function</caption>\n * interface Person {\n *    age: number,\n *    name: string\n * }\n *\n * Observable.of<Person>(\n *     { age: 4, name: 'Foo'},\n *     { age: 7, name: 'Bar'},\n *     { age: 5, name: 'Foo'})\n *     { age: 6, name: 'Foo'})\n *     .distinctUntilChanged((p: Person, q: Person) => p.name === q.name)\n *     .subscribe(x => console.log(x));\n *\n * // displays:\n * // { age: 4, name: 'Foo' }\n * // { age: 7, name: 'Bar' }\n * // { age: 5, name: 'Foo' }\n *\n * @see {@link distinct}\n * @see {@link distinctUntilKeyChanged}\n *\n * @param {function} [compare] Optional comparison function called to test if an item is distinct from the previous item in the source.\n * @return {Observable} An Observable that emits items from the source Observable with distinct values.\n * @method distinctUntilChanged\n * @owner Observable\n */\nfunction distinctUntilChanged(compare, keySelector) {\n    return this.lift(new DistinctUntilChangedOperator(compare, keySelector));\n}\nexports.distinctUntilChanged = distinctUntilChanged;\nvar DistinctUntilChangedOperator = function () {\n    function DistinctUntilChangedOperator(compare, keySelector) {\n        this.compare = compare;\n        this.keySelector = keySelector;\n    }\n    DistinctUntilChangedOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));\n    };\n    return DistinctUntilChangedOperator;\n}();\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar DistinctUntilChangedSubscriber = function (_super) {\n    __extends(DistinctUntilChangedSubscriber, _super);\n    function DistinctUntilChangedSubscriber(destination, compare, keySelector) {\n        _super.call(this, destination);\n        this.keySelector = keySelector;\n        this.hasKey = false;\n        if (typeof compare === 'function') {\n            this.compare = compare;\n        }\n    }\n    DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {\n        return x === y;\n    };\n    DistinctUntilChangedSubscriber.prototype._next = function (value) {\n        var keySelector = this.keySelector;\n        var key = value;\n        if (keySelector) {\n            key = tryCatch_1.tryCatch(this.keySelector)(value);\n            if (key === errorObject_1.errorObject) {\n                return this.destination.error(errorObject_1.errorObject.e);\n            }\n        }\n        var result = false;\n        if (this.hasKey) {\n            result = tryCatch_1.tryCatch(this.compare)(this.key, key);\n            if (result === errorObject_1.errorObject) {\n                return this.destination.error(errorObject_1.errorObject.e);\n            }\n        } else {\n            this.hasKey = true;\n        }\n        if (Boolean(result) === false) {\n            this.key = key;\n            this.destination.next(value);\n        }\n    };\n    return DistinctUntilChangedSubscriber;\n}(Subscriber_1.Subscriber);\n//# sourceMappingURL=distinctUntilChanged.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/distinctUntilChanged.js\n// module id = 115\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/distinctUntilChanged.js?");

/***/ }),
/* 116 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/add/operator/do.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar do_1 = __webpack_require__(/*! ../../operator/do */ 117);\nObservable_1.Observable.prototype.do = do_1._do;\nObservable_1.Observable.prototype._do = do_1._do;\n//# sourceMappingURL=do.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/do.js\n// module id = 116\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/do.js?");

/***/ }),
/* 117 */
/*!******************************************!*\
  !*** ./node_modules/rxjs/operator/do.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ 3);\n/* tslint:enable:max-line-length */\n/**\n * Perform a side effect for every emission on the source Observable, but return\n * an Observable that is identical to the source.\n *\n * <span class=\"informal\">Intercepts each emission on the source and runs a\n * function, but returns an output which is identical to the source as long as errors don't occur.</span>\n *\n * <img src=\"./img/do.png\" width=\"100%\">\n *\n * Returns a mirrored Observable of the source Observable, but modified so that\n * the provided Observer is called to perform a side effect for every value,\n * error, and completion emitted by the source. Any errors that are thrown in\n * the aforementioned Observer or handlers are safely sent down the error path\n * of the output Observable.\n *\n * This operator is useful for debugging your Observables for the correct values\n * or performing other side effects.\n *\n * Note: this is different to a `subscribe` on the Observable. If the Observable\n * returned by `do` is not subscribed, the side effects specified by the\n * Observer will never happen. `do` therefore simply spies on existing\n * execution, it does not trigger an execution to happen like `subscribe` does.\n *\n * @example <caption>Map every click to the clientX position of that click, while also logging the click event</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var positions = clicks\n *   .do(ev => console.log(ev))\n *   .map(ev => ev.clientX);\n * positions.subscribe(x => console.log(x));\n *\n * @see {@link map}\n * @see {@link subscribe}\n *\n * @param {Observer|function} [nextOrObserver] A normal Observer object or a\n * callback for `next`.\n * @param {function} [error] Callback for errors in the source.\n * @param {function} [complete] Callback for the completion of the source.\n * @return {Observable} An Observable identical to the source, but runs the\n * specified Observer or callback(s) for each item.\n * @method do\n * @name do\n * @owner Observable\n */\nfunction _do(nextOrObserver, error, complete) {\n    return this.lift(new DoOperator(nextOrObserver, error, complete));\n}\nexports._do = _do;\nvar DoOperator = function () {\n    function DoOperator(nextOrObserver, error, complete) {\n        this.nextOrObserver = nextOrObserver;\n        this.error = error;\n        this.complete = complete;\n    }\n    DoOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));\n    };\n    return DoOperator;\n}();\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar DoSubscriber = function (_super) {\n    __extends(DoSubscriber, _super);\n    function DoSubscriber(destination, nextOrObserver, error, complete) {\n        _super.call(this, destination);\n        var safeSubscriber = new Subscriber_1.Subscriber(nextOrObserver, error, complete);\n        safeSubscriber.syncErrorThrowable = true;\n        this.add(safeSubscriber);\n        this.safeSubscriber = safeSubscriber;\n    }\n    DoSubscriber.prototype._next = function (value) {\n        var safeSubscriber = this.safeSubscriber;\n        safeSubscriber.next(value);\n        if (safeSubscriber.syncErrorThrown) {\n            this.destination.error(safeSubscriber.syncErrorValue);\n        } else {\n            this.destination.next(value);\n        }\n    };\n    DoSubscriber.prototype._error = function (err) {\n        var safeSubscriber = this.safeSubscriber;\n        safeSubscriber.error(err);\n        if (safeSubscriber.syncErrorThrown) {\n            this.destination.error(safeSubscriber.syncErrorValue);\n        } else {\n            this.destination.error(err);\n        }\n    };\n    DoSubscriber.prototype._complete = function () {\n        var safeSubscriber = this.safeSubscriber;\n        safeSubscriber.complete();\n        if (safeSubscriber.syncErrorThrown) {\n            this.destination.error(safeSubscriber.syncErrorValue);\n        } else {\n            this.destination.complete();\n        }\n    };\n    return DoSubscriber;\n}(Subscriber_1.Subscriber);\n//# sourceMappingURL=do.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/do.js\n// module id = 117\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/do.js?");

/***/ }),
/* 118 */
/*!**************************************************!*\
  !*** ./node_modules/rxjs/add/operator/filter.js ***!
  \**************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar filter_1 = __webpack_require__(/*! ../../operator/filter */ 119);\nObservable_1.Observable.prototype.filter = filter_1.filter;\n//# sourceMappingURL=filter.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/filter.js\n// module id = 118\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/filter.js?");

/***/ }),
/* 119 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/operator/filter.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ 3);\n/* tslint:enable:max-line-length */\n/**\n * Filter items emitted by the source Observable by only emitting those that\n * satisfy a specified predicate.\n *\n * <span class=\"informal\">Like\n * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),\n * it only emits a value from the source if it passes a criterion function.</span>\n *\n * <img src=\"./img/filter.png\" width=\"100%\">\n *\n * Similar to the well-known `Array.prototype.filter` method, this operator\n * takes values from the source Observable, passes them through a `predicate`\n * function and only emits those values that yielded `true`.\n *\n * @example <caption>Emit only click events whose target was a DIV element</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var clicksOnDivs = clicks.filter(ev => ev.target.tagName === 'DIV');\n * clicksOnDivs.subscribe(x => console.log(x));\n *\n * @see {@link distinct}\n * @see {@link distinctUntilChanged}\n * @see {@link distinctUntilKeyChanged}\n * @see {@link ignoreElements}\n * @see {@link partition}\n * @see {@link skip}\n *\n * @param {function(value: T, index: number): boolean} predicate A function that\n * evaluates each value emitted by the source Observable. If it returns `true`,\n * the value is emitted, if `false` the value is not passed to the output\n * Observable. The `index` parameter is the number `i` for the i-th source\n * emission that has happened since the subscription, starting from the number\n * `0`.\n * @param {any} [thisArg] An optional argument to determine the value of `this`\n * in the `predicate` function.\n * @return {Observable} An Observable of values from the source that were\n * allowed by the `predicate` function.\n * @method filter\n * @owner Observable\n */\nfunction filter(predicate, thisArg) {\n    return this.lift(new FilterOperator(predicate, thisArg));\n}\nexports.filter = filter;\nvar FilterOperator = function () {\n    function FilterOperator(predicate, thisArg) {\n        this.predicate = predicate;\n        this.thisArg = thisArg;\n    }\n    FilterOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));\n    };\n    return FilterOperator;\n}();\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar FilterSubscriber = function (_super) {\n    __extends(FilterSubscriber, _super);\n    function FilterSubscriber(destination, predicate, thisArg) {\n        _super.call(this, destination);\n        this.predicate = predicate;\n        this.thisArg = thisArg;\n        this.count = 0;\n    }\n    // the try catch block below is left specifically for\n    // optimization and perf reasons. a tryCatcher is not necessary here.\n    FilterSubscriber.prototype._next = function (value) {\n        var result;\n        try {\n            result = this.predicate.call(this.thisArg, value, this.count++);\n        } catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        if (result) {\n            this.destination.next(value);\n        }\n    };\n    return FilterSubscriber;\n}(Subscriber_1.Subscriber);\n//# sourceMappingURL=filter.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/filter.js\n// module id = 119\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/filter.js?");

/***/ }),
/* 120 */
/*!***********************************************!*\
  !*** ./node_modules/rxjs/add/operator/map.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar map_1 = __webpack_require__(/*! ../../operator/map */ 49);\nObservable_1.Observable.prototype.map = map_1.map;\n//# sourceMappingURL=map.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/map.js\n// module id = 120\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/map.js?");

/***/ }),
/* 121 */
/*!*************************************************!*\
  !*** ./node_modules/rxjs/add/operator/pluck.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar pluck_1 = __webpack_require__(/*! ../../operator/pluck */ 122);\nObservable_1.Observable.prototype.pluck = pluck_1.pluck;\n//# sourceMappingURL=pluck.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/pluck.js\n// module id = 121\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/pluck.js?");

/***/ }),
/* 122 */
/*!*********************************************!*\
  !*** ./node_modules/rxjs/operator/pluck.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar map_1 = __webpack_require__(/*! ./map */ 49);\n/**\n * Maps each source value (an object) to its specified nested property.\n *\n * <span class=\"informal\">Like {@link map}, but meant only for picking one of\n * the nested properties of every emitted object.</span>\n *\n * <img src=\"./img/pluck.png\" width=\"100%\">\n *\n * Given a list of strings describing a path to an object property, retrieves\n * the value of a specified nested property from all values in the source\n * Observable. If a property can't be resolved, it will return `undefined` for\n * that value.\n *\n * @example <caption>Map every click to the tagName of the clicked target element</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var tagNames = clicks.pluck('target', 'tagName');\n * tagNames.subscribe(x => console.log(x));\n *\n * @see {@link map}\n *\n * @param {...string} properties The nested properties to pluck from each source\n * value (an object).\n * @return {Observable} A new Observable of property values from the source values.\n * @method pluck\n * @owner Observable\n */\nfunction pluck() {\n    var properties = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        properties[_i - 0] = arguments[_i];\n    }\n    var length = properties.length;\n    if (length === 0) {\n        throw new Error('list of properties cannot be empty.');\n    }\n    return map_1.map.call(this, plucker(properties, length));\n}\nexports.pluck = pluck;\nfunction plucker(props, length) {\n    var mapper = function mapper(x) {\n        var currentProp = x;\n        for (var i = 0; i < length; i++) {\n            var p = currentProp[props[i]];\n            if (typeof p !== 'undefined') {\n                currentProp = p;\n            } else {\n                return undefined;\n            }\n        }\n        return currentProp;\n    };\n    return mapper;\n}\n//# sourceMappingURL=pluck.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/pluck.js\n// module id = 122\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/pluck.js?");

/***/ }),
/* 123 */
/*!**************************************************!*\
  !*** ./node_modules/rxjs/add/operator/sample.js ***!
  \**************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar sample_1 = __webpack_require__(/*! ../../operator/sample */ 124);\nObservable_1.Observable.prototype.sample = sample_1.sample;\n//# sourceMappingURL=sample.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/sample.js\n// module id = 123\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/sample.js?");

/***/ }),
/* 124 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/operator/sample.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ 13);\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ 14);\n/**\n * Emits the most recently emitted value from the source Observable whenever\n * another Observable, the `notifier`, emits.\n *\n * <span class=\"informal\">It's like {@link sampleTime}, but samples whenever\n * the `notifier` Observable emits something.</span>\n *\n * <img src=\"./img/sample.png\" width=\"100%\">\n *\n * Whenever the `notifier` Observable emits a value or completes, `sample`\n * looks at the source Observable and emits whichever value it has most recently\n * emitted since the previous sampling, unless the source has not emitted\n * anything since the previous sampling. The `notifier` is subscribed to as soon\n * as the output Observable is subscribed.\n *\n * @example <caption>On every click, sample the most recent \"seconds\" timer</caption>\n * var seconds = Rx.Observable.interval(1000);\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = seconds.sample(clicks);\n * result.subscribe(x => console.log(x));\n *\n * @see {@link audit}\n * @see {@link debounce}\n * @see {@link sampleTime}\n * @see {@link throttle}\n *\n * @param {Observable<any>} notifier The Observable to use for sampling the\n * source Observable.\n * @return {Observable<T>} An Observable that emits the results of sampling the\n * values emitted by the source Observable whenever the notifier Observable\n * emits value or completes.\n * @method sample\n * @owner Observable\n */\nfunction sample(notifier) {\n    return this.lift(new SampleOperator(notifier));\n}\nexports.sample = sample;\nvar SampleOperator = function () {\n    function SampleOperator(notifier) {\n        this.notifier = notifier;\n    }\n    SampleOperator.prototype.call = function (subscriber, source) {\n        var sampleSubscriber = new SampleSubscriber(subscriber);\n        var subscription = source.subscribe(sampleSubscriber);\n        subscription.add(subscribeToResult_1.subscribeToResult(sampleSubscriber, this.notifier));\n        return subscription;\n    };\n    return SampleOperator;\n}();\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar SampleSubscriber = function (_super) {\n    __extends(SampleSubscriber, _super);\n    function SampleSubscriber() {\n        _super.apply(this, arguments);\n        this.hasValue = false;\n    }\n    SampleSubscriber.prototype._next = function (value) {\n        this.value = value;\n        this.hasValue = true;\n    };\n    SampleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        this.emitValue();\n    };\n    SampleSubscriber.prototype.notifyComplete = function () {\n        this.emitValue();\n    };\n    SampleSubscriber.prototype.emitValue = function () {\n        if (this.hasValue) {\n            this.hasValue = false;\n            this.destination.next(this.value);\n        }\n    };\n    return SampleSubscriber;\n}(OuterSubscriber_1.OuterSubscriber);\n//# sourceMappingURL=sample.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/sample.js\n// module id = 124\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/sample.js?");

/***/ }),
/* 125 */
/*!************************************************!*\
  !*** ./node_modules/rxjs/add/operator/scan.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar scan_1 = __webpack_require__(/*! ../../operator/scan */ 126);\nObservable_1.Observable.prototype.scan = scan_1.scan;\n//# sourceMappingURL=scan.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/scan.js\n// module id = 125\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/scan.js?");

/***/ }),
/* 126 */
/*!********************************************!*\
  !*** ./node_modules/rxjs/operator/scan.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ 3);\n/* tslint:enable:max-line-length */\n/**\n * Applies an accumulator function over the source Observable, and returns each\n * intermediate result, with an optional seed value.\n *\n * <span class=\"informal\">It's like {@link reduce}, but emits the current\n * accumulation whenever the source emits a value.</span>\n *\n * <img src=\"./img/scan.png\" width=\"100%\">\n *\n * Combines together all values emitted on the source, using an accumulator\n * function that knows how to join a new source value into the accumulation from\n * the past. Is similar to {@link reduce}, but emits the intermediate\n * accumulations.\n *\n * Returns an Observable that applies a specified `accumulator` function to each\n * item emitted by the source Observable. If a `seed` value is specified, then\n * that value will be used as the initial value for the accumulator. If no seed\n * value is specified, the first item of the source is used as the seed.\n *\n * @example <caption>Count the number of click events</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var ones = clicks.mapTo(1);\n * var seed = 0;\n * var count = ones.scan((acc, one) => acc + one, seed);\n * count.subscribe(x => console.log(x));\n *\n * @see {@link expand}\n * @see {@link mergeScan}\n * @see {@link reduce}\n *\n * @param {function(acc: R, value: T, index: number): R} accumulator\n * The accumulator function called on each source value.\n * @param {T|R} [seed] The initial accumulation value.\n * @return {Observable<R>} An observable of the accumulated values.\n * @method scan\n * @owner Observable\n */\nfunction scan(accumulator, seed) {\n    var hasSeed = false;\n    // providing a seed of `undefined` *should* be valid and trigger\n    // hasSeed! so don't use `seed !== undefined` checks!\n    // For this reason, we have to check it here at the original call site\n    // otherwise inside Operator/Subscriber we won't know if `undefined`\n    // means they didn't provide anything or if they literally provided `undefined`\n    if (arguments.length >= 2) {\n        hasSeed = true;\n    }\n    return this.lift(new ScanOperator(accumulator, seed, hasSeed));\n}\nexports.scan = scan;\nvar ScanOperator = function () {\n    function ScanOperator(accumulator, seed, hasSeed) {\n        if (hasSeed === void 0) {\n            hasSeed = false;\n        }\n        this.accumulator = accumulator;\n        this.seed = seed;\n        this.hasSeed = hasSeed;\n    }\n    ScanOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));\n    };\n    return ScanOperator;\n}();\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar ScanSubscriber = function (_super) {\n    __extends(ScanSubscriber, _super);\n    function ScanSubscriber(destination, accumulator, _seed, hasSeed) {\n        _super.call(this, destination);\n        this.accumulator = accumulator;\n        this._seed = _seed;\n        this.hasSeed = hasSeed;\n        this.index = 0;\n    }\n    Object.defineProperty(ScanSubscriber.prototype, \"seed\", {\n        get: function get() {\n            return this._seed;\n        },\n        set: function set(value) {\n            this.hasSeed = true;\n            this._seed = value;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    ScanSubscriber.prototype._next = function (value) {\n        if (!this.hasSeed) {\n            this.seed = value;\n            this.destination.next(value);\n        } else {\n            return this._tryNext(value);\n        }\n    };\n    ScanSubscriber.prototype._tryNext = function (value) {\n        var index = this.index++;\n        var result;\n        try {\n            result = this.accumulator(this.seed, value, index);\n        } catch (err) {\n            this.destination.error(err);\n        }\n        this.seed = result;\n        this.destination.next(result);\n    };\n    return ScanSubscriber;\n}(Subscriber_1.Subscriber);\n//# sourceMappingURL=scan.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/scan.js\n// module id = 126\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/scan.js?");

/***/ }),
/* 127 */
/*!*******************************************************!*\
  !*** ./node_modules/rxjs/add/operator/shareReplay.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar shareReplay_1 = __webpack_require__(/*! ../../operator/shareReplay */ 128);\nObservable_1.Observable.prototype.shareReplay = shareReplay_1.shareReplay;\n//# sourceMappingURL=shareReplay.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/shareReplay.js\n// module id = 127\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/shareReplay.js?");

/***/ }),
/* 128 */
/*!***************************************************!*\
  !*** ./node_modules/rxjs/operator/shareReplay.js ***!
  \***************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar multicast_1 = __webpack_require__(/*! ./multicast */ 129);\nvar ReplaySubject_1 = __webpack_require__(/*! ../ReplaySubject */ 45);\n/**\n * @method shareReplay\n * @owner Observable\n */\nfunction shareReplay(bufferSize, windowTime, scheduler) {\n    var subject;\n    var connectable = multicast_1.multicast.call(this, function shareReplaySubjectFactory() {\n        if (this._isComplete) {\n            return subject;\n        } else {\n            return subject = new ReplaySubject_1.ReplaySubject(bufferSize, windowTime, scheduler);\n        }\n    });\n    return connectable.refCount();\n}\nexports.shareReplay = shareReplay;\n;\n//# sourceMappingURL=shareReplay.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/shareReplay.js\n// module id = 128\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/shareReplay.js?");

/***/ }),
/* 129 */
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operator/multicast.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar ConnectableObservable_1 = __webpack_require__(/*! ../observable/ConnectableObservable */ 130);\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits the results of invoking a specified selector on items\n * emitted by a ConnectableObservable that shares a single subscription to the underlying stream.\n *\n * <img src=\"./img/multicast.png\" width=\"100%\">\n *\n * @param {Function|Subject} subjectOrSubjectFactory - Factory function to create an intermediate subject through\n * which the source sequence's elements will be multicast to the selector function\n * or Subject to push source elements into.\n * @param {Function} [selector] - Optional selector function that can use the multicasted source stream\n * as many times as needed, without causing multiple subscriptions to the source stream.\n * Subscribers to the given source will receive all notifications of the source from the\n * time of the subscription forward.\n * @return {Observable} An Observable that emits the results of invoking the selector\n * on the items emitted by a `ConnectableObservable` that shares a single subscription to\n * the underlying stream.\n * @method multicast\n * @owner Observable\n */\nfunction multicast(subjectOrSubjectFactory, selector) {\n    var subjectFactory;\n    if (typeof subjectOrSubjectFactory === 'function') {\n        subjectFactory = subjectOrSubjectFactory;\n    } else {\n        subjectFactory = function subjectFactory() {\n            return subjectOrSubjectFactory;\n        };\n    }\n    if (typeof selector === 'function') {\n        return this.lift(new MulticastOperator(subjectFactory, selector));\n    }\n    var connectable = Object.create(this, ConnectableObservable_1.connectableObservableDescriptor);\n    connectable.source = this;\n    connectable.subjectFactory = subjectFactory;\n    return connectable;\n}\nexports.multicast = multicast;\nvar MulticastOperator = function () {\n    function MulticastOperator(subjectFactory, selector) {\n        this.subjectFactory = subjectFactory;\n        this.selector = selector;\n    }\n    MulticastOperator.prototype.call = function (subscriber, source) {\n        var selector = this.selector;\n        var subject = this.subjectFactory();\n        var subscription = selector(subject).subscribe(subscriber);\n        subscription.add(source.subscribe(subject));\n        return subscription;\n    };\n    return MulticastOperator;\n}();\nexports.MulticastOperator = MulticastOperator;\n//# sourceMappingURL=multicast.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/multicast.js\n// module id = 129\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/multicast.js?");

/***/ }),
/* 130 */
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/observable/ConnectableObservable.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar Subject_1 = __webpack_require__(/*! ../Subject */ 28);\nvar Observable_1 = __webpack_require__(/*! ../Observable */ 0);\nvar Subscriber_1 = __webpack_require__(/*! ../Subscriber */ 3);\nvar Subscription_1 = __webpack_require__(/*! ../Subscription */ 6);\n/**\n * @class ConnectableObservable<T>\n */\nvar ConnectableObservable = function (_super) {\n    __extends(ConnectableObservable, _super);\n    function ConnectableObservable(source, subjectFactory) {\n        _super.call(this);\n        this.source = source;\n        this.subjectFactory = subjectFactory;\n        this._refCount = 0;\n        this._isComplete = false;\n    }\n    ConnectableObservable.prototype._subscribe = function (subscriber) {\n        return this.getSubject().subscribe(subscriber);\n    };\n    ConnectableObservable.prototype.getSubject = function () {\n        var subject = this._subject;\n        if (!subject || subject.isStopped) {\n            this._subject = this.subjectFactory();\n        }\n        return this._subject;\n    };\n    ConnectableObservable.prototype.connect = function () {\n        var connection = this._connection;\n        if (!connection) {\n            this._isComplete = false;\n            connection = this._connection = new Subscription_1.Subscription();\n            connection.add(this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this)));\n            if (connection.closed) {\n                this._connection = null;\n                connection = Subscription_1.Subscription.EMPTY;\n            } else {\n                this._connection = connection;\n            }\n        }\n        return connection;\n    };\n    ConnectableObservable.prototype.refCount = function () {\n        return this.lift(new RefCountOperator(this));\n    };\n    return ConnectableObservable;\n}(Observable_1.Observable);\nexports.ConnectableObservable = ConnectableObservable;\nvar connectableProto = ConnectableObservable.prototype;\nexports.connectableObservableDescriptor = {\n    operator: { value: null },\n    _refCount: { value: 0, writable: true },\n    _subject: { value: null, writable: true },\n    _connection: { value: null, writable: true },\n    _subscribe: { value: connectableProto._subscribe },\n    _isComplete: { value: connectableProto._isComplete, writable: true },\n    getSubject: { value: connectableProto.getSubject },\n    connect: { value: connectableProto.connect },\n    refCount: { value: connectableProto.refCount }\n};\nvar ConnectableSubscriber = function (_super) {\n    __extends(ConnectableSubscriber, _super);\n    function ConnectableSubscriber(destination, connectable) {\n        _super.call(this, destination);\n        this.connectable = connectable;\n    }\n    ConnectableSubscriber.prototype._error = function (err) {\n        this._unsubscribe();\n        _super.prototype._error.call(this, err);\n    };\n    ConnectableSubscriber.prototype._complete = function () {\n        this.connectable._isComplete = true;\n        this._unsubscribe();\n        _super.prototype._complete.call(this);\n    };\n    ConnectableSubscriber.prototype._unsubscribe = function () {\n        var connectable = this.connectable;\n        if (connectable) {\n            this.connectable = null;\n            var connection = connectable._connection;\n            connectable._refCount = 0;\n            connectable._subject = null;\n            connectable._connection = null;\n            if (connection) {\n                connection.unsubscribe();\n            }\n        }\n    };\n    return ConnectableSubscriber;\n}(Subject_1.SubjectSubscriber);\nvar RefCountOperator = function () {\n    function RefCountOperator(connectable) {\n        this.connectable = connectable;\n    }\n    RefCountOperator.prototype.call = function (subscriber, source) {\n        var connectable = this.connectable;\n        connectable._refCount++;\n        var refCounter = new RefCountSubscriber(subscriber, connectable);\n        var subscription = source.subscribe(refCounter);\n        if (!refCounter.closed) {\n            refCounter.connection = connectable.connect();\n        }\n        return subscription;\n    };\n    return RefCountOperator;\n}();\nvar RefCountSubscriber = function (_super) {\n    __extends(RefCountSubscriber, _super);\n    function RefCountSubscriber(destination, connectable) {\n        _super.call(this, destination);\n        this.connectable = connectable;\n    }\n    RefCountSubscriber.prototype._unsubscribe = function () {\n        var connectable = this.connectable;\n        if (!connectable) {\n            this.connection = null;\n            return;\n        }\n        this.connectable = null;\n        var refCount = connectable._refCount;\n        if (refCount <= 0) {\n            this.connection = null;\n            return;\n        }\n        connectable._refCount = refCount - 1;\n        if (refCount > 1) {\n            this.connection = null;\n            return;\n        }\n        ///\n        // Compare the local RefCountSubscriber's connection Subscription to the\n        // connection Subscription on the shared ConnectableObservable. In cases\n        // where the ConnectableObservable source synchronously emits values, and\n        // the RefCountSubscriber's downstream Observers synchronously unsubscribe,\n        // execution continues to here before the RefCountOperator has a chance to\n        // supply the RefCountSubscriber with the shared connection Subscription.\n        // For example:\n        // ```\n        // Observable.range(0, 10)\n        //   .publish()\n        //   .refCount()\n        //   .take(5)\n        //   .subscribe();\n        // ```\n        // In order to account for this case, RefCountSubscriber should only dispose\n        // the ConnectableObservable's shared connection Subscription if the\n        // connection Subscription exists, *and* either:\n        //   a. RefCountSubscriber doesn't have a reference to the shared connection\n        //      Subscription yet, or,\n        //   b. RefCountSubscriber's connection Subscription reference is identical\n        //      to the shared connection Subscription\n        ///\n        var connection = this.connection;\n        var sharedConnection = connectable._connection;\n        this.connection = null;\n        if (sharedConnection && (!connection || sharedConnection === connection)) {\n            sharedConnection.unsubscribe();\n        }\n    };\n    return RefCountSubscriber;\n}(Subscriber_1.Subscriber);\n//# sourceMappingURL=ConnectableObservable.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/observable/ConnectableObservable.js\n// module id = 130\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/observable/ConnectableObservable.js?");

/***/ }),
/* 131 */
/*!*****************************************************!*\
  !*** ./node_modules/rxjs/add/operator/startWith.js ***!
  \*****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar startWith_1 = __webpack_require__(/*! ../../operator/startWith */ 132);\nObservable_1.Observable.prototype.startWith = startWith_1.startWith;\n//# sourceMappingURL=startWith.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/startWith.js\n// module id = 131\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/startWith.js?");

/***/ }),
/* 132 */
/*!*************************************************!*\
  !*** ./node_modules/rxjs/operator/startWith.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar ArrayObservable_1 = __webpack_require__(/*! ../observable/ArrayObservable */ 7);\nvar ScalarObservable_1 = __webpack_require__(/*! ../observable/ScalarObservable */ 46);\nvar EmptyObservable_1 = __webpack_require__(/*! ../observable/EmptyObservable */ 47);\nvar concat_1 = __webpack_require__(/*! ./concat */ 133);\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ 9);\n/* tslint:enable:max-line-length */\n/**\n * Returns an Observable that emits the items you specify as arguments before it begins to emit\n * items emitted by the source Observable.\n *\n * <img src=\"./img/startWith.png\" width=\"100%\">\n *\n * @param {...T} values - Items you want the modified Observable to emit first.\n * @param {Scheduler} [scheduler] - A {@link IScheduler} to use for scheduling\n * the emissions of the `next` notifications.\n * @return {Observable} An Observable that emits the items in the specified Iterable and then emits the items\n * emitted by the source Observable.\n * @method startWith\n * @owner Observable\n */\nfunction startWith() {\n    var array = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        array[_i - 0] = arguments[_i];\n    }\n    var scheduler = array[array.length - 1];\n    if (isScheduler_1.isScheduler(scheduler)) {\n        array.pop();\n    } else {\n        scheduler = null;\n    }\n    var len = array.length;\n    if (len === 1) {\n        return concat_1.concatStatic(new ScalarObservable_1.ScalarObservable(array[0], scheduler), this);\n    } else if (len > 1) {\n        return concat_1.concatStatic(new ArrayObservable_1.ArrayObservable(array, scheduler), this);\n    } else {\n        return concat_1.concatStatic(new EmptyObservable_1.EmptyObservable(scheduler), this);\n    }\n}\nexports.startWith = startWith;\n//# sourceMappingURL=startWith.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/startWith.js\n// module id = 132\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/startWith.js?");

/***/ }),
/* 133 */
/*!**********************************************!*\
  !*** ./node_modules/rxjs/operator/concat.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../Observable */ 0);\nvar isScheduler_1 = __webpack_require__(/*! ../util/isScheduler */ 9);\nvar ArrayObservable_1 = __webpack_require__(/*! ../observable/ArrayObservable */ 7);\nvar mergeAll_1 = __webpack_require__(/*! ./mergeAll */ 48);\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which sequentially emits all values from every\n * given input Observable after the current Observable.\n *\n * <span class=\"informal\">Concatenates multiple Observables together by\n * sequentially emitting their values, one Observable after the other.</span>\n *\n * <img src=\"./img/concat.png\" width=\"100%\">\n *\n * Joins this Observable with multiple other Observables by subscribing to them\n * one at a time, starting with the source, and merging their results into the\n * output Observable. Will wait for each Observable to complete before moving\n * on to the next.\n *\n * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>\n * var timer = Rx.Observable.interval(1000).take(4);\n * var sequence = Rx.Observable.range(1, 10);\n * var result = timer.concat(sequence);\n * result.subscribe(x => console.log(x));\n *\n * // results in:\n * // 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10\n *\n * @example <caption>Concatenate 3 Observables</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var result = timer1.concat(timer2, timer3);\n * result.subscribe(x => console.log(x));\n *\n * // results in the following:\n * // (Prints to console sequentially)\n * // -1000ms-> 0 -1000ms-> 1 -1000ms-> ... 9\n * // -2000ms-> 0 -2000ms-> 1 -2000ms-> ... 5\n * // -500ms-> 0 -500ms-> 1 -500ms-> ... 9\n *\n * @see {@link concatAll}\n * @see {@link concatMap}\n * @see {@link concatMapTo}\n *\n * @param {ObservableInput} other An input Observable to concatenate after the source\n * Observable. More than one input Observables may be given as argument.\n * @param {Scheduler} [scheduler=null] An optional IScheduler to schedule each\n * Observable subscription on.\n * @return {Observable} All values of each passed Observable merged into a\n * single Observable, in order, in serial fashion.\n * @method concat\n * @owner Observable\n */\nfunction concat() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    return this.lift.call(concatStatic.apply(void 0, [this].concat(observables)));\n}\nexports.concat = concat;\n/* tslint:enable:max-line-length */\n/**\n * Creates an output Observable which sequentially emits all values from given\n * Observable and then moves on to the next.\n *\n * <span class=\"informal\">Concatenates multiple Observables together by\n * sequentially emitting their values, one Observable after the other.</span>\n *\n * <img src=\"./img/concat.png\" width=\"100%\">\n *\n * `concat` joins multiple Observables together, by subscribing to them one at a time and\n * merging their results into the output Observable. You can pass either an array of\n * Observables, or put them directly as arguments. Passing an empty array will result\n * in Observable that completes immediately.\n *\n * `concat` will subscribe to first input Observable and emit all its values, without\n * changing or affecting them in any way. When that Observable completes, it will\n * subscribe to then next Observable passed and, again, emit its values. This will be\n * repeated, until the operator runs out of Observables. When last input Observable completes,\n * `concat` will complete as well. At any given moment only one Observable passed to operator\n * emits values. If you would like to emit values from passed Observables concurrently, check out\n * {@link merge} instead, especially with optional `concurrent` parameter. As a matter of fact,\n * `concat` is an equivalent of `merge` operator with `concurrent` parameter set to `1`.\n *\n * Note that if some input Observable never completes, `concat` will also never complete\n * and Observables following the one that did not complete will never be subscribed. On the other\n * hand, if some Observable simply completes immediately after it is subscribed, it will be\n * invisible for `concat`, which will just move on to the next Observable.\n *\n * If any Observable in chain errors, instead of passing control to the next Observable,\n * `concat` will error immediately as well. Observables that would be subscribed after\n * the one that emitted error, never will.\n *\n * If you pass to `concat` the same Observable many times, its stream of values\n * will be \"replayed\" on every subscription, which means you can repeat given Observable\n * as many times as you like. If passing the same Observable to `concat` 1000 times becomes tedious,\n * you can always use {@link repeat}.\n *\n * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>\n * var timer = Rx.Observable.interval(1000).take(4);\n * var sequence = Rx.Observable.range(1, 10);\n * var result = Rx.Observable.concat(timer, sequence);\n * result.subscribe(x => console.log(x));\n *\n * // results in:\n * // 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10\n *\n *\n * @example <caption>Concatenate an array of 3 Observables</caption>\n * var timer1 = Rx.Observable.interval(1000).take(10);\n * var timer2 = Rx.Observable.interval(2000).take(6);\n * var timer3 = Rx.Observable.interval(500).take(10);\n * var result = Rx.Observable.concat([timer1, timer2, timer3]); // note that array is passed\n * result.subscribe(x => console.log(x));\n *\n * // results in the following:\n * // (Prints to console sequentially)\n * // -1000ms-> 0 -1000ms-> 1 -1000ms-> ... 9\n * // -2000ms-> 0 -2000ms-> 1 -2000ms-> ... 5\n * // -500ms-> 0 -500ms-> 1 -500ms-> ... 9\n *\n *\n * @example <caption>Concatenate the same Observable to repeat it</caption>\n * const timer = Rx.Observable.interval(1000).take(2);\n *\n * Rx.Observable.concat(timer, timer) // concating the same Observable!\n * .subscribe(\n *   value => console.log(value),\n *   err => {},\n *   () => console.log('...and it is done!')\n * );\n *\n * // Logs:\n * // 0 after 1s\n * // 1 after 2s\n * // 0 after 3s\n * // 1 after 4s\n * // \"...and it is done!\" also after 4s\n *\n * @see {@link concatAll}\n * @see {@link concatMap}\n * @see {@link concatMapTo}\n *\n * @param {ObservableInput} input1 An input Observable to concatenate with others.\n * @param {ObservableInput} input2 An input Observable to concatenate with others.\n * More than one input Observables may be given as argument.\n * @param {Scheduler} [scheduler=null] An optional IScheduler to schedule each\n * Observable subscription on.\n * @return {Observable} All values of each passed Observable merged into a\n * single Observable, in order, in serial fashion.\n * @static true\n * @name concat\n * @owner Observable\n */\nfunction concatStatic() {\n    var observables = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        observables[_i - 0] = arguments[_i];\n    }\n    var scheduler = null;\n    var args = observables;\n    if (isScheduler_1.isScheduler(args[observables.length - 1])) {\n        scheduler = args.pop();\n    }\n    if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable_1.Observable) {\n        return observables[0];\n    }\n    return new ArrayObservable_1.ArrayObservable(observables, scheduler).lift(new mergeAll_1.MergeAllOperator(1));\n}\nexports.concatStatic = concatStatic;\n//# sourceMappingURL=concat.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/concat.js\n// module id = 133\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/concat.js?");

/***/ }),
/* 134 */
/*!**********************************************************!*\
  !*** ./node_modules/rxjs/add/operator/withLatestFrom.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Observable_1 = __webpack_require__(/*! ../../Observable */ 0);\nvar withLatestFrom_1 = __webpack_require__(/*! ../../operator/withLatestFrom */ 135);\nObservable_1.Observable.prototype.withLatestFrom = withLatestFrom_1.withLatestFrom;\n//# sourceMappingURL=withLatestFrom.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/add/operator/withLatestFrom.js\n// module id = 134\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/add/operator/withLatestFrom.js?");

/***/ }),
/* 135 */
/*!******************************************************!*\
  !*** ./node_modules/rxjs/operator/withLatestFrom.js ***!
  \******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __extends = undefined && undefined.__extends || function (d, b) {\n    for (var p in b) {\n        if (b.hasOwnProperty(p)) d[p] = b[p];\n    }function __() {\n        this.constructor = d;\n    }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};\nvar OuterSubscriber_1 = __webpack_require__(/*! ../OuterSubscriber */ 13);\nvar subscribeToResult_1 = __webpack_require__(/*! ../util/subscribeToResult */ 14);\n/* tslint:enable:max-line-length */\n/**\n * Combines the source Observable with other Observables to create an Observable\n * whose values are calculated from the latest values of each, only when the\n * source emits.\n *\n * <span class=\"informal\">Whenever the source Observable emits a value, it\n * computes a formula using that value plus the latest values from other input\n * Observables, then emits the output of that formula.</span>\n *\n * <img src=\"./img/withLatestFrom.png\" width=\"100%\">\n *\n * `withLatestFrom` combines each value from the source Observable (the\n * instance) with the latest values from the other input Observables only when\n * the source emits a value, optionally using a `project` function to determine\n * the value to be emitted on the output Observable. All input Observables must\n * emit at least one value before the output Observable will emit a value.\n *\n * @example <caption>On every click event, emit an array with the latest timer event plus the click event</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var timer = Rx.Observable.interval(1000);\n * var result = clicks.withLatestFrom(timer);\n * result.subscribe(x => console.log(x));\n *\n * @see {@link combineLatest}\n *\n * @param {ObservableInput} other An input Observable to combine with the source\n * Observable. More than one input Observables may be given as argument.\n * @param {Function} [project] Projection function for combining values\n * together. Receives all values in order of the Observables passed, where the\n * first parameter is a value from the source Observable. (e.g.\n * `a.withLatestFrom(b, c, (a1, b1, c1) => a1 + b1 + c1)`). If this is not\n * passed, arrays will be emitted on the output Observable.\n * @return {Observable} An Observable of projected values from the most recent\n * values from each input Observable, or an array of the most recent values from\n * each input Observable.\n * @method withLatestFrom\n * @owner Observable\n */\nfunction withLatestFrom() {\n    var args = [];\n    for (var _i = 0; _i < arguments.length; _i++) {\n        args[_i - 0] = arguments[_i];\n    }\n    var project;\n    if (typeof args[args.length - 1] === 'function') {\n        project = args.pop();\n    }\n    var observables = args;\n    return this.lift(new WithLatestFromOperator(observables, project));\n}\nexports.withLatestFrom = withLatestFrom;\nvar WithLatestFromOperator = function () {\n    function WithLatestFromOperator(observables, project) {\n        this.observables = observables;\n        this.project = project;\n    }\n    WithLatestFromOperator.prototype.call = function (subscriber, source) {\n        return source.subscribe(new WithLatestFromSubscriber(subscriber, this.observables, this.project));\n    };\n    return WithLatestFromOperator;\n}();\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nvar WithLatestFromSubscriber = function (_super) {\n    __extends(WithLatestFromSubscriber, _super);\n    function WithLatestFromSubscriber(destination, observables, project) {\n        _super.call(this, destination);\n        this.observables = observables;\n        this.project = project;\n        this.toRespond = [];\n        var len = observables.length;\n        this.values = new Array(len);\n        for (var i = 0; i < len; i++) {\n            this.toRespond.push(i);\n        }\n        for (var i = 0; i < len; i++) {\n            var observable = observables[i];\n            this.add(subscribeToResult_1.subscribeToResult(this, observable, observable, i));\n        }\n    }\n    WithLatestFromSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {\n        this.values[outerIndex] = innerValue;\n        var toRespond = this.toRespond;\n        if (toRespond.length > 0) {\n            var found = toRespond.indexOf(outerIndex);\n            if (found !== -1) {\n                toRespond.splice(found, 1);\n            }\n        }\n    };\n    WithLatestFromSubscriber.prototype.notifyComplete = function () {\n        // noop\n    };\n    WithLatestFromSubscriber.prototype._next = function (value) {\n        if (this.toRespond.length === 0) {\n            var args = [value].concat(this.values);\n            if (this.project) {\n                this._tryProject(args);\n            } else {\n                this.destination.next(args);\n            }\n        }\n    };\n    WithLatestFromSubscriber.prototype._tryProject = function (args) {\n        var result;\n        try {\n            result = this.project.apply(this, args);\n        } catch (err) {\n            this.destination.error(err);\n            return;\n        }\n        this.destination.next(result);\n    };\n    return WithLatestFromSubscriber;\n}(OuterSubscriber_1.OuterSubscriber);\n//# sourceMappingURL=withLatestFrom.js.map\n\n//////////////////\n// WEBPACK FOOTER\n// ./node_modules/rxjs/operator/withLatestFrom.js\n// module id = 135\n// module chunks = 0\n\n//# sourceURL=webpack:///./node_modules/rxjs/operator/withLatestFrom.js?");

/***/ })
/******/ ]);
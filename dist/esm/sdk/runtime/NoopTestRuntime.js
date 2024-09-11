function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
export class NoopTestRuntime {
  constructor() {
    _defineProperty(this, "expectedlyFailedTests", []);
  }
  attachment() {
    var _this = this;
    return _asyncToGenerator(function* () {
      yield _this.warning();
    })();
  }
  attachmentFromPath() {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      yield _this2.warning();
    })();
  }
  description() {
    var _this3 = this;
    return _asyncToGenerator(function* () {
      yield _this3.warning();
    })();
  }
  descriptionHtml() {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      yield _this4.warning();
    })();
  }
  displayName() {
    var _this5 = this;
    return _asyncToGenerator(function* () {
      yield _this5.warning();
    })();
  }
  historyId() {
    var _this6 = this;
    return _asyncToGenerator(function* () {
      yield _this6.warning();
    })();
  }
  labels() {
    var _this7 = this;
    return _asyncToGenerator(function* () {
      yield _this7.warning();
    })();
  }
  links() {
    var _this8 = this;
    return _asyncToGenerator(function* () {
      yield _this8.warning();
    })();
  }
  parameter() {
    var _this9 = this;
    return _asyncToGenerator(function* () {
      yield _this9.warning();
    })();
  }
  logStep() {
    var _this10 = this;
    return _asyncToGenerator(function* () {
      yield _this10.warning();
    })();
  }
  step(name, body) {
    var _this11 = this;
    return _asyncToGenerator(function* () {
      yield _this11.warning();
      return body();
    })();
  }
  stepDisplayName() {
    var _this12 = this;
    return _asyncToGenerator(function* () {
      yield _this12.warning();
    })();
  }
  stepParameter() {
    var _this13 = this;
    return _asyncToGenerator(function* () {
      yield _this13.warning();
    })();
  }
  testCaseId() {
    var _this14 = this;
    return _asyncToGenerator(function* () {
      yield _this14.warning();
    })();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  warning() {
    return _asyncToGenerator(function* () {
      // eslint-disable-next-line no-console
      console.log("no test runtime is found. Please check test framework configuration");
    })();
  }
}
export var noopRuntime = new NoopTestRuntime();
//# sourceMappingURL=NoopTestRuntime.js.map
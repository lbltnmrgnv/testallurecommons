"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stripAnsi = exports.serialize = exports.isPromise = exports.isMetadataTag = exports.isAnyStepFailed = exports.isAllStepsEnded = exports.hasStepMessage = exports.hasLabel = exports.getUnfinishedStepsMessages = exports.getStepsMessagesPair = exports.getStatusFromError = exports.getMessageAndTraceFromError = exports.extractMetadataFromString = exports.allureLabelRegexpGlobal = exports.allureLabelRegexp = exports.allureIdRegexpGlobal = exports.allureIdRegexp = void 0;
var _model = require("../model.js");
function _wrapRegExp() { _wrapRegExp = function _wrapRegExp(e, r) { return new BabelRegExp(e, void 0, r); }; var e = RegExp.prototype, r = new WeakMap(); function BabelRegExp(e, t, p) { var o = RegExp(e, t); return r.set(o, p || r.get(e)), _setPrototypeOf(o, BabelRegExp.prototype); } function buildGroups(e, t) { var p = r.get(t); return Object.keys(p).reduce(function (r, t) { var o = p[t]; if ("number" == typeof o) r[t] = e[o];else { for (var i = 0; void 0 === e[o[i]] && i + 1 < o.length;) i++; r[t] = e[o[i]]; } return r; }, Object.create(null)); } return _inherits(BabelRegExp, RegExp), BabelRegExp.prototype.exec = function (r) { var t = e.exec.call(this, r); if (t) { t.groups = buildGroups(t, this); var p = t.indices; p && (p.groups = buildGroups(p, this)); } return t; }, BabelRegExp.prototype[Symbol.replace] = function (t, p) { if ("string" == typeof p) { var o = r.get(this); return e[Symbol.replace].call(this, t, p.replace(/\$<([^>]+)>/g, function (e, r) { var t = o[r]; return "$" + (Array.isArray(t) ? t.join("$") : t); })); } if ("function" == typeof p) { var i = this; return e[Symbol.replace].call(this, t, function () { var e = arguments; return "object" != typeof e[e.length - 1] && (e = [].slice.call(e)).push(buildGroups(e, i)), p.apply(this, e); }); } return e[Symbol.replace].call(this, t, p); }, _wrapRegExp.apply(this, arguments); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var getStatusFromError = error => {
  switch (true) {
    /**
     * Native `node:assert` and `chai` (`vitest` uses it under the hood) throw `AssertionError`
     * `jest` throws `JestAssertionError` instance
     * `jasmine` throws `ExpectationFailed` instance
     * `vitest` throws `Error` for extended assertions, so we look into stack
     */
    case /assert/gi.test(error.constructor.name):
    case /expectation/gi.test(error.constructor.name):
    case /assert/gi.test(error.name):
    case /assert/gi.test(error.message):
    case error.stack && /@vitest\/expect/gi.test(error.stack):
      return _model.Status.FAILED;
    default:
      return _model.Status.BROKEN;
  }
};

/**
 * Source: https://github.com/chalk/ansi-regex
 */
exports.getStatusFromError = getStatusFromError;
var ansiRegex = function ansiRegex() {
  var {
    onlyFirst = false
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var pattern = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
  return new RegExp(pattern, onlyFirst ? undefined : "g");
};

/**
 * https://github.com/chalk/strip-ansi
 */
var stripAnsi = str => {
  var regex = ansiRegex();
  return str.replace(regex, "");
};
exports.stripAnsi = stripAnsi;
var getMessageAndTraceFromError = error => {
  var {
    message,
    stack
  } = error;
  return {
    message: message ? stripAnsi(message) : undefined,
    trace: stack ? stripAnsi(stack) : undefined
  };
};
exports.getMessageAndTraceFromError = getMessageAndTraceFromError;
var allureIdRegexp = exports.allureIdRegexp = /*#__PURE__*/_wrapRegExp(/(?:^|\s)@?allure\.id[:=]([^\s]+)/, {
  id: 1
});
var allureIdRegexpGlobal = exports.allureIdRegexpGlobal = new RegExp(allureIdRegexp, "g");
var allureLabelRegexp = exports.allureLabelRegexp = /*#__PURE__*/_wrapRegExp(/(?:^|\s)@?allure\.label\.([^:=\s]+)[:=]([^\s]+)/, {
  name: 1,
  value: 2
});
var allureLabelRegexpGlobal = exports.allureLabelRegexpGlobal = new RegExp(allureLabelRegexp, "g");
var isMetadataTag = tag => {
  return allureIdRegexp.test(tag) || allureLabelRegexp.test(tag);
};
exports.isMetadataTag = isMetadataTag;
var extractMetadataFromString = title => {
  var labels = [];
  title.split(" ").forEach(val => {
    var _val$match;
    var idValue = (_val$match = val.match(allureIdRegexp)) === null || _val$match === void 0 || (_val$match = _val$match.groups) === null || _val$match === void 0 ? void 0 : _val$match.id;
    if (idValue) {
      labels.push({
        name: _model.LabelName.ALLURE_ID,
        value: idValue
      });
    }
    var labelMatch = val.match(allureLabelRegexp);
    var {
      name,
      value
    } = (labelMatch === null || labelMatch === void 0 ? void 0 : labelMatch.groups) || {};
    if (name && value) {
      labels === null || labels === void 0 || labels.push({
        name,
        value
      });
    }
  });
  var cleanTitle = title.replace(allureLabelRegexpGlobal, "").replace(allureIdRegexpGlobal, "").trim();
  return {
    labels,
    cleanTitle
  };
};
exports.extractMetadataFromString = extractMetadataFromString;
var isAnyStepFailed = item => {
  var isFailed = item.status === _model.Status.FAILED;
  if (isFailed || item.steps.length === 0) {
    return isFailed;
  }
  return !!item.steps.find(step => isAnyStepFailed(step));
};
exports.isAnyStepFailed = isAnyStepFailed;
var isAllStepsEnded = item => {
  return item.steps.every(val => val.stop && isAllStepsEnded(val));
};
exports.isAllStepsEnded = isAllStepsEnded;
var hasLabel = (testResult, labelName) => {
  return !!testResult.labels.find(l => l.name === labelName);
};
exports.hasLabel = hasLabel;
var hasStepMessage = messages => {
  return messages.some(message => message.type === "step_start" || message.type === "step_stop");
};
exports.hasStepMessage = hasStepMessage;
var getStepsMessagesPair = messages => messages.reduce((acc, message) => {
  if (message.type !== "step_start" && message.type !== "step_stop") {
    return acc;
  }
  if (message.type === "step_start") {
    acc.push([message]);
    return acc;
  }
  var unfinishedStepIdx = acc.findLastIndex(step => step.length === 1);
  if (unfinishedStepIdx === -1) {
    return acc;
  }
  acc[unfinishedStepIdx].push(message);
  return acc;
}, []);
exports.getStepsMessagesPair = getStepsMessagesPair;
var getUnfinishedStepsMessages = messages => {
  var grouppedStepsMessage = getStepsMessagesPair(messages);
  return grouppedStepsMessage.filter(step => step.length === 1);
};
exports.getUnfinishedStepsMessages = getUnfinishedStepsMessages;
var isPromise = obj => !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
exports.isPromise = isPromise;
var serialize = exports.serialize = function serialize(value) {
  var {
    maxDepth = 0,
    maxLength = 0
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return limitString(typeof value === "object" ? JSON.stringify(value, createSerializeReplacer(maxDepth)) : String(value), maxLength);
};
var createSerializeReplacer = maxDepth => {
  var parents = [];
  return function (_, value) {
    if (typeof value !== "object" || value === null) {
      return value;
    }
    while (parents.length > 0 && !Object.is(parents.at(-1), this)) {
      parents.pop();
    }
    if (maxDepth && parents.length >= maxDepth || parents.includes(value)) {
      return undefined;
    }
    parents.push(value);
    return value instanceof Map ? excludeCircularRefsFromMap(parents, value) : value instanceof Set ? excludeCircularRefsFromSet(parents, value) : value;
  };
};
var excludeCircularRefsFromMap = (parents, map) => {
  return Array.from(map).filter(_ref => {
    var [k] = _ref;
    return !parents.includes(k);
  }).map(_ref2 => {
    var [k, v] = _ref2;
    return [k, parents.includes(v) ? undefined : v];
  });
};
var excludeCircularRefsFromSet = (parents, set) => {
  return Array.from(set).map(v => parents.includes(v) ? undefined : v);
};
var limitString = (value, maxLength) => maxLength && value.length > maxLength ? "".concat(value.substring(0, maxLength), "...") : value;
//# sourceMappingURL=utils.js.map
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* eslint max-lines: 0 */
import { extname } from "path";
import { Stage } from "../../model.js";
import { LifecycleState } from "./LifecycleState.js";
import { Notifier } from "./Notifier.js";
import { createFixtureResult, createStepResult, createTestResult } from "./factory.js";
import { hasSkipLabel } from "./testplan.js";
import { deepClone, formatLinks, getTestResultHistoryId, getTestResultTestCaseId, randomUuid } from "./utils.js";
import { buildAttachmentFileName } from "./utils/attachments.js";
import { resolveWriter } from "./writer/loader.js";
class DefaultStepStack {
  constructor() {
    _defineProperty(this, "stepsByRoot", new Map());
    _defineProperty(this, "rootsByStep", new Map());
    _defineProperty(this, "clear", () => {
      this.stepsByRoot.clear();
      this.rootsByStep.clear();
    });
    _defineProperty(this, "removeRoot", rootUuid => {
      var maybeValue = this.stepsByRoot.get(rootUuid);
      this.stepsByRoot.delete(rootUuid);
      if (maybeValue) {
        maybeValue.forEach(stepUuid => this.rootsByStep.delete(stepUuid));
      }
    });
    _defineProperty(this, "currentStep", rootUuid => {
      var maybeValue = this.stepsByRoot.get(rootUuid);
      if (!maybeValue) {
        return;
      }
      return maybeValue[maybeValue.length - 1];
    });
    _defineProperty(this, "addStep", (rootUuid, stepUuid) => {
      var maybeValue = this.stepsByRoot.get(rootUuid);
      if (!maybeValue) {
        this.stepsByRoot.set(rootUuid, [stepUuid]);
      } else {
        maybeValue.push(stepUuid);
      }
      this.rootsByStep.set(stepUuid, rootUuid);
    });
  }
  removeStep(stepUuid) {
    var rootUuid = this.rootsByStep.get(stepUuid);
    if (!rootUuid) {
      return;
    }
    var maybeValue = this.stepsByRoot.get(rootUuid);
    if (!maybeValue) {
      return;
    }
    var newValue = maybeValue.filter(value => value !== stepUuid);
    this.stepsByRoot.set(rootUuid, newValue);
  }
}
var _handleMetadataMessage = /*#__PURE__*/new WeakMap();
var _handleStepMetadataMessage = /*#__PURE__*/new WeakMap();
var _handleStartStepMessage = /*#__PURE__*/new WeakMap();
var _handleStopStepMessage = /*#__PURE__*/new WeakMap();
var _handleAttachmentContentMessage = /*#__PURE__*/new WeakMap();
var _handleAttachmentPathMessage = /*#__PURE__*/new WeakMap();
var _findParent = /*#__PURE__*/new WeakMap();
var _writeFixturesOfScope = /*#__PURE__*/new WeakMap();
var _writeContainer = /*#__PURE__*/new WeakMap();
var _calculateTimings = /*#__PURE__*/new WeakMap();
export class ReporterRuntime {
  constructor(_ref) {
    var _this = this;
    var {
      writer,
      listeners = [],
      environmentInfo,
      categories,
      links: _links
    } = _ref;
    _defineProperty(this, "state", new LifecycleState());
    _defineProperty(this, "notifier", void 0);
    _defineProperty(this, "stepStack", new DefaultStepStack());
    _defineProperty(this, "writer", void 0);
    _defineProperty(this, "categories", void 0);
    _defineProperty(this, "environmentInfo", void 0);
    _defineProperty(this, "linkConfig", void 0);
    _defineProperty(this, "startScope", () => {
      var uuid = randomUuid();
      this.state.setScope(uuid);
      return uuid;
    });
    _defineProperty(this, "updateScope", (uuid, updateFunc) => {
      var scope = this.state.getScope(uuid);
      if (!scope) {
        // eslint-disable-next-line no-console
        console.error("count not update scope: no scope with uuid ".concat(uuid, " is found"));
        return;
      }
      updateFunc(scope);
    });
    _defineProperty(this, "writeScope", uuid => {
      var scope = this.state.getScope(uuid);
      if (!scope) {
        // eslint-disable-next-line no-console
        console.error("count not write scope: no scope with uuid ".concat(uuid, " is found"));
        return;
      }
      _classPrivateFieldGet(_writeFixturesOfScope, this).call(this, scope);
      this.state.deleteScope(scope.uuid);
    });
    _defineProperty(this, "startFixture", (scopeUuid, type, fixtureResult) => {
      var scope = this.state.getScope(scopeUuid);
      if (!scope) {
        // eslint-disable-next-line no-console
        console.error("count not start fixture: no scope with uuid ".concat(scopeUuid, " is found"));
        return;
      }
      var uuid = randomUuid();
      var wrappedFixture = this.state.setFixtureResult(scopeUuid, uuid, type, _objectSpread(_objectSpread({}, createFixtureResult()), {}, {
        start: Date.now()
      }, fixtureResult));
      scope.fixtures.push(wrappedFixture);
      return uuid;
    });
    _defineProperty(this, "updateFixture", (uuid, updateFunc) => {
      var fixture = this.state.getFixtureResult(uuid);
      if (!fixture) {
        // eslint-disable-next-line no-console
        console.error("could not update fixture: no fixture with uuid ".concat(uuid, " is found"));
        return;
      }
      updateFunc(fixture);
    });
    _defineProperty(this, "stopFixture", (uuid, opts) => {
      var fixture = this.state.getFixtureResult(uuid);
      if (!fixture) {
        // eslint-disable-next-line no-console
        console.error("could not stop fixture: no fixture with uuid ".concat(uuid, " is found"));
        return;
      }
      var startStop = _classPrivateFieldGet(_calculateTimings, this).call(this, fixture.start, opts === null || opts === void 0 ? void 0 : opts.stop, opts === null || opts === void 0 ? void 0 : opts.duration);
      fixture.start = startStop.start;
      fixture.stop = startStop.stop;
      fixture.stage = Stage.FINISHED;
    });
    _defineProperty(this, "startTest", function (result) {
      var scopeUuids = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var uuid = randomUuid();
      var testResult = _objectSpread(_objectSpread({}, createTestResult(uuid)), {}, {
        start: Date.now()
      }, deepClone(result));
      _this.notifier.beforeTestResultStart(testResult);
      scopeUuids.forEach(scopeUuid => {
        var scope = _this.state.getScope(scopeUuid);
        if (!scope) {
          // eslint-disable-next-line no-console
          console.error("count not link test to the scope: no scope with uuid ".concat(uuid, " is found"));
          return;
        }
        scope.tests.push(uuid);
      });
      _this.state.setTestResult(uuid, testResult, scopeUuids);
      _this.notifier.afterTestResultStart(testResult);
      return uuid;
    });
    _defineProperty(this, "updateTest", (uuid, updateFunc) => {
      var testResult = this.state.getTestResult(uuid);
      if (!testResult) {
        // eslint-disable-next-line no-console
        console.error("could not update test result: no test with uuid ".concat(uuid, ") is found"));
        return;
      }
      this.notifier.beforeTestResultUpdate(testResult);
      updateFunc(testResult);
      this.notifier.afterTestResultUpdate(testResult);
    });
    _defineProperty(this, "stopTest", (uuid, opts) => {
      var _testResult$testCaseI, _testResult$historyId;
      var wrapped = this.state.getWrappedTestResult(uuid);
      if (!wrapped) {
        // eslint-disable-next-line no-console
        console.error("could not stop test result: no test with uuid ".concat(uuid, ") is found"));
        return;
      }
      var testResult = wrapped.value;
      this.notifier.beforeTestResultStop(testResult);
      (_testResult$testCaseI = testResult.testCaseId) !== null && _testResult$testCaseI !== void 0 ? _testResult$testCaseI : testResult.testCaseId = getTestResultTestCaseId(testResult);
      (_testResult$historyId = testResult.historyId) !== null && _testResult$historyId !== void 0 ? _testResult$historyId : testResult.historyId = getTestResultHistoryId(testResult);
      var startStop = _classPrivateFieldGet(_calculateTimings, this).call(this, testResult.start, opts === null || opts === void 0 ? void 0 : opts.stop, opts === null || opts === void 0 ? void 0 : opts.duration);
      testResult.start = startStop.start;
      testResult.stop = startStop.stop;
      var scopeUuids = wrapped.scopeUuids;
      scopeUuids.forEach(scopeUuid => {
        var scope = this.state.getScope(scopeUuid);
        if (scope !== null && scope !== void 0 && scope.labels) {
          testResult.labels = [...testResult.labels, ...scope.labels];
        }
      });
      this.notifier.afterTestResultStop(testResult);
    });
    _defineProperty(this, "writeTest", uuid => {
      var testResult = this.state.getTestResult(uuid);
      if (!testResult) {
        // eslint-disable-next-line no-console
        console.error("could not write test result: no test with uuid ".concat(uuid, " is found"));
        return;
      }
      if (hasSkipLabel(testResult.labels)) {
        this.state.deleteTestResult(uuid);
        return;
      }
      this.notifier.beforeTestResultWrite(testResult);
      this.writer.writeResult(testResult);
      this.state.deleteTestResult(uuid);
      this.notifier.afterTestResultWrite(testResult);
    });
    _defineProperty(this, "currentStep", rootUuid => {
      return this.stepStack.currentStep(rootUuid);
    });
    _defineProperty(this, "startStep", (rootUuid, parentStepUuid, result) => {
      var parent = _classPrivateFieldGet(_findParent, this).call(this, rootUuid, parentStepUuid);
      if (!parent) {
        // eslint-disable-next-line no-console
        console.error("could not start test step: no context for root ".concat(rootUuid, " and parentStepUuid ").concat(JSON.stringify(parentStepUuid), " is found"));
        return;
      }
      var stepResult = _objectSpread(_objectSpread({}, createStepResult()), {}, {
        start: Date.now()
      }, result);
      parent.steps.push(stepResult);
      var stepUuid = randomUuid();
      this.state.setStepResult(stepUuid, stepResult);
      this.stepStack.addStep(rootUuid, stepUuid);
      return stepUuid;
    });
    _defineProperty(this, "updateStep", (uuid, updateFunc) => {
      var step = this.state.getStepResult(uuid);
      if (!step) {
        // eslint-disable-next-line no-console
        console.error("could not update test step: no step with uuid ".concat(uuid, " is found"));
        return;
      }
      updateFunc(step);
    });
    _defineProperty(this, "stopStep", (uuid, opts) => {
      var step = this.state.getStepResult(uuid);
      if (!step) {
        // eslint-disable-next-line no-console
        console.error("could not stop test step: no step with uuid ".concat(uuid, " is found"));
        return;
      }
      this.notifier.beforeStepStop(step);
      var startStop = _classPrivateFieldGet(_calculateTimings, this).call(this, step.start, opts === null || opts === void 0 ? void 0 : opts.stop, opts === null || opts === void 0 ? void 0 : opts.duration);
      step.start = startStop.start;
      step.stop = startStop.stop;
      step.stage = Stage.FINISHED;
      this.stepStack.removeStep(uuid);
      this.notifier.afterStepStop(step);
    });
    _defineProperty(this, "writeAttachment", (rootUuid, parentStepUuid, attachmentName, attachmentContentOrPath, options) => {
      var _options$fileExtensio;
      var parent = _classPrivateFieldGet(_findParent, this).call(this, rootUuid, parentStepUuid);
      if (!parent) {
        // eslint-disable-next-line no-console
        console.error("could not write test attachment: no context for root ".concat(rootUuid, " and parentStepUuid ").concat(JSON.stringify(parentStepUuid), " is found"));
        return;
      }
      var isPath = typeof attachmentContentOrPath === "string";
      var fileExtension = (_options$fileExtensio = options.fileExtension) !== null && _options$fileExtensio !== void 0 ? _options$fileExtensio : isPath ? extname(attachmentContentOrPath) : undefined;
      var attachmentFileName = buildAttachmentFileName({
        contentType: options.contentType,
        fileExtension
      });
      if (isPath) {
        this.writer.writeAttachmentFromPath(attachmentFileName, attachmentContentOrPath);
      } else {
        this.writer.writeAttachment(attachmentFileName, attachmentContentOrPath);
      }
      var attachment = {
        name: attachmentName,
        source: attachmentFileName,
        type: options.contentType
      };
      if (options.wrapInStep) {
        var {
          timestamp = Date.now()
        } = options;
        parent.steps.push({
          name: attachmentName,
          attachments: [attachment],
          start: timestamp,
          stop: timestamp
        });
      } else {
        parent.attachments.push(attachment);
      }
    });
    _defineProperty(this, "writeEnvironmentInfo", () => {
      if (!this.environmentInfo) {
        return;
      }
      this.writer.writeEnvironmentInfo(this.environmentInfo);
    });
    _defineProperty(this, "writeCategoriesDefinitions", () => {
      if (!this.categories) {
        return;
      }
      var serializedCategories = this.categories.map(c => {
        if (c.messageRegex instanceof RegExp) {
          c.messageRegex = c.messageRegex.source;
        }
        if (c.traceRegex instanceof RegExp) {
          c.traceRegex = c.traceRegex.source;
        }
        return c;
      });
      this.writer.writeCategoriesDefinitions(serializedCategories);
    });
    _defineProperty(this, "applyRuntimeMessages", (rootUuid, messages) => {
      messages.forEach(message => {
        switch (message.type) {
          case "metadata":
            _classPrivateFieldGet(_handleMetadataMessage, this).call(this, rootUuid, message.data);
            return;
          case "step_metadata":
            _classPrivateFieldGet(_handleStepMetadataMessage, this).call(this, rootUuid, message.data);
            return;
          case "step_start":
            _classPrivateFieldGet(_handleStartStepMessage, this).call(this, rootUuid, message.data);
            return;
          case "step_stop":
            _classPrivateFieldGet(_handleStopStepMessage, this).call(this, rootUuid, message.data);
            return;
          case "attachment_content":
            _classPrivateFieldGet(_handleAttachmentContentMessage, this).call(this, rootUuid, message.data);
            return;
          case "attachment_path":
            _classPrivateFieldGet(_handleAttachmentPathMessage, this).call(this, rootUuid, message.data);
            return;
          default:
            // eslint-disable-next-line no-console
            console.error("could not apply runtime messages: unknown message ".concat(JSON.stringify(message)));
            return;
        }
      });
    });
    _classPrivateFieldInitSpec(this, _handleMetadataMessage, (rootUuid, message) => {
      // only display name could be set to fixture.
      var fixtureResult = this.state.getWrappedFixtureResult(rootUuid);
      var {
        links,
        labels,
        parameters,
        displayName,
        testCaseId,
        historyId,
        description,
        descriptionHtml
      } = message;
      if (fixtureResult) {
        if (displayName) {
          this.updateFixture(rootUuid, result => {
            result.name = displayName;
          });
        }
        if (historyId) {
          // eslint-disable-next-line no-console
          console.error("historyId can't be changed within test fixtures");
        }
        if (testCaseId) {
          // eslint-disable-next-line no-console
          console.error("testCaseId can't be changed within test fixtures");
        }
        if (links || labels || parameters || description || descriptionHtml) {
          // in some frameworks, afterEach methods can be executed before test stop event, while
          // in others after. To remove the possible undetermined behaviour we only allow
          // using runtime metadata API in before hooks.
          if (fixtureResult.type === "after") {
            // eslint-disable-next-line no-console
            console.error("metadata messages isn't supported for after test fixtures");
            return;
          }
          this.updateScope(fixtureResult.scopeUuid, scope => {
            if (links) {
              scope.links = [...scope.links, ...(this.linkConfig ? formatLinks(this.linkConfig, links) : links)];
            }
            if (labels) {
              scope.labels = [...scope.labels, ...labels];
            }
            if (parameters) {
              scope.parameters = [...scope.parameters, ...parameters];
            }
            if (description) {
              scope.description = description;
            }
            if (descriptionHtml) {
              scope.descriptionHtml = descriptionHtml;
            }
          });
        }
        return;
      }
      this.updateTest(rootUuid, result => {
        if (links) {
          result.links = [...result.links, ...(this.linkConfig ? formatLinks(this.linkConfig, links) : links)];
        }
        if (labels) {
          result.labels = [...result.labels, ...labels];
        }
        if (parameters) {
          result.parameters = [...result.parameters, ...parameters];
        }
        if (displayName) {
          result.name = displayName;
        }
        if (testCaseId) {
          result.testCaseId = testCaseId;
        }
        if (historyId) {
          result.historyId = historyId;
        }
        if (description) {
          result.description = description;
        }
        if (descriptionHtml) {
          result.descriptionHtml = descriptionHtml;
        }
      });
    });
    _classPrivateFieldInitSpec(this, _handleStepMetadataMessage, (rootUuid, message) => {
      var stepUuid = this.currentStep(rootUuid);
      if (!stepUuid) {
        // eslint-disable-next-line no-console
        console.error("could not handle step metadata message: no step is running");
        return;
      }
      var {
        name,
        parameters
      } = message;
      this.updateStep(stepUuid, stepResult => {
        if (name) {
          stepResult.name = name;
        }
        if (parameters) {
          stepResult.parameters = [...stepResult.parameters, ...parameters];
        }
      });
    });
    _classPrivateFieldInitSpec(this, _handleStartStepMessage, (rootUuid, message) => {
      this.startStep(rootUuid, undefined, _objectSpread({}, message));
    });
    _classPrivateFieldInitSpec(this, _handleStopStepMessage, (rootUuid, message) => {
      var stepUuid = this.currentStep(rootUuid);
      if (!stepUuid) {
        // eslint-disable-next-line no-console
        console.error("could not handle step stop message: no step is running");
        return;
      }
      this.updateStep(stepUuid, result => {
        if (message.status && !result.status) {
          result.status = message.status;
        }
        if (message.statusDetails) {
          result.statusDetails = _objectSpread(_objectSpread({}, result.statusDetails), message.statusDetails);
        }
      });
      this.stopStep(stepUuid, {
        stop: message.stop
      });
    });
    _classPrivateFieldInitSpec(this, _handleAttachmentContentMessage, (rootUuid, message) => {
      this.writeAttachment(rootUuid, undefined, message.name, Buffer.from(message.content, message.encoding), {
        encoding: message.encoding,
        contentType: message.contentType,
        fileExtension: message.fileExtension,
        wrapInStep: message.wrapInStep,
        timestamp: message.timestamp
      });
    });
    _classPrivateFieldInitSpec(this, _handleAttachmentPathMessage, (rootUuid, message) => {
      this.writeAttachment(rootUuid, undefined, message.name, message.path, {
        contentType: message.contentType,
        fileExtension: message.fileExtension,
        wrapInStep: message.wrapInStep,
        timestamp: message.timestamp
      });
    });
    _classPrivateFieldInitSpec(this, _findParent, (rootUuid, parentStepUuid) => {
      var root = this.state.getExecutionItem(rootUuid);
      if (!root) {
        return;
      }
      if (parentStepUuid === null) {
        return root;
      } else if (parentStepUuid === undefined) {
        var _stepUuid = this.currentStep(rootUuid);
        return _stepUuid ? this.state.getStepResult(_stepUuid) : root;
      } else {
        return this.state.getStepResult(parentStepUuid);
      }
    });
    _classPrivateFieldInitSpec(this, _writeFixturesOfScope, _ref2 => {
      var {
        fixtures,
        tests
      } = _ref2;
      var writtenFixtures = new Set();
      if (tests.length) {
        for (var wrappedFixture of fixtures) {
          if (!writtenFixtures.has(wrappedFixture.uuid)) {
            _classPrivateFieldGet(_writeContainer, this).call(this, tests, wrappedFixture);
            this.state.deleteFixtureResult(wrappedFixture.uuid);
            writtenFixtures.add(wrappedFixture.uuid);
          }
        }
      }
    });
    _classPrivateFieldInitSpec(this, _writeContainer, (tests, wrappedFixture) => {
      var fixture = wrappedFixture.value;
      var befores = wrappedFixture.type === "before" ? [wrappedFixture.value] : [];
      var afters = wrappedFixture.type === "after" ? [wrappedFixture.value] : [];
      this.writer.writeGroup({
        uuid: wrappedFixture.uuid,
        name: fixture.name,
        children: [...new Set(tests)],
        befores,
        afters
      });
    });
    _classPrivateFieldInitSpec(this, _calculateTimings, (start, stop, duration) => {
      var result = {
        start,
        stop
      };
      if (duration) {
        var normalisedDuration = Math.max(0, duration);
        if (result.stop !== undefined) {
          result.start = result.stop - normalisedDuration;
        } else if (result.start !== undefined) {
          result.stop = result.start + normalisedDuration;
        } else {
          result.stop = Date.now();
          result.start = result.stop - normalisedDuration;
        }
      } else {
        if (result.stop === undefined) {
          result.stop = Date.now();
        }
        if (result.start === undefined) {
          result.start = result.stop;
        }
      }
      return result;
    });
    this.writer = resolveWriter(writer);
    this.notifier = new Notifier({
      listeners
    });
    this.categories = categories;
    this.environmentInfo = environmentInfo;
    this.linkConfig = _links;
  }
}
//# sourceMappingURL=ReporterRuntime.js.map
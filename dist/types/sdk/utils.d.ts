import type { FixtureResult, Label, StatusDetails, StepResult, TestResult } from "../model.js";
import { LabelName, Status } from "../model.js";
import type { RuntimeMessage, SerializeOptions } from "./types.js";
export declare const getStatusFromError: (error: Error) => Status;
/**
 * https://github.com/chalk/strip-ansi
 */
export declare const stripAnsi: (str: string) => string;
export declare const getMessageAndTraceFromError: (error: Error | {
    message?: string;
    stack?: string;
}) => Pick<StatusDetails, "message" | "trace">;
export declare const allureIdRegexp: RegExp;
export declare const allureIdRegexpGlobal: RegExp;
export declare const allureLabelRegexp: RegExp;
export declare const allureLabelRegexpGlobal: RegExp;
export declare const isMetadataTag: (tag: string) => boolean;
export declare const extractMetadataFromString: (title: string) => {
    labels: Label[];
    cleanTitle: string;
};
export declare const isAnyStepFailed: (item: StepResult | TestResult | FixtureResult) => boolean;
export declare const isAllStepsEnded: (item: StepResult | TestResult | FixtureResult) => boolean;
export declare const hasLabel: (testResult: TestResult, labelName: LabelName | string) => boolean;
export declare const hasStepMessage: (messages: RuntimeMessage[]) => boolean;
export declare const getStepsMessagesPair: (messages: RuntimeMessage[]) => RuntimeMessage[][];
export declare const getUnfinishedStepsMessages: (messages: RuntimeMessage[]) => RuntimeMessage[][];
export declare const isPromise: <T = any>(obj: any) => obj is PromiseLike<T>;
export declare const serialize: (value: any, { maxDepth, maxLength }?: SerializeOptions) => string;

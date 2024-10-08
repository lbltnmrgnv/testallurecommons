import { type AttachmentOptions, type FixtureResult, type StepResult, type TestResult } from "../../model.js";
import type { Category, EnvironmentInfo, RuntimeMessage } from "../types.js";
import type { FixtureType, LinkConfig, ReporterRuntimeConfig, TestScope, Writer } from "./types.js";
export declare class ReporterRuntime {
    #private;
    private readonly state;
    private notifier;
    private stepStack;
    writer: Writer;
    categories?: Category[];
    environmentInfo?: EnvironmentInfo;
    linkConfig?: LinkConfig;
    constructor({ writer, listeners, environmentInfo, categories, links }: ReporterRuntimeConfig);
    startScope: () => string;
    updateScope: (uuid: string, updateFunc: (scope: TestScope) => void) => void;
    writeScope: (uuid: string) => void;
    startFixture: (scopeUuid: string, type: FixtureType, fixtureResult: Partial<FixtureResult>) => string | undefined;
    updateFixture: (uuid: string, updateFunc: (result: FixtureResult) => void) => void;
    stopFixture: (uuid: string, opts?: {
        stop?: number;
        duration?: number;
    }) => void;
    startTest: (result: Partial<TestResult>, scopeUuids?: string[]) => string;
    updateTest: (uuid: string, updateFunc: (result: TestResult) => void) => void;
    stopTest: (uuid: string, opts?: {
        stop?: number;
        duration?: number;
    }) => void;
    writeTest: (uuid: string) => void;
    currentStep: (rootUuid: string) => string | undefined;
    startStep: (rootUuid: string, parentStepUuid: string | null | undefined, result: Partial<StepResult>) => string | undefined;
    updateStep: (uuid: string, updateFunc: (stepResult: StepResult) => void) => void;
    stopStep: (uuid: string, opts?: {
        stop?: number;
        duration?: number;
    }) => void;
    writeAttachment: (rootUuid: string, parentStepUuid: string | null | undefined, attachmentName: string, attachmentContentOrPath: Buffer | string, options: AttachmentOptions & {
        wrapInStep?: boolean;
        timestamp?: number;
    }) => void;
    writeEnvironmentInfo: () => void;
    writeCategoriesDefinitions: () => void;
    applyRuntimeMessages: (rootUuid: string, messages: RuntimeMessage[]) => void;
}

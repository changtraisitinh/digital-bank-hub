import { RiskRulePlugin } from '@/lib/plugins/common-plugin/risk-rules-plugin';
import { AnyRecord, TWorkflowHelpers } from '@ballerine/common';
import type { MachineConfig, MachineOptions } from 'xstate';
import type {
  ChildWorkflowPluginParams,
  ISerializableChildPluginParams,
  ISerializableCommonPluginParams,
  ISerializableMappingPluginParams,
  ISerializableRiskRulesPlugin,
  WorkflowTokenPluginParams,
} from './plugins/common-plugin/types';
import type { DispatchEventPlugin } from './plugins/external-plugin/dispatch-event-plugin';
import type {
  IDispatchEventPluginParams,
  ISerializableHttpPluginParams,
} from './plugins/external-plugin/types';
import type { CommonPlugins, HttpPlugins, StatePlugins } from './plugins/types';
import type { TContext } from './utils';
import type { THelperFormatingLogic } from './utils/context-transformers/types';

export type ObjectValues<TObject extends Record<any, any>> = TObject[keyof TObject];

export interface Workflow {
  subscribe: (eventName: string, callback: (event: WorkflowEvent) => Promise<void>) => void;
  sendEvent: (event: WorkflowEventWithoutState, additionalContext?: AnyRecord) => Promise<void>;
  getSnapshot: () => Record<PropertyKey, any>;
  invokePlugin: (pluginName: string, additionalContext?: AnyRecord) => Promise<void>;
  overrideContext: (context: any) => any;
  getLogs: () => WorkflowLogEntry[];
  clearLogs: () => void;
}

export interface WorkflowEvent {
  type: string;
  state: string;
  error?: unknown;
  payload?: Record<PropertyKey, unknown>;
}

export interface WorkflowExtensions {
  statePlugins?: StatePlugins;
  dispatchEventPlugins?: DispatchEventPlugin[] | IDispatchEventPluginParams[];
  apiPlugins?: HttpPlugins | ISerializableHttpPluginParams[];
  commonPlugins?:
    | CommonPlugins
    | ISerializableCommonPluginParams[]
    | ISerializableMappingPluginParams[]
    | ISerializableRiskRulesPlugin[];
  childWorkflowPlugins?: ISerializableChildPluginParams[];
}

export interface ChildWorkflowCallback {
  transformers?: SerializableTransformer[];
  action: 'append';
  persistenceStates?: string[];
  deliverEvent?: string;
}

export interface ChildToParentCallback {
  childCallbackResults?: Array<ChildWorkflowCallback & { definitionId: string }>;
}

export type TWorkflowTokenPluginCallback = WorkflowTokenCallbackInput;

export interface WorkflowContext {
  id?: string;
  state?: any;
  machineContext?: any;
  sessionData?: any;
  lockKey?: string;
}

export interface ChildCallbackable {
  invokeChildWorkflowAction?: (childParams: ChildPluginCallbackOutput) => Promise<void>;
}

export interface WorkflowOptions {
  runtimeId: string;
  definitionType: 'statechart-json' | 'bpmn-json';
  definition: MachineConfig<any, any, any>;
  config?: MachineConfig<any, any, any>;
  workflowActions?: MachineOptions<any, any>['actions'];
  workflowContext?: WorkflowContext;
  extensions?: WorkflowExtensions;
  invokeRiskRulesAction?: RiskRulePlugin['action'];
  invokeChildWorkflowAction?: ChildCallbackable['invokeChildWorkflowAction'];
  invokeWorkflowTokenAction?: WorkflowTokenPluginParams['action'];
  secretsManager?: SecretsManager;
  helpers?: TWorkflowHelpers;
}

export interface WorkflowRunnerArgs {
  runtimeId: string;
  definition: MachineConfig<any, any, any>;
  config?: MachineConfig<any, any, any>;
  workflowActions?: MachineOptions<any, any>['actions'];
  workflowContext?: WorkflowContext;
  extensions?: WorkflowExtensions;
  invokeRiskRulesAction?: RiskRulePlugin['action'];
  invokeChildWorkflowAction?: ChildWorkflowPluginParams['action'];
  invokeWorkflowTokenAction?: WorkflowTokenPluginParams['action'];
  secretsManager?: SecretsManager;
  enableLogging?: boolean;
  helpers?: TWorkflowHelpers;
}

export type WorkflowEventWithoutState = Omit<WorkflowEvent, 'state'>;

export type TCreateWorkflow = (options: WorkflowOptions) => Workflow;

export const Error = {
  ERROR: 'ERROR',
  HTTP_ERROR: 'HTTP_ERROR',
} as const;

export const Errors = [Error.ERROR, Error.HTTP_ERROR] as const;

export type ChildPluginCallbackOutput = {
  parentWorkflowRuntimeId: string;
  definitionId: string;
  initOptions: {
    context: TContext;
    event?: string;
    config: AnyRecord;
  };
};

export type WorkflowTokenCallbackInput = {
  uiDefinitionId: string;
  workflowRuntimeId: string;
  expiresInMinutes?: number;
};

export type SerializableTransformer = {
  transformer: string;
  mapping: string | THelperFormatingLogic;
  options: any;
};

export const WorkflowEvents = {
  STATE_UPDATE: 'STATE_UPDATE',
  STATUS_UPDATE: 'STATUS_UPDATE',
  EVALUATION_ERROR: 'EVALUATION_ERROR',
} as const;

export type SecretsManager = {
  getAll: () => Promise<Record<string, string>>;
};

export enum WorkflowLogCategory {
  EVENT_RECEIVED = 'EVENT_RECEIVED',
  STATE_TRANSITION = 'STATE_TRANSITION',
  PLUGIN_INVOCATION = 'PLUGIN_INVOCATION',
  CONTEXT_CHANGED = 'CONTEXT_CHANGED',
  ERROR = 'ERROR',
  INFO = 'INFO',
}

export interface WorkflowLogEntry {
  category: WorkflowLogCategory;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  previousState?: string;
  newState?: string;
  eventName?: string;
  pluginName?: string;
}

import * as defaultTypes from './state.js';

// To extension
type ToExtensionCommand = 'setCurrentGlobalState' | 'resetGlobalState' | 'setInfo' | 'setError' | 'executeRunner';

interface ToExtensionCommandMessage {
    command: ToExtensionCommand;
    value: any;
}

interface ToExtensionSetInfoMessage extends ToExtensionCommandMessage {
    command: 'setInfo';
    value: string;
}

interface ToExtensionSetErrorMessage extends ToExtensionCommandMessage {
    command: 'setError';
    value: string;
}

interface ToExtensionExecuteRunnerMessage extends ToExtensionCommandMessage {
    command: 'executeRunner';
    value: {
        pastEntries: defaultTypes.HistoryEntry[];
        newEntry: defaultTypes.HistoryEntry;
    };
}

export type ToExtensionMessage =
    | ToExtensionSetInfoMessage
    | ToExtensionSetErrorMessage
    | ToExtensionExecuteRunnerMessage;

// From extension
type FromExtensionCommand = 'setWebviewState' | 'setProfiling' | 'runnerExecutionResult' | 'cancelRunnerExecution';

interface FromExtensionCommandMessage {
    command: FromExtensionCommand;
    value: any;
}
interface FromExtensionSetStateMessage extends FromExtensionCommandMessage {
    command: 'setWebviewState';
    value: defaultTypes.State;
}

interface FromExtensionSetProfilingMessage extends FromExtensionCommandMessage {
    command: 'setProfiling';
    value: { columnName: string; profiling: defaultTypes.Profiling }[];
}

interface RunnerExecutionResultBase {
    type: 'tab' | 'table' | 'profiling';
    historyId: number;
}

interface RunnerExecutionResultTab extends RunnerExecutionResultBase {
    type: 'tab';
    content: defaultTypes.Tab;
}

interface RunnerExecutionResultTable extends RunnerExecutionResultBase {
    type: 'table';
    content: defaultTypes.Table;
}

interface RunnerExecutionResultProfiling extends RunnerExecutionResultBase {
    type: 'profiling';
    content: defaultTypes.Profiling;
}

export interface RunnerExecutionResultMessage extends FromExtensionCommandMessage {
    command: 'runnerExecutionResult';
    value: RunnerExecutionResultTab | RunnerExecutionResultTable | RunnerExecutionResultProfiling;
}

export interface CancelRunnerExecutionMessage extends FromExtensionCommandMessage {
    command: 'cancelRunnerExecution';
    value: defaultTypes.HistoryEntry;
}

export type FromExtensionMessage =
    | FromExtensionSetStateMessage
    | FromExtensionSetProfilingMessage
    | RunnerExecutionResultMessage
    | CancelRunnerExecutionMessage;

import * as defaultTypes from './state';

// To extension
type ToExtensionCommand = 'setCurrentGlobalState' | 'resetGlobalState' | 'setInfo' | 'setError';

interface ToExtensionCommandMessage {
    command: ToExtensionCommand;
    value: any;
}
interface ToExtensionSetStateMessage extends ToExtensionCommandMessage {
    command: 'setCurrentGlobalState';
    value: defaultTypes.State;
}

interface ToExtensionResetStateMessage extends ToExtensionCommandMessage {
    command: 'resetGlobalState';
    value: null;
}

// Just example
interface ToExtensionSetInfoMessage extends ToExtensionCommandMessage {
    command: 'setInfo';
    value: string;
}

interface ToExtensionSetErrorMessage extends ToExtensionCommandMessage {
    command: 'setError';
    value: string;
}

export type ToExtensionMessage =
    | ToExtensionSetInfoMessage
    | ToExtensionSetStateMessage
    | ToExtensionResetStateMessage
    | ToExtensionSetErrorMessage;

// From extension
type FromExtensionCommand = 'setWebviewState' | 'setProfiling';

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

export type FromExtensionMessage = FromExtensionSetStateMessage | FromExtensionSetProfilingMessage;

/**
 * Any message that can be sent or received by the python server.
 *
 * The type field identifies the type of the message.
 *
 * The id field is a unique identifier to track messages to their origin.
 * A program message contains the id. A response message containing an error, progress or a placeholder then contains the same id.
 */
export type PythonServerMessage =
    | ProgramMessage
    | PlaceholderQueryMessage
    | PlaceholderTypeMessage
    | PlaceholderValueMessage
    | RuntimeErrorMessage
    | RuntimeProgressMessage
    | ShutdownMessage;

export type RuntimeProgress = 'done';

// Extension to Python Server
/**
 * Message that contains a fully executable compiled Safe-DS pipeline.
 */
export interface ProgramMessage {
    type: 'program';
    id: string;
    data: ProgramPackageMap;
}

/**
 * Contains code and the description of the main entry point of a pipeline.
 */
export interface ProgramPackageMap {
    code: ProgramCodeMap;
    main: ProgramMainInformation;
}

/**
 * Contains python modules grouped by a virtual directory structure. The key is a path, directories are separated by '.'.
 */
export interface ProgramCodeMap {
    [key: string]: ProgramModuleMap;
}

/**
 * Contains python module code identified by the module name.
 */
export interface ProgramModuleMap {
    [key: string]: string;
}

/**
 * Contains execution information about a pipeline.
 * Field modulepath contains the path to the current module.
 * Field module contains the current module name.
 * Field pipeline contains the pipeline name.
 */
export interface ProgramMainInformation {
    modulepath: string;
    module: string;
    pipeline: string;
}

// Extension to Python Server
/**
 * Message that contains a request to send back the value of a specified placeholder
 */
export interface PlaceholderQueryMessage {
    type: 'placeholder_query';
    id: string;
    data: PlaceholderQuery;
}

/**
 * Contains the query for a placeholder value.
 * Field name contains the name of the requested placeholder, field window_begin may contain an offset of and window_size may contain the size of a subset of the requested data.
 */
export interface PlaceholderQuery {
    name: string;
    window_begin?: number;
    window_size?: number;
}

// Python Server to Extension
/**
 * Message that contains information about a calculated placeholder.
 */
export interface PlaceholderTypeMessage {
    type: 'placeholder_type';
    id: string;
    data: PlaceholderDescription;
}

/**
 * Contains the name and the type of a calculated placeholder.
 */
export interface PlaceholderDescription {
    name: string;
    type: string;
}

/**
 * Message that contains the value of a calculated placeholder.
 */
export interface PlaceholderValueMessage {
    type: 'placeholder_value';
    id: string;
    data: PlaceholderValue;
}

/**
 * Contains the name, type and the actual value of a calculated placeholder.
 */
export interface PlaceholderValue {
    name: string;
    type: string;
    value: string;
    windowed?: boolean;
    window_begin?: number;
    window_size?: number;
    window_max?: number;
}

// Python Server to Extension
/**
 * Message that contains information about a runtime error that occurred during execution.
 */
export interface RuntimeErrorMessage {
    type: 'runtime_error';
    id: string;
    data: RuntimeErrorDescription;
}

/**
 * Field message contains the error message.
 * Field backtrace contains an array of stackframes present at the moment of raising the error
 */
export interface RuntimeErrorDescription {
    message: string;
    backtrace: RuntimeErrorBacktraceFrame[];
}

/**
 * Contains debugging information about a stackframe.
 * Field file contains the python module name (or file name), field line contains the line number where the error occurred.
 */
export interface RuntimeErrorBacktraceFrame {
    file: string;
    line: number;
}

// Python Server to Extension
/**
 * Message that contains information about the current execution progress.
 * Field data currently supports on of the following: 'done'
 *
 * A progress value of 'done' means that the pipeline execution completed.
 */
export interface RuntimeProgressMessage {
    type: 'runtime_progress';
    id: string;
    data: RuntimeProgress;
}

export const createProgramMessage = function (id: string, data: ProgramPackageMap): PythonServerMessage {
    return { type: 'program', id, data };
};

export const createPlaceholderQueryMessage = function (
    id: string,
    placeholderName: string,
    windowBegin: number | undefined = undefined,
    windowSize: number | undefined = undefined,
): PythonServerMessage {
    return {
        type: 'placeholder_query',
        id,
        data: {
            name: placeholderName,
            window_begin: !windowBegin ? undefined : Math.round(windowBegin),
            window_size: !windowSize ? undefined : Math.round(windowSize),
        },
    };
};

// Extension to Python Server
/**
 * Message that instructs the python server to shut itself down as soon as possible.
 *
 * There will be no response to this message, data and id fields are therefore empty.
 */
export interface ShutdownMessage {
    type: 'shutdown';
    id: '';
    data: '';
}

export const createShutdownMessage = function (): PythonServerMessage {
    return { type: 'shutdown', id: '', data: '' };
};

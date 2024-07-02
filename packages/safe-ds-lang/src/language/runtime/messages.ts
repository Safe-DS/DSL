/**
 * Any message that can be sent or received by the runner.
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

// Extension to Runner
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
    cwd?: string;
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
 */
export interface ProgramMainInformation {
    /**
     * The path to the current module.
     */
    modulepath: string;

    /**
     * The current module name.
     */
    module: string;

    /**
     * The pipeline name.
     */
    pipeline: string;
}

// Extension to Runner
/**
 * Message that contains a request to send back the value of a specified placeholder
 */
export interface PlaceholderQueryMessage {
    type: 'placeholder_query';
    id: string;
    data: PlaceholderQuery;
}

/**
 * A query on a placeholder value.
 */
export interface PlaceholderQuery {
    /**
     * The name of the requested placeholder.
     */
    name: string;

    /**
     * Optional windowing information to request a subset of the available data.
     */
    window: PlaceholderQueryWindow;
}

/**
 * Windowing information for the placeholder query.
 */
export interface PlaceholderQueryWindow {
    /**
     * The offset of the requested data.
     */
    begin?: number;

    /**
     * The size of the requested data.
     */
    size?: number;
}

// Runner to Extension
/**
 * Message that contains information about a calculated placeholder.
 */
export interface PlaceholderTypeMessage {
    type: 'placeholder_type';
    id: string;
    data: PlaceholderDescription;
}

/**
 * Contains the description of a calculated placeholder.
 */
export interface PlaceholderDescription {
    /**
     * Name of the calculated placeholder.
     */
    name: string;

    /**
     * Type of the calculated placeholder
     */
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
 * Contains the description and the value of a calculated placeholder.
 */
export interface PlaceholderValue {
    /**
     * Name of the calculated placeholder.
     */
    name: string;

    /**
     * Type of the calculated placeholder.
     */
    type: string;

    /**
     * Actual value of the calculated placeholder.
     */
    value: string;

    /**
     * Optional windowing information when only a subset of the data was requested. This may be different from the requested bounds.
     */
    window?: PlaceholderValueWindow;
}

/**
 * Windowing information for a placeholder value response.
 */
export interface PlaceholderValueWindow {
    /**
     * Index offset of the requested data subset.
     */
    begin: number;

    /**
     * Size of the requested data subset.
     */
    size: number;

    /**
     * Max. amount of elements available.
     */
    max: number;
}

// Runner to Extension
/**
 * Message that contains information about a runtime error that occurred during execution.
 */
export interface RuntimeErrorMessage {
    type: 'runtime_error';
    id: string;
    data: RuntimeErrorDescription;
}

/**
 * Error description for runtime errors.
 */
export interface RuntimeErrorDescription {
    /**
     * Error Message
     */
    message: string;

    /**
     * Array of stackframes at the moment of raising the error.
     */
    backtrace: RuntimeErrorBacktraceFrame[];
}

/**
 * Contains debugging information about a stackframe.
 */
export interface RuntimeErrorBacktraceFrame {
    /**
     * Python module name (or file name).
     */
    file: string;

    /**
     * Line number where the error occurred.
     */
    line: number;
}

// Runner to Extension
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
            window: {
                begin: !windowBegin ? undefined : Math.round(windowBegin),
                size: !windowSize ? undefined : Math.round(windowSize),
            },
        },
    };
};

// Extension to Runner
/**
 * Message that instructs the runner to shut itself down as soon as possible.
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

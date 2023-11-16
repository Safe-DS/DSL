export type PythonServerMessage = ProgramMessage | PlaceholderValueMessage | RuntimeErrorMessage | ProgressMessage;

// Extension to Python Server
export interface ProgramMessage {
    type: 'program';
    data: ProgramPackageMap;
}

export interface ProgramPackageMap {
    code: ProgramCodeMap;
    main: ProgramMainInformation;
}

export interface ProgramCodeMap {
    [key: string]: ProgramModuleMap;
}

export interface ProgramModuleMap {
    [key: string]: string;
}

export interface ProgramMainInformation {
    package: string;
    module: string;
    pipeline: string;
}

// Python Server to Extension
export interface PlaceholderValueMessage {
    type: 'value';
    data: PlaceholderValue;
}

export interface PlaceholderValue {
    name: string;
    type: string;
    value: string;
}

// Python Server to Extension
export interface RuntimeErrorMessage {
    type: 'runtime_error';
    data: RuntimeErrorDescription;
}

export interface RuntimeErrorDescription {
    message: string;
    backtrace: RuntimeErrorBacktraceFrame[];
}

export interface RuntimeErrorBacktraceFrame {
    file: string;
    line: number;
}

// Python Server to Extension
export interface ProgressMessage {
    type: 'progress';
    data: string;
}

export const createProgramMessage = function (data: ProgramPackageMap): PythonServerMessage {
    return { type: 'program', data };
};

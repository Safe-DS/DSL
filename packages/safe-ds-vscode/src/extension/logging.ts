import vscode, { LogLevel, LogOutputChannel, ViewColumn } from 'vscode';

const TRACE_PREFIX = /^\[Trace.*?\] /iu;
const DEBUG_PREFIX = /^\[Debug.*?\] /iu;
const INFO_PREFIX = /^\[Info.*?\] /iu;
const WARN_PREFIX = /^\[Warn.*?\] /iu;
const ERROR_PREFIX = /^\[Error.*?\] /iu;

export class SafeDsLogOutputChannel implements LogOutputChannel {
    private readonly delegate: LogOutputChannel;

    constructor(name: string) {
        this.delegate = vscode.window.createOutputChannel(name, { log: true });
    }

    get logLevel(): LogLevel {
        return this.delegate.logLevel;
    }

    get name(): string {
        return this.delegate.name;
    }

    get onDidChangeLogLevel(): vscode.Event<LogLevel> {
        return this.delegate.onDidChangeLogLevel;
    }

    append(value: string): void {
        this.delegate.append(value);
    }

    appendLine(value: string): void {
        if (TRACE_PREFIX.test(value)) {
            this.delegate.trace(value.replace(TRACE_PREFIX, ''));
        } else if (DEBUG_PREFIX.test(value)) {
            this.delegate.debug(value.replace(DEBUG_PREFIX, ''));
        } else if (INFO_PREFIX.test(value)) {
            this.delegate.info(value.replace(INFO_PREFIX, ''));
        } else if (WARN_PREFIX.test(value)) {
            this.delegate.warn(value.replace(WARN_PREFIX, ''));
        } else if (ERROR_PREFIX.test(value)) {
            this.delegate.error(value.replace(ERROR_PREFIX, ''));
        } else {
            this.delegate.appendLine(value);
        }
    }

    clear(): void {
        this.delegate.clear();
    }

    debug(message: string, ...args: any[]): void {
        this.delegate.debug(message, args);
    }

    dispose(): void {
        this.delegate.dispose();
    }

    error(error: string | Error, ...args: any[]): void {
        this.delegate.error(error, args);
    }

    hide(): void {
        this.delegate.hide();
    }

    info(message: string, ...args: any[]): void {
        this.delegate.info(message, args);
    }

    replace(value: string): void {
        this.delegate.replace(value);
    }

    show(preserveFocus?: boolean): void;
    show(column?: ViewColumn, preserveFocus?: boolean): void;
    show(columnOrPreserveFocus?: ViewColumn | boolean, preserveFocus?: boolean): void {
        if (typeof columnOrPreserveFocus === 'boolean') {
            this.delegate.show(columnOrPreserveFocus);
        } else {
            this.delegate.show(columnOrPreserveFocus, preserveFocus);
        }
    }

    trace(message: string, ...args: any[]): void {
        this.delegate.trace(message, args);
    }

    warn(message: string, ...args: any[]): void {
        this.delegate.warn(message, args);
    }
}

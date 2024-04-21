import vscode, { LogLevel, LogOutputChannel, OutputChannel, ViewColumn } from 'vscode';

const TRACE_PREFIX = /^\[Trace.*?\] /iu;
const DEBUG_PREFIX = /^\[Debug.*?\] /iu;
const INFO_PREFIX = /^\[Info.*?\] /iu;
const WARN_PREFIX = /^\[Warn.*?\] /iu;
const ERROR_PREFIX = /^\[Error.*?\] /iu;

const RESULT_PREFIX = /^.*\[Result\] /iu;

const RUNNER_TRACE_PREFIX = /^.*\[Python Server\].*\[?INFO\]?:?/iu;
const RUNNER_DEBUG_PREFIX = /^.*\[Python Server\].*\[?DEBUG\]?:?/iu;
const RUNNER_INFO_PREFIX = /^.*\[Python Server\].*\[?INFO\]?:?/iu;
const RUNNER_WARN_PREFIX = /^.*\[Python Server\].*\[?WARNING\]?:?/iu;
const RUNNER_ERROR_PREFIX = /^.*\[Python Server\].*\[?ERROR\]?:?/iu;

class SafeDsLogger implements LogOutputChannel {
    private readonly languageServer: LogOutputChannel;
    private readonly results: OutputChannel;
    private readonly runner: LogOutputChannel;

    constructor() {
        this.languageServer = vscode.window.createOutputChannel('Safe-DS', { log: true });
        this.results = vscode.window.createOutputChannel('Safe-DS Results', 'safe-ds');
        this.runner = vscode.window.createOutputChannel('Safe-DS Runner', { log: true });
    }

    get logLevel(): LogLevel {
        return this.languageServer.logLevel;
    }

    get name(): string {
        return this.languageServer.name;
    }

    get onDidChangeLogLevel(): vscode.Event<LogLevel> {
        return this.languageServer.onDidChangeLogLevel;
    }

    append(value: string): void {
        this.languageServer.append(value);
    }

    appendLine(value: string): void {
        if (RUNNER_TRACE_PREFIX.test(value)) {
            this.runner.trace(value.replace(RUNNER_TRACE_PREFIX, ''));
        } else if (RUNNER_DEBUG_PREFIX.test(value)) {
            this.runner.debug(value.replace(RUNNER_DEBUG_PREFIX, ''));
        } else if (RUNNER_INFO_PREFIX.test(value)) {
            this.runner.info(value.replace(RUNNER_INFO_PREFIX, ''));
        } else if (RUNNER_WARN_PREFIX.test(value)) {
            this.runner.warn(value.replace(RUNNER_WARN_PREFIX, ''));
        } else if (RUNNER_ERROR_PREFIX.test(value)) {
            this.runner.error(value.replace(RUNNER_ERROR_PREFIX, ''));
        } else if (RESULT_PREFIX.test(value)) {
            this.results.appendLine(value.replace(RESULT_PREFIX, ''));
            this.results.show(true);
        } else if (TRACE_PREFIX.test(value)) {
            this.languageServer.trace(value.replace(TRACE_PREFIX, ''));
        } else if (DEBUG_PREFIX.test(value)) {
            this.languageServer.debug(value.replace(DEBUG_PREFIX, ''));
        } else if (INFO_PREFIX.test(value)) {
            this.languageServer.info(value.replace(INFO_PREFIX, ''));
        } else if (WARN_PREFIX.test(value)) {
            this.languageServer.warn(value.replace(WARN_PREFIX, ''));
        } else if (ERROR_PREFIX.test(value)) {
            this.languageServer.error(value.replace(ERROR_PREFIX, ''));
        } else {
            this.languageServer.appendLine(value);
        }
    }

    clear(): void {
        this.languageServer.clear();
    }

    debug(message: string, ...args: any[]): void {
        this.languageServer.debug(message, args);
    }

    dispose(): void {
        this.languageServer.dispose();
    }

    error(error: string | Error, ...args: any[]): void {
        this.languageServer.error(error, args);
    }

    hide(): void {
        this.languageServer.hide();
    }

    info(message: string, ...args: any[]): void {
        this.languageServer.info(message, args);
    }

    replace(value: string): void {
        this.languageServer.replace(value);
    }

    show(preserveFocus?: boolean): void;
    show(column?: ViewColumn, preserveFocus?: boolean): void;
    show(columnOrPreserveFocus?: ViewColumn | boolean, preserveFocus?: boolean): void {
        if (typeof columnOrPreserveFocus === 'boolean') {
            this.languageServer.show(columnOrPreserveFocus);
        } else {
            this.languageServer.show(columnOrPreserveFocus, preserveFocus);
        }
    }

    trace(message: string, ...args: any[]): void {
        this.languageServer.trace(message, args);
    }

    warn(message: string, ...args: any[]): void {
        this.languageServer.warn(message, args);
    }

    /**
     * Create a logger that prepends all messages with the given tag.
     */
    createTaggedLogger(tag: string) {
        return {
            trace: (message: string, verbose?: string) => this.trace(formatLogMessage(tag, message), verbose),
            debug: (message: string) => this.debug(formatLogMessage(tag, message)),
            info: (message: string) => this.info(formatLogMessage(tag, message)),
            warn: (message: string) => this.warn(formatLogMessage(tag, message)),
            error: (message: string) => this.error(formatLogMessage(tag, message)),
        };
    }
}

export const safeDsLogger = new SafeDsLogger();

const formatLogMessage = (tag: string, message: string): string => {
    return tag ? `[${tag}] ${message}` : message;
};

import vscode, { LogLevel, ViewColumn } from 'vscode';

let logOutputChannel: vscode.LogOutputChannel | undefined = undefined;

class PrefixedOutputChannel implements vscode.LogOutputChannel {
    readonly delegate: vscode.LogOutputChannel;
    readonly prefix: string;

    constructor(delegate: vscode.LogOutputChannel, prefix: string) {
        this.delegate = delegate;
        this.prefix = prefix;
    }

    append(value: string): void {
        this.delegate.append(value);
    }

    appendLine(value: string): void {
        this.delegate.appendLine(this.prefix + value);
    }

    clear(): void {
        this.delegate.clear();
    }

    debug(message: string, ...args: any[]): void {
        this.delegate.debug(this.prefix + message, args);
    }

    dispose(): void {
        // Don't do anything yet. There may be other uses for this channel
    }

    error(error: string | Error, ...args: any[]): void {
        this.delegate.error(this.prefix + error, args);
    }

    hide(): void {
        this.delegate.hide();
    }

    info(message: string, ...args: any[]): void {
        this.delegate.info(this.prefix + message, args);
    }

    replace(value: string): void {
        this.delegate.replace(value);
    }

    show(column: ViewColumn | boolean | undefined, preserveFocus: boolean | undefined = undefined): void {
        if (typeof column === 'boolean') {
            this.delegate.show(column);
        } else {
            this.delegate.show(column, preserveFocus);
        }
    }

    trace(message: string, ...args: any[]): void {
        this.delegate.trace(this.prefix + message, args);
    }

    warn(message: string, ...args: any[]): void {
        this.delegate.warn(this.prefix + message, args);
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
}

export const initializeLog = function () {
    logOutputChannel = vscode.window.createOutputChannel('Safe-DS', { log: true });
    logOutputChannel.show();
};

export const getSafeDSOutputChannel = function (prefix: string | undefined = undefined): vscode.LogOutputChannel {
    return new PrefixedOutputChannel(logOutputChannel!, !prefix ? '' : prefix);
};

export const logOutput = function (value: string) {
    logOutputChannel!.info(value);
    console.log(value);
};

export const logError = function (value: string) {
    logOutputChannel!.error(value);
    console.error(value);
};

export const printOutputMessage = function (value: string) {
    logOutputChannel!.appendLine(value);
    logOutputChannel!.show();
};

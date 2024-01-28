import vscode, { LogLevel, ViewColumn } from 'vscode';

let logOutputChannel: vscode.LogOutputChannel | undefined = undefined;

/**
 * An output channel, that prints a specific prefix before printing the actual message.
 */
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

/**
 * Initialize the logging system once for the extension.
 */
export const initializeLog = function () {
    logOutputChannel = vscode.window.createOutputChannel('Safe-DS', { log: true });
    logOutputChannel.show();
};

/**
 * Creates a new prefixed output channel based on the global output channel for this extension.
 *
 * @param prefix Prefix to display, or undefined to not display any prefix
 */
export const getSafeDSOutputChannel = function (prefix: string | undefined = undefined): vscode.LogOutputChannel {
    return new PrefixedOutputChannel(logOutputChannel!, !prefix ? '' : prefix);
};

/**
 * Log a string to the output channel and the extension debugger.
 *
 * @param value Log Message
 */
export const logOutput = function (value: string) {
    logOutputChannel!.info(value);
    console.log(value);
};

/**
 * Log a anything to the output channel and the extension debugger.
 *
 * @param value Log Message
 */
export const logAny = function (value: any) {
    logOutputChannel!.info(value);
    console.log(value);
};

/**
 * Log a string as an error to the output channel and the extension debugger.
 *
 * @param value Error Message
 */
export const logError = function (value: string) {
    logOutputChannel!.error(value);
    console.error(value);
};

/**
 * Print a friendly string to the output channel and open the output channel.
 * This function differs from logOutput, as it should be used to show useful information (like progress) to the user.
 *
 * @param value Message
 */
export const printOutputMessage = function (value: string) {
    logOutputChannel!.appendLine(value);
    logOutputChannel!.show();
};

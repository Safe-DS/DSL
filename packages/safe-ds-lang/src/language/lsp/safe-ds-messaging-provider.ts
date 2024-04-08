import { SafeDsServices } from '../safe-ds-module.js';
import { Connection } from 'vscode-languageserver';
import { Disposable } from 'vscode-languageserver-protocol';

/* c8 ignore start */

/**
 * Log or show messages in the language client or otherwise communicate with it.
 */
export class SafeDsMessagingProvider {
    private readonly connection: Connection | undefined;
    private logger: Logger | undefined = undefined;
    private userMessageProvider: UserMessageProvider | undefined = undefined;

    constructor(services: SafeDsServices) {
        this.connection = services.shared.lsp.Connection;
    }

    /**
     * Log the given data to the trace log.
     */
    trace(tag: string, message: string, verbose?: string): void {
        const text = this.formatLogMessage(tag, message);
        if (this.logger?.trace) {
            this.logger.trace(text, verbose);
        } else if (this.connection) {
            this.connection.tracer.log(text, verbose);
        }
    }

    /**
     * Log a debug message.
     */
    debug(tag: string, message: string): void {
        const text = this.formatLogMessage(tag, message);
        if (this.logger?.debug) {
            this.logger.debug(text);
        } else if (this.connection) {
            this.connection.console.debug(text);
        }
    }

    /**
     * Log an information message.
     */
    info(tag: string, message: string): void {
        const text = this.formatLogMessage(tag, message);
        if (this.logger?.info) {
            this.logger.info(text);
        } else if (this.connection) {
            this.connection.console.info(text);
        }
    }

    /**
     * Log a warning message.
     */
    warn(tag: string, message: string): void {
        const text = this.formatLogMessage(tag, message);
        if (this.logger?.warn) {
            this.logger.warn(text);
        } else if (this.connection) {
            this.connection.console.warn(text);
        }
    }

    /**
     * Log an error message.
     */
    error(tag: string, message: string): void {
        const text = this.formatLogMessage(tag, message);
        if (this.logger?.error) {
            this.logger.error(text);
        } else if (this.connection) {
            this.connection.console.error(text);
        }
    }

    private formatLogMessage(tag: string, message: string): string {
        return tag ? `[${tag}] ${message}` : message;
    }

    /**
     * Shows an information message in the client's user interface.
     *
     * Depending on the client this might be a modal dialog with a confirmation button or a notification in a
     * notification center.
     */
    showInformationMessage(message: string): void {
        if (this.userMessageProvider?.showInformationMessage) {
            this.userMessageProvider.showInformationMessage(message);
        } else if (this.connection) {
            this.connection.window.showInformationMessage(message);
        }
    }

    /**
     * Shows a warning message in the client's user interface.
     *
     * Depending on the client this might be a modal dialog with a confirmation button or a notification in a
     * notification center.
     */
    showWarningMessage(message: string): void {
        if (this.userMessageProvider?.showWarningMessage) {
            this.userMessageProvider.showWarningMessage(message);
        } else if (this.connection) {
            this.connection.window.showWarningMessage(message);
        }
    }

    /**
     * Shows an error message in the client's user interface.
     *
     * Depending on the client this might be a modal dialog with a confirmation button or a notification in a
     * notification center.
     */
    showErrorMessage(message: string): void {
        if (this.userMessageProvider?.showErrorMessage) {
            this.userMessageProvider.showErrorMessage(message);
        } else if (this.connection) {
            this.connection.window.showErrorMessage(message);
        }
    }

    /**
     * Installs a notification handler for the given method.
     *
     * @param method The method to register a request handler for.
     * @param handler The handler to install.
     */
    onNotification(method: string, handler: (...params: any[]) => void): Disposable {
        if (this.connection) {
            return this.connection.onNotification(method, handler);
        }

        return {
            dispose() {},
        };
    }

    /**
     * Send a notification to the client.
     *
     * @param method The method to invoke on the client.
     * @param params The notification's parameters.
     */
    async sendNotification(method: string, ...params: any): Promise<void> {
        if (this.connection) {
            await this.connection.sendNotification(method, params);
        }
    }

    /**
     * Set the logger to use for logging messages.
     */
    setLogger(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Set the user message provider to use for showing messages to the user.
     */
    setUserMessageProvider(userMessageProvider: UserMessageProvider) {
        this.userMessageProvider = userMessageProvider;
    }
}

/* c8 ignore stop */

/**
 * A logging provider.
 */
export interface Logger {
    /**
     * Log the given data to the trace log.
     */
    trace?: (message: string, verbose?: string) => void;

    /**
     * Log a debug message.
     */
    debug?: (message: string) => void;

    /**
     * Log an information message.
     */
    info?: (message: string) => void;

    /**
     * Log a warning message.
     */
    warn?: (message: string) => void;

    /**
     * Log an error message.
     */
    error?: (message: string) => void;
}

/**
 * A service for showing messages to the user.
 */
export interface UserMessageProvider {
    /**
     * Prominently show an information message. The message should be short and human-readable.
     */
    showInformationMessage?: (message: string) => void;

    /**
     * Prominently show a warning message. The message should be short and human-readable.
     */
    showWarningMessage?: (message: string) => void;

    /**
     * Prominently show an error message. The message should be short and human-readable.
     */
    showErrorMessage?: (message: string) => void;
}

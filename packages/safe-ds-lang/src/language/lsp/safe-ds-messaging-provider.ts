import { Logger, SafeDsServices } from '../safe-ds-module.js';
import { Connection } from 'vscode-languageserver';
import { Disposable } from 'vscode-languageserver-protocol';

/* c8 ignore start */

/**
 * Log or show messages in the language client or otherwise communicate with it.
 */
export class SafeDsMessagingProvider {
    private readonly connection: Connection | undefined;
    private logger: Logger | undefined = undefined;

    constructor(services: SafeDsServices) {
        this.connection = services.shared.lsp.Connection;
    }

    /**
     * Set the logger to use for logging messages.
     */
    setLogger(logger: Logger) {
        this.logger = logger;
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
        if (this.connection) {
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
        if (this.connection) {
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
        if (this.connection) {
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
}

/* c8 ignore stop */

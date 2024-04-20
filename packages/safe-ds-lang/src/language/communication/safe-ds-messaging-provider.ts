import { SafeDsServices } from '../safe-ds-module.js';
import { Connection, MessageActionItem, WorkDoneProgressReporter } from 'vscode-languageserver';
import { Disposable } from 'vscode-languageserver-protocol';

/**
 * Log or show messages in the language client or otherwise communicate with it.
 */
export class SafeDsMessagingProvider {
    private readonly connection: Connection | undefined;
    private logger: Partial<SafeDsLogger> | undefined = undefined;
    private userMessageProvider: Partial<SafeDsUserMessageProvider> | undefined = undefined;
    private messageBroker: Partial<SafeDsMessageBroker> | undefined = undefined;

    constructor(services: SafeDsServices) {
        this.connection = services.shared.lsp.Connection;
    }

    /**
     * Create a logger that prepends all messages with the given tag.
     */
    createTaggedLogger(tag: string): SafeDsLogger {
        return {
            trace: (message: string, verbose?: string) => this.trace(tag, message, verbose),
            debug: (message: string) => this.debug(tag, message),
            info: (message: string) => this.info(tag, message),
            warn: (message: string) => this.warn(tag, message),
            error: (message: string) => this.error(tag, message),
        };
    }

    /**
     * Log the given data to the trace log.
     */
    trace(tag: string, message: string, verbose?: string): void {
        const text = this.formatLogMessage(tag, message);
        if (this.logger?.trace) {
            this.logger.trace(text, verbose);
        } else if (this.connection) {
            /* c8 ignore next 2 */
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
            /* c8 ignore next 2 */
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
            /* c8 ignore next 2 */
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
            /* c8 ignore next 2 */
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
            /* c8 ignore next 2 */
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
     *
     * @returns
     * A promise that resolves to the selected action.
     */
    showInformationMessage(message: string): void;
    async showInformationMessage<T extends MessageActionItem>(message: string, ...actions: T[]): Promise<T | undefined>;
    async showInformationMessage<T extends MessageActionItem>(
        message: string,
        ...actions: T[]
    ): Promise<T | undefined> {
        if (this.userMessageProvider?.showInformationMessage) {
            return this.userMessageProvider.showInformationMessage(message, ...actions);
        } /* c8 ignore start */ else if (this.connection) {
            return this.connection.window.showInformationMessage(message, ...actions);
        } else {
            return undefined;
        } /* c8 ignore stop */
    }

    /**
     * Shows a warning message in the client's user interface.
     *
     * Depending on the client this might be a modal dialog with a confirmation button or a notification in a
     * notification center.
     *
     * @returns
     * A promise that resolves to the selected action.
     */
    showWarningMessage(message: string): void;
    async showWarningMessage<T extends MessageActionItem>(message: string, ...actions: T[]): Promise<T | undefined>;
    async showWarningMessage<T extends MessageActionItem>(message: string, ...actions: T[]): Promise<T | undefined> {
        if (this.userMessageProvider?.showWarningMessage) {
            return this.userMessageProvider.showWarningMessage(message, ...actions);
        } /* c8 ignore start */ else if (this.connection) {
            return this.connection.window.showWarningMessage(message, ...actions);
        } else {
            return undefined;
        } /* c8 ignore stop */
    }

    /**
     * Shows an error message in the client's user interface.
     *
     * Depending on the client this might be a modal dialog with a confirmation button or a notification in a
     * notification center.
     *
     * @returns
     * A promise that resolves to the selected action.
     */
    showErrorMessage(message: string): void;
    async showErrorMessage<T extends MessageActionItem>(message: string, ...actions: T[]): Promise<T | undefined>;
    async showErrorMessage<T extends MessageActionItem>(message: string, ...actions: T[]): Promise<T | undefined> {
        if (this.userMessageProvider?.showErrorMessage) {
            return this.userMessageProvider.showErrorMessage(message, ...actions);
        } /* c8 ignore start */ else if (this.connection) {
            return this.connection.window.showErrorMessage(message, ...actions);
        } else {
            return undefined;
        } /* c8 ignore stop */
    }

    /**
     * Shows a progress indicator in the client's user interface.
     *
     * @param title
     * The title of the progress indicator.
     *
     * @param message
     * An optional message to indicate what is currently being done.
     *
     * @param cancellable
     * Whether the progress indicator should be cancellable. Observe the `token` inside the returned reporter to check
     * if the user has cancelled the progress indicator.
     *
     * @returns
     * A promise that resolves to the progress reporter. Use this reporter to update the progress indicator.
     */
    async showProgress(
        title: string,
        message?: string,
        cancellable: boolean = false,
    ): Promise<WorkDoneProgressReporter> {
        if (this.userMessageProvider?.showProgress) {
            return this.userMessageProvider.showProgress(title, 0, message, cancellable);
        } /* c8 ignore start */ else if (this.connection) {
            const reporter = await this.connection.window.createWorkDoneProgress();
            reporter?.begin(title, 0, message, cancellable);
            return reporter;
        } else {
            return NOOP_PROGRESS_REPORTER;
        } /* c8 ignore stop */
    }

    /**
     * Installs a notification handler for the given method.
     *
     * @param method The method to register a request handler for.
     * @param handler The handler to install.
     */
    onNotification(method: string, handler: (...args: any[]) => void): Disposable {
        if (this.messageBroker?.onNotification) {
            return this.messageBroker.onNotification(method, handler);
        } else if (this.connection) {
            /* c8 ignore next 2 */
            return this.connection.onNotification(method, handler);
        } else {
            return NOOP_DISPOSABLE;
        }
    }

    /**
     * Send a notification to the client.
     *
     * @param method The method to invoke on the client.
     * @param args The notification's parameters.
     */
    async sendNotification(method: string, ...args: any): Promise<void> {
        if (this.messageBroker?.sendNotification) {
            await this.messageBroker.sendNotification(method, ...args);
        } else if (this.connection) {
            /* c8 ignore next 2 */
            await this.connection.sendNotification(method, args);
        }
    }

    /**
     * Set the logger to use for logging messages.
     */
    setLogger(logger: Partial<SafeDsLogger>) {
        this.logger = logger;
    }

    /**
     * Set the user message provider to use for showing messages to the user.
     */
    setUserMessageProvider(userMessageProvider: Partial<SafeDsUserMessageProvider>) {
        this.userMessageProvider = userMessageProvider;
    }

    /**
     * Set the message broker to use for communicating with the client.
     */
    setMessageBroker(messageBroker: Partial<SafeDsMessageBroker>) {
        this.messageBroker = messageBroker;
    }
}

/**
 * A logging provider.
 */
export interface SafeDsLogger {
    /**
     * Log the given data to the trace log.
     */
    trace: (message: string, verbose?: string) => void;

    /**
     * Log a debug message.
     */
    debug: (message: string) => void;

    /**
     * Log an information message.
     */
    info: (message: string) => void;

    /**
     * Log a warning message.
     */
    warn: (message: string) => void;

    /**
     * Log an error message.
     */
    error: (message: string) => void;
}

/**
 * A service for showing messages to the user.
 */
export interface SafeDsUserMessageProvider {
    /**
     * Prominently show an information message. The message should be short and human-readable.
     *
     * @returns
     * A thenable that resolves to the selected action.
     */
    showInformationMessage: <T extends MessageActionItem>(message: string, ...actions: T[]) => Thenable<T | undefined>;

    /**
     * Prominently show a warning message. The message should be short and human-readable.
     *
     * @returns
     * A thenable that resolves to the selected action.
     */
    showWarningMessage: <T extends MessageActionItem>(message: string, ...actions: T[]) => Thenable<T | undefined>;

    /**
     * Prominently show an error message. The message should be short and human-readable.
     *
     * @returns
     * A thenable that resolves to the selected action.
     */
    showErrorMessage: <T extends MessageActionItem>(message: string, ...actions: T[]) => Thenable<T | undefined>;

    /**
     * Shows a progress indicator in the client's user interface.
     *
     * @param title
     * The title of the progress indicator.
     *
     * @param message
     * An optional message to indicate what is currently being done.
     *
     * @param cancellable
     * Whether the progress indicator should be cancellable. Observe the `token` inside the returned reporter to check
     * if the user has cancelled the progress indicator.
     *
     * @returns
     * A thenable that resolves to the progress reporter. Use this reporter to update the progress indicator.
     */
    showProgress: (
        title: string,
        percentage?: number,
        message?: string,
        cancellable?: boolean,
    ) => Thenable<WorkDoneProgressReporter>;
}

/**
 * A message broker for communicating with the client.
 */
export interface SafeDsMessageBroker {
    /**
     * Installs a notification handler for the given method.
     *
     * @param method The method to register a request handler for.
     * @param handler The handler to install.
     */
    onNotification: (method: string, handler: (...args: any[]) => void) => Disposable;

    /**
     * Send a notification to the client.
     *
     * @param method The method to invoke on the client.
     * @param args The notification's parameters.
     */
    sendNotification: (method: string, ...args: any[]) => Promise<void>;
}

const NOOP_PROGRESS_REPORTER: WorkDoneProgressReporter = {
    begin() {},
    report() {},
    done() {},
};

const NOOP_DISPOSABLE: Disposable = Disposable.create(() => {});

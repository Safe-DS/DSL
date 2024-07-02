import { describe, expect, it, vi } from 'vitest';
import { createSafeDsServices } from '../../../src/language/index.js';
import { NodeFileSystem } from 'langium/node';
import { ModuleOptions } from '../../../src/language/safe-ds-module.js';
import { EventEmitter } from 'node:events';
import { NotificationType, NotificationType0, RequestType, RequestType0 } from 'vscode-languageserver';
import { CancellationTokenSource } from 'vscode-jsonrpc/lib/common/cancellation.js';

describe('without connection', async () => {
    const notificationEventEmitter = new EventEmitter();
    const requestEventEmitter = new EventEmitter();
    const options: ModuleOptions = {
        logger: {
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            result: vi.fn(),
        },
        messageBroker: {
            onNotification(event, handler) {
                notificationEventEmitter.on(event, handler);
                return {
                    dispose() {
                        notificationEventEmitter.off(event, handler);
                    },
                };
            },
            sendNotification: vi.fn(),
            onRequest(event, handler) {
                requestEventEmitter.on(event, handler);
                return {
                    dispose() {
                        requestEventEmitter.off(event, handler);
                    },
                };
            },
            sendRequest: vi.fn().mockResolvedValue('result'),
        },
        userInteractionProvider: {
            showInformationMessage: vi.fn().mockReturnValue(undefined),
            showWarningMessage: vi.fn().mockReturnValue(undefined),
            showErrorMessage: vi.fn().mockReturnValue(undefined),
            showProgress: vi.fn().mockReturnValue(undefined),
        },
    };
    const services = (await createSafeDsServices(NodeFileSystem, options)).SafeDs;
    const messaging = services.communication.MessagingProvider;

    describe('logger', () => {
        it('should call the trace function defined in the options', () => {
            messaging.trace('Test', 'trace', 'verbose');
            expect(options.logger!.trace).toHaveBeenCalledWith('[Test] trace', 'verbose');
        });

        it('should call the debug function defined in the options', () => {
            messaging.debug('Test', 'debug');
            expect(options.logger!.debug).toHaveBeenCalledWith('[Test] debug');
        });

        it('should call the info function defined in the options', () => {
            messaging.info('Test', 'info');
            expect(options.logger!.info).toHaveBeenCalledWith('[Test] info');
        });

        it('should call the warn function defined in the options', () => {
            messaging.warn('Test', 'warn');
            expect(options.logger!.warn).toHaveBeenCalledWith('[Test] warn');
        });

        it('should call the error function defined in the options', () => {
            messaging.error('Test', 'error');
            expect(options.logger!.error).toHaveBeenCalledWith('[Test] error');
        });

        it('should call the result function defined in the options', () => {
            messaging.result('result');
            expect(options.logger!.result).toHaveBeenCalledWith('[Result] result\n');
        });
    });

    describe('userInteractionProvider', () => {
        it('should call the showInformationMessage function defined in the options', () => {
            messaging.showInformationMessage('Test', { title: 'showInformationMessage' });
            expect(options.userInteractionProvider!.showInformationMessage).toHaveBeenCalledWith('Test', {
                title: 'showInformationMessage',
            });
        });

        it('should call the showWarningMessage function defined in the options', () => {
            messaging.showWarningMessage('Test', { title: 'showWarningMessage' });
            expect(options.userInteractionProvider!.showWarningMessage).toHaveBeenCalledWith('Test', {
                title: 'showWarningMessage',
            });
        });

        it('should call the showErrorMessage function defined in the options', () => {
            messaging.showErrorMessage('Test', { title: 'showErrorMessage' });
            expect(options.userInteractionProvider!.showErrorMessage).toHaveBeenCalledWith('Test', {
                title: 'showErrorMessage',
            });
        });

        it('should call the showProgress function defined in the options', () => {
            messaging.showProgress('Test', 'showProgress');
            expect(options.userInteractionProvider!.showProgress).toHaveBeenCalledWith(
                'Test',
                0,
                'showProgress',
                false,
            );
        });
    });

    describe('messageBroker', () => {
        describe('onNotification', () => {
            it('should call the onNotification function defined in the options (no arguments)', () => {
                const listener = vi.fn();
                const disposable = messaging.onNotification(new NotificationType0('Test'), listener);
                notificationEventEmitter.emit('Test');
                expect(listener).toHaveBeenCalledWith();
                disposable.dispose();
            });

            it('should call the onNotification function defined in the options (with arguments)', () => {
                const listener = vi.fn();
                const disposable = messaging.onNotification(new NotificationType0('Test'), listener);
                notificationEventEmitter.emit('Test', 'onNotification');
                expect(listener).toHaveBeenCalledWith('onNotification');
                disposable.dispose();
            });
        });

        describe('sendNotification', () => {
            it('should call the sendNotification function defined in the options (no arguments)', () => {
                messaging.sendNotification(new NotificationType0('Test'));
                expect(options.messageBroker!.sendNotification).toHaveBeenCalledWith('Test', undefined);
            });

            it('should call the sendNotification function defined in the options (with arguments)', () => {
                messaging.sendNotification(new NotificationType<string>('Test'), 'sendNotification');
                expect(options.messageBroker!.sendNotification).toHaveBeenCalledWith('Test', 'sendNotification');
            });
        });

        describe('onRequest', () => {
            it('should call the onRequest function defined in the options (no arguments)', () => {
                const listener = vi.fn();
                const disposable = messaging.onRequest(new RequestType0('Test'), listener);
                requestEventEmitter.emit('Test');
                expect(listener).toHaveBeenCalledWith();
                disposable.dispose();
            });

            it('should call the onRequest function defined in the options (with arguments)', () => {
                const listener = vi.fn();
                const disposable = messaging.onRequest(new RequestType0('Test'), listener);
                requestEventEmitter.emit('Test', 'onRequest');
                expect(listener).toHaveBeenCalledWith('onRequest');
                disposable.dispose();
            });
        });

        describe('sendRequest', () => {
            it('should call the sendRequest function defined in the options (no arguments, no cancellation token)', () => {
                messaging.sendRequest(new RequestType0<string, void>('Test'));
                expect(options.messageBroker!.sendRequest).toHaveBeenCalledWith('Test', undefined, undefined);
            });

            it('should call the sendRequest function defined in the options (no arguments, with cancellation token)', () => {
                const token = new CancellationTokenSource().token;
                messaging.sendRequest(new RequestType0<string, void>('Test'), token);
                expect(options.messageBroker!.sendRequest).toHaveBeenCalledWith('Test', undefined, token);
            });

            it('should call the sendRequest function defined in the options (with arguments, no cancellation token)', () => {
                messaging.sendRequest(new RequestType<string, string, void>('Test'), 'sendRequest');
                expect(options.messageBroker!.sendRequest).toHaveBeenCalledWith('Test', 'sendRequest', undefined);
            });

            it('should call the sendRequest function defined in the options (with arguments, with cancellation token)', () => {
                const token = new CancellationTokenSource().token;
                messaging.sendRequest(new RequestType<string, string, void>('Test'), 'sendRequest', token);
                expect(options.messageBroker!.sendRequest).toHaveBeenCalledWith('Test', 'sendRequest', token);
            });

            it('should return the result of the sendRequest function defined in the options', async () => {
                const result = await messaging.sendRequest(
                    new RequestType<string, string, void>('Test'),
                    'sendRequest',
                );
                expect(result).toBe('result');
            });
        });
    });
});

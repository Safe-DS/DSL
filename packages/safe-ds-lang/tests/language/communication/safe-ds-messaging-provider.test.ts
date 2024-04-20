import { describe, expect, it, vi } from 'vitest';
import { createSafeDsServices } from '../../../src/language/index.js';
import { NodeFileSystem } from 'langium/node';
import { ModuleOptions } from '../../../src/language/safe-ds-module.js';
import { EventEmitter } from 'node:events';

// ReadableStream();
// describe('with connection', async () => {
//     const connection = createConnection(ProposedFeatures.all);
//     createConnection(Readable.from([]), Writable, ProposedFeatures.all);
//     const { SafeDs: services, shared } = await createSafeDsServices({ connection, ...NodeFileSystem });
//     doStartLanguageServer(shared);
//
//     describe('logging', () => {
//         it('should not be undefined', () => {
//             // expect(services.logging).not.toBeUndefined();
//         });
//     });
// });

describe('without connection', async () => {
    const eventEmitter = new EventEmitter();
    const options: ModuleOptions = {
        logger: {
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        },
        messageBroker: {
            onNotification(event, handler) {
                eventEmitter.on(event, handler);
                return {
                    dispose() {
                        eventEmitter.off(event, handler);
                    },
                };
            },
            sendNotification: vi.fn(),
        },
        userMessageProvider: {
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
    });

    describe('messageBroker', () => {
        it('should call the onNotification function defined in the options', () => {
            const listener = vi.fn();
            messaging.onNotification('Test', listener);
            eventEmitter.emit('Test', 'onNotification');
            expect(listener).toHaveBeenCalledWith('onNotification');
        });

        it('should call the sendNotification function defined in the options', () => {
            messaging.sendNotification('Test', 'sendNotification');
            expect(options.messageBroker!.sendNotification).toHaveBeenCalledWith('Test', 'sendNotification');
        });
    });

    describe('userMessageProvider', () => {
        it('should call the showInformationMessage function defined in the options', () => {
            messaging.showInformationMessage('Test', { title: 'showInformationMessage' });
            expect(options.userMessageProvider!.showInformationMessage).toHaveBeenCalledWith('Test', {
                title: 'showInformationMessage',
            });
        });

        it('should call the showWarningMessage function defined in the options', () => {
            messaging.showWarningMessage('Test', { title: 'showWarningMessage' });
            expect(options.userMessageProvider!.showWarningMessage).toHaveBeenCalledWith('Test', {
                title: 'showWarningMessage',
            });
        });

        it('should call the showErrorMessage function defined in the options', () => {
            messaging.showErrorMessage('Test', { title: 'showErrorMessage' });
            expect(options.userMessageProvider!.showErrorMessage).toHaveBeenCalledWith('Test', {
                title: 'showErrorMessage',
            });
        });

        it('should call the showProgress function defined in the options', () => {
            messaging.showProgress('Test', 'showProgress');
            expect(options.userMessageProvider!.showProgress).toHaveBeenCalledWith('Test', 0, 'showProgress', false);
        });
    });
});

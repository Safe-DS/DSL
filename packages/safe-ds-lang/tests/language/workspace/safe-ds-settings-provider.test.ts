import { NodeFileSystem } from 'langium/node';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSafeDsServices } from '../../../src/language/index.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const configurationProvider = services.shared.workspace.ConfigurationProvider;
const languageId = services.LanguageMetaData.languageId;
const settingsProvider = services.workspace.SettingsProvider;

describe('SafeDsSettingsProvider', () => {
    describe('onRunnerCommandUpdate', () => {
        beforeEach(() => {
            configurationProvider.updateConfiguration({
                settings: {
                    [languageId]: {
                        runner: {
                            command: 'safe-ds-runner',
                        },
                    },
                },
            });
        });

        it('should call the callback with the new value if it differs from the old value', () => {
            const callback = vi.fn();
            const disposable = settingsProvider.onRunnerCommandUpdate(callback);
            configurationProvider.updateConfiguration({
                settings: {
                    [languageId]: {
                        runner: {
                            command: 'safe-ds-runner-2',
                        },
                    },
                },
            });
            expect(callback).toHaveBeenCalledWith('safe-ds-runner-2');
            disposable.dispose();
        });

        it('should not call the callback if the new value is the same as the old value', () => {
            const callback = vi.fn();
            const disposable = settingsProvider.onRunnerCommandUpdate(callback);

            configurationProvider.updateConfiguration({
                settings: {
                    [languageId]: {
                        runner: {
                            command: 'safe-ds-runner',
                        },
                    },
                },
            });
            expect(callback).not.toHaveBeenCalled();
            disposable.dispose();
        });

        it('should not call disposed callbacks', () => {
            const callback = vi.fn();
            const disposable = settingsProvider.onRunnerCommandUpdate(callback);
            disposable.dispose();

            configurationProvider.updateConfiguration({
                settings: {
                    [languageId]: {
                        runner: {
                            command: 'safe-ds-runner-2',
                        },
                    },
                },
            });

            expect(callback).not.toHaveBeenCalled();
        });
    });
});

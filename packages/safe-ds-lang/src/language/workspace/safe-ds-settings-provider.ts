import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsLanguageMetaData } from '../generated/module.js';
import { SafeDsConfigurationProvider } from './safe-ds-configuration-provider.js';
import { DeepPartial, Disposable } from 'langium';

export class SafeDsSettingsProvider {
    private readonly configurationProvider: SafeDsConfigurationProvider;

    private cachedSettings: DeepPartial<Settings> = {};
    private watchers = new Set<SettingsWatcher<any>>();

    constructor(services: SafeDsServices) {
        this.configurationProvider = services.shared.workspace.ConfigurationProvider;

        /* c8 ignore start */
        this.configurationProvider.onConfigurationSectionUpdate(async ({ section, configuration }) => {
            if (section === SafeDsLanguageMetaData.languageId) {
                await this.updateCachedSettings(configuration);
            }
        });
        /* c8 ignore stop */
    }

    shouldShowAssigneeTypeInlayHints(): boolean {
        return this.cachedSettings.inlayHints?.assigneeTypes?.enabled ?? true;
    }

    shouldShowLambdaParameterTypeInlayHints(): boolean {
        return this.cachedSettings.inlayHints?.lambdaParameterTypes?.enabled ?? true;
    }

    shouldCollapseClassTypesInInlayHints(): boolean {
        return this.cachedSettings.inlayHints?.collapseClassTypes ?? true;
    }

    shouldCollapseLiteralTypesInInlayHints(): boolean {
        return this.cachedSettings.inlayHints?.collapseLiteralTypes ?? true;
    }

    shouldShowParameterNameInlayHints(): InlayHintsSettings['parameterNames']['enabled'] {
        return this.cachedSettings.inlayHints?.parameterNames?.enabled ?? 'onlyLiterals';
    }

    /* c8 ignore start */
    getRunnerCommand(): string {
        return this.cachedSettings.runner?.command ?? 'safe-ds-runner';
    }
    /* c8 ignore stop */

    onRunnerCommandUpdate(callback: (newValue: string | undefined) => void): Disposable {
        const watcher: SettingsWatcher<string | undefined> = {
            accessor: (settings) => settings.runner?.command,
            callback,
        };

        this.watchers.add(watcher);

        return Disposable.create(() => {
            /* c8 ignore next */
            this.watchers.delete(watcher);
        });
    }

    shouldValidateCodeStyle(): boolean {
        return this.cachedSettings.validation?.codeStyle?.enabled ?? true;
    }

    shouldValidateExperimentalLanguageFeatures(): boolean {
        return this.cachedSettings.validation?.experimentalLanguageFeatures?.enabled ?? true;
    }

    shouldValidateExperimentalLibraryElements(): boolean {
        return this.cachedSettings.validation?.experimentalLibraryElements?.enabled ?? true;
    }

    shouldValidateNameConvention(): boolean {
        return this.cachedSettings.validation?.nameConvention?.enabled ?? true;
    }

    private async updateCachedSettings(newSettings: Settings): Promise<void> {
        const oldSettings = this.cachedSettings;
        this.cachedSettings = newSettings;

        // Notify watchers
        for (const watcher of this.watchers) {
            const oldValue = watcher.accessor(oldSettings);
            const newValue = watcher.accessor(this.cachedSettings);
            if (oldValue !== newValue) {
                watcher.callback(newValue);
            }
        }
    }
}

export interface Settings {
    inlayHints: InlayHintsSettings;
    runner: RunnerSettings;
    validation: ValidationSettings;
}

interface InlayHintsSettings {
    assigneeTypes: {
        enabled: boolean;
    };
    lambdaParameterTypes: {
        enabled: boolean;
    };
    collapseClassTypes: boolean;
    collapseLiteralTypes: boolean;
    parameterNames: {
        enabled: 'none' | 'onlyLiterals' | 'exceptReferences' | 'all';
    };
}

interface RunnerSettings {
    command: string;
}

interface ValidationSettings {
    codeStyle: {
        enabled: boolean;
    };
    experimentalLanguageFeatures: {
        enabled: boolean;
    };
    experimentalLibraryElements: {
        enabled: boolean;
    };
    nameConvention: {
        enabled: boolean;
    };
}

interface SettingsWatcher<T> {
    accessor: (settings: DeepPartial<Settings>) => T;
    callback: (newValue: T) => void;
}

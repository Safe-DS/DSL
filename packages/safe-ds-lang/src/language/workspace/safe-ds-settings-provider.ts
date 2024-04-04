import { ConfigurationProvider } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsLanguageMetaData } from '../generated/module.js';

export class SafeDsSettingsProvider {
    private readonly configurationProvider: ConfigurationProvider;

    constructor(services: SafeDsServices) {
        this.configurationProvider = services.shared.workspace.ConfigurationProvider;
    }

    async shouldShowAssigneeTypeInlayHints(): Promise<boolean> {
        return (await this.getInlayHintsSettings()).assigneeTypes?.enabled ?? true;
    }

    async shouldShowParameterNameInlayHints(): Promise<boolean> {
        return (await this.getInlayHintsSettings()).parameterNames?.enabled ?? true;
    }

    private async getInlayHintsSettings(): Promise<Partial<InlayHintsSettings>> {
        return (
            (await this.configurationProvider.getConfiguration(SafeDsLanguageMetaData.languageId, 'inlayHints')) ?? {}
        );
    }

    async shouldValidateCodeStyle(): Promise<boolean> {
        return (await this.getValidationSettings()).codeStyle?.enabled ?? true;
    }

    async shouldValidateExperimentalLanguageFeatures(): Promise<boolean> {
        return (await this.getValidationSettings()).experimentalLanguageFeatures?.enabled ?? true;
    }

    async shouldValidateExperimentalLibraryElements(): Promise<boolean> {
        return (await this.getValidationSettings()).experimentalLibraryElements?.enabled ?? true;
    }

    async shouldValidateNameConvention(): Promise<boolean> {
        return (await this.getValidationSettings()).nameConvention?.enabled ?? true;
    }

    private async getValidationSettings(): Promise<Partial<ValidationSettings>> {
        return (
            (await this.configurationProvider.getConfiguration(SafeDsLanguageMetaData.languageId, 'validation')) ?? {}
        );
    }
}

interface InlayHintsSettings {
    assigneeTypes: {
        enabled: boolean;
    };
    parameterNames: {
        enabled: boolean;
    };
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

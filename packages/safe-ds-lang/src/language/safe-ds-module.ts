import { DeepPartial, inject, Module } from 'langium';
import {
    createDefaultModule,
    createDefaultSharedModule,
    DefaultSharedModuleContext,
    LangiumServices,
    LangiumSharedServices,
    PartialLangiumServices,
} from 'langium/lsp';
import { SafeDsAnnotations } from './builtins/safe-ds-annotations.js';
import { SafeDsClasses } from './builtins/safe-ds-classes.js';
import { SafeDsEnums, SafeDsImpurityReasons } from './builtins/safe-ds-enums.js';
import { SafeDsCommentProvider } from './documentation/safe-ds-comment-provider.js';
import { SafeDsDocumentationProvider } from './documentation/safe-ds-documentation-provider.js';
import { SafeDsCallGraphComputer } from './flow/safe-ds-call-graph-computer.js';
import { SafeDsGeneratedModule, SafeDsGeneratedSharedModule } from './generated/module.js';
import { SafeDsPythonGenerator } from './generation/safe-ds-python-generator.js';
import { SafeDsValueConverter } from './grammar/safe-ds-value-converter.js';
import { SafeDsNodeMapper } from './helpers/safe-ds-node-mapper.js';
import { SafeDsCallHierarchyProvider } from './lsp/safe-ds-call-hierarchy-provider.js';
import { SafeDsDocumentSymbolProvider } from './lsp/safe-ds-document-symbol-provider.js';
import { SafeDsFormatter } from './lsp/safe-ds-formatter.js';
import { SafeDsInlayHintProvider } from './lsp/safe-ds-inlay-hint-provider.js';
import { SafeDsNodeInfoProvider } from './lsp/safe-ds-node-info-provider.js';
import { SafeDsNodeKindProvider } from './lsp/safe-ds-node-kind-provider.js';
import { SafeDsSemanticTokenProvider } from './lsp/safe-ds-semantic-token-provider.js';
import { SafeDsSignatureHelpProvider } from './lsp/safe-ds-signature-help-provider.js';
import { SafeDsTypeHierarchyProvider } from './lsp/safe-ds-type-hierarchy-provider.js';
import { SafeDsPartialEvaluator } from './partialEvaluation/safe-ds-partial-evaluator.js';
import { SafeDsScopeComputation } from './scoping/safe-ds-scope-computation.js';
import { SafeDsScopeProvider } from './scoping/safe-ds-scope-provider.js';
import { SafeDsClassHierarchy } from './typing/safe-ds-class-hierarchy.js';
import { SafeDsCoreTypes } from './typing/safe-ds-core-types.js';
import { SafeDsTypeChecker } from './typing/safe-ds-type-checker.js';
import { SafeDsTypeComputer } from './typing/safe-ds-type-computer.js';
import { registerValidationChecks } from './validation/safe-ds-validator.js';
import { SafeDsDocumentBuilder } from './workspace/safe-ds-document-builder.js';
import { SafeDsPackageManager } from './workspace/safe-ds-package-manager.js';
import { SafeDsWorkspaceManager } from './workspace/safe-ds-workspace-manager.js';
import { SafeDsPurityComputer } from './purity/safe-ds-purity-computer.js';
import { SafeDsSettingsProvider } from './workspace/safe-ds-settings-provider.js';
import { SafeDsRenameProvider } from './lsp/safe-ds-rename-provider.js';
import { SafeDsRunner } from './runner/safe-ds-runner.js';
import { SafeDsTypeFactory } from './typing/safe-ds-type-factory.js';
import { SafeDsMarkdownGenerator } from './generation/safe-ds-markdown-generator.js';
import { SafeDsCompletionProvider } from './lsp/safe-ds-completion-provider.js';
import { SafeDsFuzzyMatcher } from './lsp/safe-ds-fuzzy-matcher.js';
import { SafeDsMessagingProvider } from './lsp/safe-ds-messaging-provider.js';
import { SafeDsConfigurationProvider } from './workspace/safe-ds-configuration-provider.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type SafeDsAddedServices = {
    builtins: {
        Annotations: SafeDsAnnotations;
        Classes: SafeDsClasses;
        Enums: SafeDsEnums;
        ImpurityReasons: SafeDsImpurityReasons;
    };
    documentation: {
        DocumentationProvider: SafeDsDocumentationProvider;
    };
    evaluation: {
        PartialEvaluator: SafeDsPartialEvaluator;
    };
    flow: {
        CallGraphComputer: SafeDsCallGraphComputer;
    };
    generation: {
        MarkdownGenerator: SafeDsMarkdownGenerator;
        PythonGenerator: SafeDsPythonGenerator;
    };
    helpers: {
        NodeMapper: SafeDsNodeMapper;
    };
    lsp: {
        MessagingProvider: SafeDsMessagingProvider;
        NodeInfoProvider: SafeDsNodeInfoProvider;
    };
    purity: {
        PurityComputer: SafeDsPurityComputer;
    };
    runtime: {
        Runner: SafeDsRunner;
    };
    typing: {
        ClassHierarchy: SafeDsClassHierarchy;
        CoreTypes: SafeDsCoreTypes;
        TypeChecker: SafeDsTypeChecker;
        TypeComputer: SafeDsTypeComputer;
        TypeFactory: SafeDsTypeFactory;
    };
    workspace: {
        PackageManager: SafeDsPackageManager;
        SettingsProvider: SafeDsSettingsProvider;
    };
};

export type SafeDsAddedSharedServices = {
    workspace: {
        ConfigurationProvider: SafeDsConfigurationProvider;
    };
};

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type SafeDsServices = LangiumServices &
    SafeDsAddedServices & {
        shared: SafeDsAddedSharedServices;
    };

export type SafeDsSharedServices = LangiumSharedServices & SafeDsAddedSharedServices;

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const SafeDsModule: Module<SafeDsServices, PartialLangiumServices & SafeDsAddedServices> = {
    builtins: {
        Annotations: (services) => new SafeDsAnnotations(services),
        Classes: (services) => new SafeDsClasses(services),
        Enums: (services) => new SafeDsEnums(services),
        ImpurityReasons: (services) => new SafeDsImpurityReasons(services),
    },
    documentation: {
        CommentProvider: (services) => new SafeDsCommentProvider(services),
        DocumentationProvider: (services) => new SafeDsDocumentationProvider(services),
    },
    evaluation: {
        PartialEvaluator: (services) => new SafeDsPartialEvaluator(services),
    },
    flow: {
        CallGraphComputer: (services) => new SafeDsCallGraphComputer(services),
    },
    generation: {
        MarkdownGenerator: (services) => new SafeDsMarkdownGenerator(services),
        PythonGenerator: (services) => new SafeDsPythonGenerator(services),
    },
    helpers: {
        NodeMapper: (services) => new SafeDsNodeMapper(services),
    },
    lsp: {
        CallHierarchyProvider: (services) => new SafeDsCallHierarchyProvider(services),
        CompletionProvider: (services) => new SafeDsCompletionProvider(services),
        DocumentSymbolProvider: (services) => new SafeDsDocumentSymbolProvider(services),
        Formatter: () => new SafeDsFormatter(),
        InlayHintProvider: (services) => new SafeDsInlayHintProvider(services),
        MessagingProvider: (services) => new SafeDsMessagingProvider(services),
        NodeInfoProvider: (services) => new SafeDsNodeInfoProvider(services),
        RenameProvider: (services) => new SafeDsRenameProvider(services),
        SemanticTokenProvider: (services) => new SafeDsSemanticTokenProvider(services),
        SignatureHelp: (services) => new SafeDsSignatureHelpProvider(services),
        TypeHierarchyProvider: (services) => new SafeDsTypeHierarchyProvider(services),
    },
    parser: {
        ValueConverter: () => new SafeDsValueConverter(),
    },
    purity: {
        PurityComputer: (services) => new SafeDsPurityComputer(services),
    },
    references: {
        ScopeComputation: (services) => new SafeDsScopeComputation(services),
        ScopeProvider: (services) => new SafeDsScopeProvider(services),
    },
    runtime: {
        Runner: (services) => new SafeDsRunner(services),
    },
    typing: {
        ClassHierarchy: (services) => new SafeDsClassHierarchy(services),
        CoreTypes: (services) => new SafeDsCoreTypes(services),
        TypeChecker: (services) => new SafeDsTypeChecker(services),
        TypeComputer: (services) => new SafeDsTypeComputer(services),
        TypeFactory: (services) => new SafeDsTypeFactory(services),
    },
    workspace: {
        PackageManager: (services) => new SafeDsPackageManager(services),
        SettingsProvider: (services) => new SafeDsSettingsProvider(services),
    },
};

export const SafeDsSharedModule: Module<SafeDsSharedServices, DeepPartial<SafeDsSharedServices>> = {
    lsp: {
        FuzzyMatcher: () => new SafeDsFuzzyMatcher(),
        NodeKindProvider: () => new SafeDsNodeKindProvider(),
    },
    workspace: {
        ConfigurationProvider: (services) => new SafeDsConfigurationProvider(services),
        DocumentBuilder: (services) => new SafeDsDocumentBuilder(services),
        WorkspaceManager: (services) => new SafeDsWorkspaceManager(services),
    },
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection.
 * @param options Further options to configure the Safe-DS module.
 * @return An object wrapping the shared services and the language-specific services.
 */
export const createSafeDsServices = async function (
    context: DefaultSharedModuleContext,
    options?: ModuleOptions,
): Promise<{
    shared: LangiumSharedServices;
    SafeDs: SafeDsServices;
}> {
    const shared: SafeDsSharedServices = inject(
        createDefaultSharedModule(context),
        SafeDsGeneratedSharedModule,
        SafeDsSharedModule,
    );
    const SafeDs = inject(createDefaultModule({ shared }), SafeDsGeneratedModule, SafeDsModule);

    shared.ServiceRegistry.register(SafeDs);
    registerValidationChecks(SafeDs);

    // If we don't run inside a language server, initialize the configuration provider instantly
    if (!context.connection) {
        await shared.workspace.ConfigurationProvider.initialized({});
    }

    // Apply options
    if (options?.logger) {
        /* c8 ignore next 2 */
        SafeDs.lsp.MessagingProvider.setLogger(options.logger);
    }
    if (!options?.omitBuiltins) {
        await shared.workspace.WorkspaceManager.initializeWorkspace([]);
    }
    if (options?.runnerCommand) {
        /* c8 ignore next 2 */
        SafeDs.runtime.Runner.updateRunnerCommand(options.runnerCommand);
    }
    if (options?.userMessageProvider) {
        /* c8 ignore next 2 */
        SafeDs.lsp.MessagingProvider.setUserMessageProvider(options.userMessageProvider);
    }

    return { shared, SafeDs };
};

/**
 * Options to pass to the creation of Safe-DS services.
 */
export interface ModuleOptions {
    /**
     * A logging provider. If the logger lacks a capability, we fall back to the logger provided by the language server
     * connection, if available.
     */
    logger?: Logger;

    /**
     * By default, builtins are loaded into the workspace. If this option is set to true, builtins are omitted.
     */
    omitBuiltins?: boolean;

    /**
     * Command to start the runner.
     */
    runnerCommand?: string;

    /**
     * A service for showing messages to the user. If the provider lacks a capability, we fall back to the language
     * server connection, if available.
     */
    userMessageProvider?: UserMessageProvider;
}

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

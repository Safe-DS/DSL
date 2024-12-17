import { AstNodeDescription, AstUtils, ValidationAcceptor } from 'langium';
import { duplicatesBy } from '../../helpers/collections.js';
import { listBuiltinFiles } from '../builtins/fileFinder.js';
import { BUILTINS_LANG_PACKAGE, BUILTINS_ROOT_PACKAGE } from '../builtins/packageNames.js';
import {
    isSdsQualifiedImport,
    SdsAnnotation,
    SdsAttribute,
    SdsBlockLambda,
    SdsBlockLambdaResult,
    SdsCallableType,
    SdsClass,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsExpressionLambda,
    SdsFunction,
    SdsImportedDeclaration,
    SdsModule,
    SdsParameter,
    SdsPipeline,
    SdsPlaceholder,
    SdsResult,
    SdsSegment,
    SdsTypeParameter,
} from '../generated/ast.js';
import { CODEGEN_PREFIX } from '../generation/python/constants.js';
import { isInDevFile, isInPipelineFile, isInStubFile } from '../helpers/fileExtensions.js';
import {
    getClassMembers,
    getEnumVariants,
    getImportedDeclarations,
    getImports,
    getModuleMembers,
    getPackageName,
    getParameters,
    getResults,
    getTypeParameters,
    isStatic,
    isValidPipelineDeclaration,
    isValidStubDeclaration,
    streamBlockLambdaResults,
    streamPlaceholders,
} from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';

export const CODE_NAME_CODEGEN_PREFIX = 'name/codegen-prefix';
export const CODE_NAME_CORE_DECLARATION = 'name/core-declaration';
export const CODE_NAME_CASING = 'name/casing';
export const CODE_NAME_DUPLICATE = 'name/duplicate';

// -----------------------------------------------------------------------------
// Codegen prefix
// -----------------------------------------------------------------------------

export const nameMustNotStartWithCodegenPrefix = (node: SdsDeclaration, accept: ValidationAcceptor) => {
    const name = node.name ?? '';
    if (name.startsWith(CODEGEN_PREFIX)) {
        accept(
            'error',
            `Names of declarations must not start with '${CODEGEN_PREFIX}'. This is reserved for code generation.`,
            {
                node,
                property: 'name',
                code: CODE_NAME_CODEGEN_PREFIX,
            },
        );
    }
};

// -----------------------------------------------------------------------------
// Core declaration
// -----------------------------------------------------------------------------

export const nameMustNotOccurOnCoreDeclaration = (services: SafeDsServices) => {
    const packageManager = services.workspace.PackageManager;

    return (node: SdsDeclaration, accept: ValidationAcceptor) => {
        if (!node.name) {
            /* c8 ignore next 2 */
            return;
        }

        // Prevents the error from showing when editing the builtin files
        const packageName = getPackageName(node);
        if (packageName === BUILTINS_LANG_PACKAGE) {
            return;
        }

        const coreDeclarations = packageManager.getDeclarationsInPackage(BUILTINS_LANG_PACKAGE);
        if (coreDeclarations.some((it) => it.name === node.name)) {
            accept('error', 'Names of core declarations must not be used for own declarations.', {
                node,
                property: 'name',
                code: CODE_NAME_CORE_DECLARATION,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Casing
// -----------------------------------------------------------------------------

export const nameShouldHaveCorrectCasing = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return (node: SdsDeclaration, accept: ValidationAcceptor) => {
        if (!settingsProvider.shouldValidateNameConvention()) {
            /* c8 ignore next 2 */
            return;
        }

        switch (node.$type) {
            case SdsAnnotation:
                return nameShouldBeUpperCamelCase(node, 'annotations', accept);
            case SdsAttribute:
                return nameShouldBeLowerCamelCase(node, 'attributes', accept);
            case SdsBlockLambdaResult:
                return nameShouldBeLowerCamelCase(node, 'block lambda results', accept);
            case SdsClass:
                return nameShouldBeUpperCamelCase(node, 'classes', accept);
            case SdsEnum:
                return nameShouldBeUpperCamelCase(node, 'enums', accept);
            case SdsEnumVariant:
                return nameShouldBeUpperCamelCase(node, 'enum variants', accept);
            case SdsFunction:
                return nameShouldBeLowerCamelCase(node, 'functions', accept);
            case SdsModule:
                const name = node.name ?? '';
                const segments = name.split('.');
                if (name !== '' && segments.every((it) => it !== '') && !segments.every(isLowerCamelCase)) {
                    accept('warning', 'All segments of the qualified name of a package should be lowerCamelCase.', {
                        node,
                        property: 'name',
                        code: CODE_NAME_CASING,
                    });
                }
                return;
            case SdsParameter:
                return nameShouldBeLowerCamelCase(node, 'parameters', accept);
            case SdsPipeline:
                return nameShouldBeLowerCamelCase(node, 'pipelines', accept);
            case SdsPlaceholder:
                const usages = services.helpers.NodeMapper.placeholderToReferences(node as SdsPlaceholder);
                if (usages.isEmpty()) {
                    return nameShouldBeLowerCamelCaseWithOptionalLeadingUnderscore(node, 'unused placeholders', accept);
                } else {
                    return nameShouldBeLowerCamelCase(node, 'used placeholders', accept);
                }
            case SdsResult:
                return nameShouldBeLowerCamelCase(node, 'results', accept);
            case SdsSegment:
                return nameShouldBeLowerCamelCase(node, 'segments', accept);
            case SdsTypeParameter:
                return nameShouldBeUpperCamelCase(node, 'type parameters', accept);
        }
        /* c8 ignore next */
    };
};

const nameShouldBeLowerCamelCase = (node: SdsDeclaration, nodeName: string, accept: ValidationAcceptor): void => {
    const name = node.name ?? '';
    if (!isLowerCamelCase(name)) {
        acceptCasingWarning(node, nodeName, 'lowerCamelCase', accept);
    }
};

const isLowerCamelCase = (name: string): boolean => {
    return /^[a-z][a-zA-Z0-9]*$/gu.test(name);
};

const nameShouldBeLowerCamelCaseWithOptionalLeadingUnderscore = (
    node: SdsDeclaration,
    nodeName: string,
    accept: ValidationAcceptor,
): void => {
    const name = node.name ?? '';
    if (!isLowerCamelCaseWithOptionalLeadingUnderscore(name)) {
        acceptCasingWarning(node, nodeName, 'lowerCamelCase with an optional leading underscore', accept);
    }
};

const isLowerCamelCaseWithOptionalLeadingUnderscore = (name: string): boolean => {
    return /^_?[a-z][a-zA-Z0-9]*$/gu.test(name);
};

const nameShouldBeUpperCamelCase = (node: SdsDeclaration, nodeName: string, accept: ValidationAcceptor): void => {
    const name = node.name ?? '';
    if (!isUpperCamelCase(name)) {
        acceptCasingWarning(node, nodeName, 'UpperCamelCase', accept);
    }
};

const isUpperCamelCase = (name: string): boolean => {
    return /^[A-Z][a-zA-Z0-9]*$/gu.test(name);
};

const acceptCasingWarning = (
    node: SdsDeclaration,
    nodeName: string,
    expectedCasing: string,
    accept: ValidationAcceptor,
) => {
    accept('warning', `Names of ${nodeName} should be ${expectedCasing}.`, {
        node,
        property: 'name',
        code: CODE_NAME_CASING,
    });
};

// -----------------------------------------------------------------------------
// Uniqueness
// -----------------------------------------------------------------------------

export const annotationMustContainUniqueNames = (node: SdsAnnotation, accept: ValidationAcceptor): void => {
    namesMustBeUnique(getParameters(node), (name) => `A parameter with name '${name}' exists already.`, accept);
};

export const blockLambdaMustContainUniqueNames = (node: SdsBlockLambda, accept: ValidationAcceptor): void => {
    const parametersAndPlaceholders = [...getParameters(node), ...streamPlaceholders(node.body)];
    namesMustBeUnique(
        parametersAndPlaceholders,
        (name) => `A parameter or placeholder with name '${name}' exists already.`,
        accept,
    );

    namesMustBeUnique(streamBlockLambdaResults(node), (name) => `A result with name '${name}' exists already.`, accept);
};

export const callableTypeMustContainUniqueNames = (node: SdsCallableType, accept: ValidationAcceptor): void => {
    namesMustBeUnique(getParameters(node), (name) => `A parameter with name '${name}' exists already.`, accept);
    namesMustBeUnique(getResults(node.resultList), (name) => `A result with name '${name}' exists already.`, accept);
};

export const classMustContainUniqueNames = (node: SdsClass, accept: ValidationAcceptor): void => {
    const typeParametersAndParameters = [...getTypeParameters(node.typeParameterList), ...getParameters(node)];
    namesMustBeUnique(
        typeParametersAndParameters,
        (name) => `A type parameter or parameter with name '${name}' exists already.`,
        accept,
    );

    namesMustBeUnique(getClassMembers(node), (name) => `A class member with name '${name}' exists already.`, accept);
};

export const staticClassMemberNamesMustNotCollideWithInheritedMembers = (services: SafeDsServices) => {
    const classHierarchy = services.typing.ClassHierarchy;

    return (node: SdsClass, accept: ValidationAcceptor): void => {
        const staticMembers = getClassMembers(node).filter(isStatic);
        const inheritedMembers = classHierarchy
            .streamInheritedMembers(node)
            .map((it) => it.name)
            .toSet();

        for (const staticMember of staticMembers) {
            if (inheritedMembers.has(staticMember.name)) {
                accept('error', `An inherited member with name 'myInstanceAttribute1' exists already.`, {
                    node: staticMember,
                    property: 'name',
                    code: CODE_NAME_DUPLICATE,
                });
            }
        }
    };
};

export const enumMustContainUniqueNames = (node: SdsEnum, accept: ValidationAcceptor): void => {
    namesMustBeUnique(getEnumVariants(node), (name) => `A variant with name '${name}' exists already.`, accept);
};

export const enumVariantMustContainUniqueNames = (node: SdsEnumVariant, accept: ValidationAcceptor): void => {
    const parameters = [...getParameters(node)];
    namesMustBeUnique(parameters, (name) => `A parameter with name '${name}' exists already.`, accept);
};

export const expressionLambdaMustContainUniqueNames = (node: SdsExpressionLambda, accept: ValidationAcceptor): void => {
    namesMustBeUnique(getParameters(node), (name) => `A parameter with name '${name}' exists already.`, accept);
};

export const functionMustContainUniqueNames = (node: SdsFunction, accept: ValidationAcceptor): void => {
    const typeParametersAndParameters = [...getTypeParameters(node.typeParameterList), ...getParameters(node)];
    namesMustBeUnique(
        typeParametersAndParameters,
        (name) => `A type parameter or parameter with name '${name}' exists already.`,
        accept,
    );

    namesMustBeUnique(getResults(node.resultList), (name) => `A result with name '${name}' exists already.`, accept);
};

export const moduleMemberMustHaveNameThatIsUniqueInPackage = (services: SafeDsServices) => {
    const packageManager = services.workspace.PackageManager;
    const builtinUris = new Set(listBuiltinFiles().map((it) => it.toString()));

    return (node: SdsModule, accept: ValidationAcceptor): void => {
        const moduleUri = AstUtils.getDocument(node).uri?.toString();
        if (builtinUris.has(moduleUri)) {
            return;
        }

        for (const member of getModuleMembers(node)) {
            const packageName = getPackageName(member) ?? '';

            let declarationsInPackage: AstNodeDescription[];
            let kind: string;
            if (packageName.startsWith(BUILTINS_ROOT_PACKAGE)) {
                // For a builtin package, the simple names of declarations must be unique
                declarationsInPackage = packageManager.getDeclarationsInPackageOrSubpackage(BUILTINS_ROOT_PACKAGE);
                kind = 'builtin declarations';
            } else {
                declarationsInPackage = packageManager.getDeclarationsInPackage(packageName);
                kind = 'declarations in this package';
            }

            if (
                declarationsInPackage.some(
                    (it) =>
                        it.name === member.name &&
                        it.documentUri.toString() !== moduleUri &&
                        !builtinUris.has(it.documentUri.toString()),
                )
            ) {
                accept('error', `Multiple ${kind} have the name '${member.name}'.`, {
                    node: member,
                    property: 'name',
                    code: CODE_NAME_DUPLICATE,
                });
            }
        }
    };
};

export const moduleMustContainUniqueNames = (node: SdsModule, accept: ValidationAcceptor): void => {
    // Names of imported declarations must be unique
    const importedDeclarations = getImports(node).filter(isSdsQualifiedImport).flatMap(getImportedDeclarations);
    for (const duplicate of duplicatesBy(importedDeclarations, importedDeclarationName)) {
        if (duplicate.alias) {
            accept('error', `A declaration with name '${importedDeclarationName(duplicate)}' was imported already.`, {
                node: duplicate.alias,
                property: 'alias',
                code: CODE_NAME_DUPLICATE,
            });
        } else {
            accept('error', `A declaration with name '${importedDeclarationName(duplicate)}' was imported already.`, {
                node: duplicate,
                property: 'declaration',
                code: CODE_NAME_DUPLICATE,
            });
        }
    }

    // Names of module members must be unique
    if (isInPipelineFile(node)) {
        namesMustBeUnique(
            getModuleMembers(node),
            (name) => `A declaration with name '${name}' exists already in this file.`,
            accept,
            isValidPipelineDeclaration,
        );
    } else if (isInStubFile(node)) {
        namesMustBeUnique(
            getModuleMembers(node),
            (name) => `A declaration with name '${name}' exists already in this file.`,
            accept,
            isValidStubDeclaration,
        );
    } else if (isInDevFile(node)) {
        namesMustBeUnique(
            getModuleMembers(node),
            (name) => `A declaration with name '${name}' exists already in this file.`,
            accept,
        );
    }
};

const importedDeclarationName = (node: SdsImportedDeclaration | undefined): string | undefined => {
    return node?.alias?.alias ?? node?.declaration?.ref?.name;
};

export const pipelineMustContainUniqueNames = (node: SdsPipeline, accept: ValidationAcceptor): void => {
    namesMustBeUnique(
        streamPlaceholders(node.body),
        (name) => `A placeholder with name '${name}' exists already.`,
        accept,
    );
};

export const segmentMustContainUniqueNames = (node: SdsSegment, accept: ValidationAcceptor): void => {
    const parametersAndPlaceholder = [...getParameters(node), ...streamPlaceholders(node.body)];
    namesMustBeUnique(
        parametersAndPlaceholder,
        (name) => `A parameter or placeholder with name '${name}' exists already.`,
        accept,
    );

    namesMustBeUnique(getResults(node.resultList), (name) => `A result with name '${name}' exists already.`, accept);
};

const namesMustBeUnique = (
    nodes: Iterable<SdsDeclaration>,
    createMessage: (name: string) => string,
    accept: ValidationAcceptor,
    shouldReportErrorOn: (node: SdsDeclaration) => boolean = () => true,
): void => {
    for (const node of duplicatesBy(nodes, (it) => it.name)) {
        if (shouldReportErrorOn(node)) {
            accept('error', createMessage(node.name), {
                node,
                property: 'name',
                code: CODE_NAME_DUPLICATE,
            });
        }
    }
};

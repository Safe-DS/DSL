import { AstNodeDescription, getDocument, ValidationAcceptor } from 'langium';
import { duplicatesBy } from '../../helpers/collectionUtils.js';
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
    SdsSchema,
    SdsSegment,
    SdsTypeParameter,
} from '../generated/ast.js';
import { CODEGEN_PREFIX } from '../generation/safe-ds-python-generator.js';
import { isInPipelineFile, isInStubFile, isInTestFile } from '../helpers/fileExtensions.js';
import {
    getClassMembers,
    getColumns,
    getEnumVariants,
    getImportedDeclarations,
    getImports,
    getModuleMembers,
    getPackageName,
    getParameters,
    getResults,
    getTypeParameters,
    isStatic,
    streamBlockLambdaResults,
    streamPlaceholders,
} from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { declarationIsAllowedInPipelineFile, declarationIsAllowedInStubFile } from './other/modules.js';

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

export const nameShouldHaveCorrectCasing = (node: SdsDeclaration, accept: ValidationAcceptor): void => {
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
            return nameShouldBeLowerCamelCase(node, 'placeholders', accept);
        case SdsResult:
            return nameShouldBeLowerCamelCase(node, 'results', accept);
        case SdsSchema:
            return nameShouldBeUpperCamelCase(node, 'schemas', accept);
        case SdsSegment:
            return nameShouldBeLowerCamelCase(node, 'segments', accept);
        case SdsTypeParameter:
            return nameShouldBeUpperCamelCase(node, 'type parameters', accept);
    }
    /* c8 ignore next */
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

    const instanceMembers = getClassMembers(node).filter((it) => !isStatic(it));
    namesMustBeUnique(instanceMembers, (name) => `An instance member with name '${name}' exists already.`, accept);

    const staticMembers = getClassMembers(node).filter(isStatic);
    namesMustBeUnique(staticMembers, (name) => `A static member with name '${name}' exists already.`, accept);
};

export const enumMustContainUniqueNames = (node: SdsEnum, accept: ValidationAcceptor): void => {
    namesMustBeUnique(getEnumVariants(node), (name) => `A variant with name '${name}' exists already.`, accept);
};

export const enumVariantMustContainUniqueNames = (node: SdsEnumVariant, accept: ValidationAcceptor): void => {
    const typeParametersAndParameters = [...getTypeParameters(node.typeParameterList), ...getParameters(node)];
    namesMustBeUnique(
        typeParametersAndParameters,
        (name) => `A type parameter or parameter with name '${name}' exists already.`,
        accept,
    );
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
        const moduleUri = getDocument(node).uri?.toString();
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
            declarationIsAllowedInPipelineFile,
        );
    } else if (isInStubFile(node)) {
        namesMustBeUnique(
            getModuleMembers(node),
            (name) => `A declaration with name '${name}' exists already in this file.`,
            accept,
            declarationIsAllowedInStubFile,
        );
    } else if (isInTestFile(node)) {
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

export const schemaMustContainUniqueNames = (node: SdsSchema, accept: ValidationAcceptor): void => {
    const duplicates = duplicatesBy(getColumns(node), (it) => it.columnName.value);
    for (const duplicate of duplicates) {
        accept('error', `A column with name '${duplicate.columnName.value}' exists already.`, {
            node: duplicate,
            property: 'columnName',
            code: CODE_NAME_DUPLICATE,
        });
    }
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

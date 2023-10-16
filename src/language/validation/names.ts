import {
    isSdsQualifiedImport,
    SdsAnnotation,
    SdsBlockLambda,
    SdsCallableType,
    SdsClass,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsExpressionLambda,
    SdsFunction,
    SdsImportedDeclaration,
    SdsModule,
    SdsPipeline,
    SdsSchema,
    SdsSegment,
} from '../generated/ast.js';
import { getDocument, ValidationAcceptor } from 'langium';
import {
    blockLambdaResultsOrEmpty,
    classMembersOrEmpty,
    columnsOrEmpty,
    enumVariantsOrEmpty,
    importedDeclarationsOrEmpty,
    importsOrEmpty,
    isStatic,
    moduleMembersOrEmpty,
    packageNameOrUndefined,
    parametersOrEmpty,
    placeholdersOrEmpty,
    resultsOrEmpty,
    typeParametersOrEmpty,
} from '../helpers/nodeProperties.js';
import { duplicatesBy } from '../helpers/collectionUtils.js';
import { isInPipelineFile, isInStubFile, isInTestFile } from '../helpers/fileExtensions.js';
import { declarationIsAllowedInPipelineFile, declarationIsAllowedInStubFile } from './other/modules.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { listBuiltinFiles } from '../builtins/fileFinder.js';

export const CODE_NAME_BLOCK_LAMBDA_PREFIX = 'name/block-lambda-prefix';
export const CODE_NAME_CASING = 'name/casing';
export const CODE_NAME_DUPLICATE = 'name/duplicate';

// -----------------------------------------------------------------------------
// Block lambda prefix
// -----------------------------------------------------------------------------

export const nameMustNotStartWithBlockLambdaPrefix = (node: SdsDeclaration, accept: ValidationAcceptor) => {
    const name = node.name ?? '';
    const blockLambdaPrefix = '__block_lambda_';
    if (name.startsWith(blockLambdaPrefix)) {
        accept(
            'error',
            "Names of declarations must not start with '__block_lambda_'. This is reserved for code generation of block lambdas.",
            {
                node,
                property: 'name',
                code: CODE_NAME_BLOCK_LAMBDA_PREFIX,
            },
        );
    }
};

// -----------------------------------------------------------------------------
// Casing
// -----------------------------------------------------------------------------

export const nameShouldHaveCorrectCasing = (node: SdsDeclaration, accept: ValidationAcceptor): void => {
    switch (node.$type) {
        case 'SdsAnnotation':
            return nameShouldBeUpperCamelCase(node, 'annotations', accept);
        case 'SdsAttribute':
            return nameShouldBeLowerCamelCase(node, 'attributes', accept);
        case 'SdsBlockLambdaResult':
            return nameShouldBeLowerCamelCase(node, 'block lambda results', accept);
        case 'SdsClass':
            return nameShouldBeUpperCamelCase(node, 'classes', accept);
        case 'SdsEnum':
            return nameShouldBeUpperCamelCase(node, 'enums', accept);
        case 'SdsEnumVariant':
            return nameShouldBeUpperCamelCase(node, 'enum variants', accept);
        case 'SdsFunction':
            return nameShouldBeLowerCamelCase(node, 'functions', accept);
        case 'SdsModule':
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
        case 'SdsParameter':
            return nameShouldBeLowerCamelCase(node, 'parameters', accept);
        case 'SdsPipeline':
            return nameShouldBeLowerCamelCase(node, 'pipelines', accept);
        case 'SdsPlaceholder':
            return nameShouldBeLowerCamelCase(node, 'placeholders', accept);
        case 'SdsResult':
            return nameShouldBeLowerCamelCase(node, 'results', accept);
        case 'SdsSchema':
            return nameShouldBeUpperCamelCase(node, 'schemas', accept);
        case 'SdsSegment':
            return nameShouldBeLowerCamelCase(node, 'segments', accept);
        case 'SdsTypeParameter':
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
    namesMustBeUnique(parametersOrEmpty(node), (name) => `A parameter with name '${name}' exists already.`, accept);
};

export const blockLambdaMustContainUniqueNames = (node: SdsBlockLambda, accept: ValidationAcceptor): void => {
    const parametersAndPlaceholders = [...parametersOrEmpty(node), ...placeholdersOrEmpty(node.body)];
    namesMustBeUnique(
        parametersAndPlaceholders,
        (name) => `A parameter or placeholder with name '${name}' exists already.`,
        accept,
    );

    namesMustBeUnique(
        blockLambdaResultsOrEmpty(node),
        (name) => `A result with name '${name}' exists already.`,
        accept,
    );
};

export const callableTypeMustContainUniqueNames = (node: SdsCallableType, accept: ValidationAcceptor): void => {
    namesMustBeUnique(parametersOrEmpty(node), (name) => `A parameter with name '${name}' exists already.`, accept);
    namesMustBeUnique(
        resultsOrEmpty(node.resultList),
        (name) => `A result with name '${name}' exists already.`,
        accept,
    );
};

export const classMustContainUniqueNames = (node: SdsClass, accept: ValidationAcceptor): void => {
    const typeParametersAndParameters = [...typeParametersOrEmpty(node.typeParameterList), ...parametersOrEmpty(node)];
    namesMustBeUnique(
        typeParametersAndParameters,
        (name) => `A type parameter or parameter with name '${name}' exists already.`,
        accept,
    );

    const instanceMembers = classMembersOrEmpty(node, (it) => !isStatic(it));
    namesMustBeUnique(instanceMembers, (name) => `An instance member with name '${name}' exists already.`, accept);

    const staticMembers = classMembersOrEmpty(node, isStatic);
    namesMustBeUnique(staticMembers, (name) => `A static member with name '${name}' exists already.`, accept);
};

export const enumMustContainUniqueNames = (node: SdsEnum, accept: ValidationAcceptor): void => {
    namesMustBeUnique(enumVariantsOrEmpty(node), (name) => `A variant with name '${name}' exists already.`, accept);
};

export const enumVariantMustContainUniqueNames = (node: SdsEnumVariant, accept: ValidationAcceptor): void => {
    const typeParametersAndParameters = [...typeParametersOrEmpty(node.typeParameterList), ...parametersOrEmpty(node)];
    namesMustBeUnique(
        typeParametersAndParameters,
        (name) => `A type parameter or parameter with name '${name}' exists already.`,
        accept,
    );
};

export const expressionLambdaMustContainUniqueNames = (node: SdsExpressionLambda, accept: ValidationAcceptor): void => {
    namesMustBeUnique(parametersOrEmpty(node), (name) => `A parameter with name '${name}' exists already.`, accept);
};

export const functionMustContainUniqueNames = (node: SdsFunction, accept: ValidationAcceptor): void => {
    const typeParametersAndParameters = [...typeParametersOrEmpty(node.typeParameterList), ...parametersOrEmpty(node)];
    namesMustBeUnique(
        typeParametersAndParameters,
        (name) => `A type parameter or parameter with name '${name}' exists already.`,
        accept,
    );

    namesMustBeUnique(
        resultsOrEmpty(node.resultList),
        (name) => `A result with name '${name}' exists already.`,
        accept,
    );
};

export const moduleMemberMustHaveNameThatIsUniqueInPackage = (services: SafeDsServices) => {
    const packageManager = services.workspace.PackageManager;
    const builtinUris = new Set(listBuiltinFiles().map((it) => it.toString()));

    return (node: SdsModule, accept: ValidationAcceptor): void => {
        for (const member of moduleMembersOrEmpty(node)) {
            const packageName = packageNameOrUndefined(member) ?? '';
            const declarationsInPackage = packageManager.getDeclarationsInPackage(packageName);
            const memberUri = getDocument(member).uri?.toString();

            if (
                declarationsInPackage.some(
                    (it) =>
                        it.name === member.name &&
                        it.documentUri.toString() !== memberUri &&
                        !builtinUris.has(it.documentUri.toString()),
                )
            ) {
                accept('error', `Multiple declarations in this package have the name '${member.name}'.`, {
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
    const importedDeclarations = importsOrEmpty(node).filter(isSdsQualifiedImport).flatMap(importedDeclarationsOrEmpty);
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
            moduleMembersOrEmpty(node),
            (name) => `A declaration with name '${name}' exists already in this file.`,
            accept,
            declarationIsAllowedInPipelineFile,
        );
    } else if (isInStubFile(node)) {
        namesMustBeUnique(
            moduleMembersOrEmpty(node),
            (name) => `A declaration with name '${name}' exists already in this file.`,
            accept,
            declarationIsAllowedInStubFile,
        );
    } else if (isInTestFile(node)) {
        namesMustBeUnique(
            moduleMembersOrEmpty(node),
            (name) => `A declaration with name '${name}' exists already in this file.`,
            accept,
        );
    }
};

const importedDeclarationName = (node: SdsImportedDeclaration | undefined): string | undefined => {
    return node?.alias?.alias ?? node?.declaration.ref?.name;
};

export const pipelineMustContainUniqueNames = (node: SdsPipeline, accept: ValidationAcceptor): void => {
    namesMustBeUnique(
        placeholdersOrEmpty(node.body),
        (name) => `A placeholder with name '${name}' exists already.`,
        accept,
    );
};

export const schemaMustContainUniqueNames = (node: SdsSchema, accept: ValidationAcceptor): void => {
    const duplicates = duplicatesBy(columnsOrEmpty(node), (it) => it.columnName.value);
    for (const duplicate of duplicates) {
        accept('error', `A column with name '${duplicate.columnName.value}' exists already.`, {
            node: duplicate,
            property: 'columnName',
            code: CODE_NAME_DUPLICATE,
        });
    }
};

export const segmentMustContainUniqueNames = (node: SdsSegment, accept: ValidationAcceptor): void => {
    const parametersAndPlaceholder = [...parametersOrEmpty(node), ...placeholdersOrEmpty(node.body)];
    namesMustBeUnique(
        parametersAndPlaceholder,
        (name) => `A parameter or placeholder with name '${name}' exists already.`,
        accept,
    );

    namesMustBeUnique(
        resultsOrEmpty(node.resultList),
        (name) => `A result with name '${name}' exists already.`,
        accept,
    );
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

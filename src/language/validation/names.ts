import { SdsDeclaration } from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';

export const CODE_NAMES_BLOCK_LAMBDA_PREFIX = 'names/block-lambda-prefix';
export const CODE_NAMES_CASING = 'names/casing';

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
                code: CODE_NAMES_BLOCK_LAMBDA_PREFIX,
            },
        );
    }
};

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
            if (name !== '' && !segments.every(isLowerCamelCase)) {
                accept('warning', 'All segments of the qualified name of a package should be lowerCamelCase.', {
                    node,
                    property: 'name',
                    code: CODE_NAMES_CASING,
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
        code: CODE_NAMES_CASING,
    });
};

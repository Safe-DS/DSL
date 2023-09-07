import { SdsDeclaration } from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';

const blockLambdaPrefix = '__block_lambda_';

export const nameMustNotStartWithBlockLambdaPrefix = (node: SdsDeclaration, accept: ValidationAcceptor) => {
    if (node.name.startsWith(blockLambdaPrefix)) {
        accept(
            'error',
            "Names of declarations must not start with '__block_lambda_'. This is reserved for code generation of block lambdas.",
            {
                node,
                property: 'name',
                code: 'nameConvention/blockLambdaPrefix',
            },
        );
    }
};

export const nameShouldHaveCorrectCasing = (node: SdsDeclaration, accept: ValidationAcceptor) => {
    switch (node.$type) {
        case 'SdsAnnotation':
            if (!isUpperCamelCase(node.name)) {
                acceptCasingWarning(node, 'annotations', 'UpperCamelCase', accept);
            }
            return;
        case 'SdsAttribute':
            if (!isLowerCamelCase(node.name)) {
                acceptCasingWarning(node, 'attributes', 'lowerCamelCase', accept);
            }
            return;
        case 'SdsBlockLambdaResult':
            if (!isLowerCamelCase(node.name)) {
                acceptCasingWarning(node, 'block lambda results', 'lowerCamelCase', accept);
            }
            return;
        case 'SdsClass':
            if (!isUpperCamelCase(node.name)) {
                acceptCasingWarning(node, 'classes', 'UpperCamelCase', accept);
            }
            return;
        case 'SdsEnum':
            if (!isUpperCamelCase(node.name)) {
                acceptCasingWarning(node, 'enums', 'UpperCamelCase', accept);
            }
            return;
        case 'SdsEnumVariant':
            if (!isUpperCamelCase(node.name)) {
                acceptCasingWarning(node, 'enum variants', 'UpperCamelCase', accept);
            }
            return;
        case 'SdsFunction':
            if (!isLowerCamelCase(node.name)) {
                acceptCasingWarning(node, 'functions', 'lowerCamelCase', accept);
            }
            return;
        case 'SdsModule':
            const segments = node.name.split('.');
            if (!segments.every(isLowerCamelCase)) {
                accept('warning', 'All segments of the qualified name of a package should be lowerCamelCase.', {
                    node,
                    property: 'name',
                    code: 'nameConvention/casing',
                });
            }
            return;
        case 'SdsParameter':
            if (!isLowerCamelCase(node.name)) {
                acceptCasingWarning(node, 'parameters', 'lowerCamelCase', accept);
            }
            return;
        case 'SdsPipeline':
            if (!isLowerCamelCase(node.name)) {
                acceptCasingWarning(node, 'pipelines', 'lowerCamelCase', accept);
            }
            return;
        case 'SdsPlaceholder':
            if (!isLowerCamelCase(node.name)) {
                acceptCasingWarning(node, 'placeholders', 'lowerCamelCase', accept);
            }
            return;
        case 'SdsResult':
            if (!isLowerCamelCase(node.name)) {
                acceptCasingWarning(node, 'results', 'lowerCamelCase', accept);
            }
            return;
        case 'SdsSchema':
            if (!isUpperCamelCase(node.name)) {
                acceptCasingWarning(node, 'schemas', 'UpperCamelCase', accept);
            }
            return;
        case 'SdsSegment':
            if (!isLowerCamelCase(node.name)) {
                acceptCasingWarning(node, 'segments', 'lowerCamelCase', accept);
            }
            return;
        case 'SdsTypeParameter':
            if (!isUpperCamelCase(node.name)) {
                acceptCasingWarning(node, 'type parameters', 'UpperCamelCase', accept);
            }
            return;
    }
};

const isLowerCamelCase = (name: string): boolean => {
    return /^[a-z][a-zA-Z0-9]*$/gu.test(name);
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
        code: 'nameConvention/casing',
    });
};

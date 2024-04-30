/* Todo: Remove undefined option for return type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SdsArgument, SdsCall, SdsExpression, SdsParameter } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';

const LOGGING_TAG = 'CustomEditor] [AstParser] [Statement';

export interface Parameter {
    name: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'LAMBDA' | 'TABLE' | 'UNDEFINED';
    value: string;
    optional: boolean;
}

export interface Statement {
    class: string;
    function: string;
    isStatic: boolean;
    parameters: Parameter[];
    results: Parameter[];
}

export type StatementNode = SdsExpression;

export const getStatement = (element: StatementNode, services: SafeDsServices): Statement | undefined => {
    const logger = services.communication.MessagingProvider;

    switch (element.$type) {
        case 'SdsCall': {
            const parameter: Parameter[] = [];
            const results: Parameter[] = [];
            logger.warn(LOGGING_TAG, `Node type <${element.$type}> has not been implemented yet!`);

            const node = element as SdsCall;
            node.argumentList.arguments.forEach((argument: SdsArgument) => {
                const value = argument.value;
                const datatype = argument.$type;
                const parameterReferenz = argument.parameter?.ref as SdsParameter;
            });

            return undefined;
        }

        case 'SdsArgument':
        case 'SdsBlockLambda':
        case 'SdsBoolean':
        case 'SdsChainedExpression':
        case 'SdsExpression':
        case 'SdsExpressionLambda':
        case 'SdsFloat':
        case 'SdsIndexedAccess':
        case 'SdsInfixOperation':
        case 'SdsInt':
        case 'SdsLambda':
        case 'SdsList':
        case 'SdsLiteral':
        case 'SdsMap':
        case 'SdsMemberAccess':
        case 'SdsNull':
        case 'SdsNumber':
        case 'SdsParenthesizedExpression':
        case 'SdsPrefixOperation':
        case 'SdsReference':
        case 'SdsString':
        case 'SdsTemplateString':
        case 'SdsTemplateStringEnd':
        case 'SdsTemplateStringInner':
        case 'SdsTemplateStringPart':
        case 'SdsTemplateStringStart':
        case 'SdsTypeCast':
        case 'SdsUnknown':
        default: {
            logger.error(LOGGING_TAG, `Unknown node type <${element.$type}>`);
            return undefined;
        }
    }
};

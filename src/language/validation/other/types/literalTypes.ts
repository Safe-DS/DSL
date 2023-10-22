import { isSdsList, isSdsMap, SdsLiteralType } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { getLiterals } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { EvaluatedNode } from '../../../partialEvaluation/model.js';
import { isEmpty } from '../../../../helpers/collectionUtils.js';

export const CODE_LITERAL_TYPE_DUPLICATE_LITERAL = 'literal-type/duplicate-literal';
export const CODE_LITERAL_TYPE_LIST_LITERAL = 'literal-type/list-literal';
export const CODE_LITERAL_TYPE_MAP_LITERAL = 'literal-type/map-literal';
export const CODE_LITERAL_TYPE_MISSING_LITERALS = 'literal-type/missing-literals';

export const literalTypeMustHaveLiterals = (node: SdsLiteralType, accept: ValidationAcceptor): void => {
    if (isEmpty(getLiterals(node))) {
        accept('error', 'A literal type must have at least one literal.', {
            node,
            property: 'literalList',
            code: CODE_LITERAL_TYPE_MISSING_LITERALS,
        });
    }
};

export const literalTypeMustNotContainListLiteral = (node: SdsLiteralType, accept: ValidationAcceptor): void => {
    for (const literal of getLiterals(node)) {
        if (isSdsList(literal)) {
            accept('error', 'Literal types must not contain list literals.', {
                node: literal,
                code: CODE_LITERAL_TYPE_LIST_LITERAL,
            });
        }
    }
};

export const literalTypeMustNotContainMapLiteral = (node: SdsLiteralType, accept: ValidationAcceptor): void => {
    for (const literal of getLiterals(node)) {
        if (isSdsMap(literal)) {
            accept('error', 'Literal types must not contain map literals.', {
                node: literal,
                code: CODE_LITERAL_TYPE_MAP_LITERAL,
            });
        }
    }
};

export const literalTypeShouldNotHaveDuplicateLiteral = (services: SafeDsServices) => {
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsLiteralType, accept: ValidationAcceptor): void => {
        const literals = getLiterals(node);
        const constants: EvaluatedNode[] = [];

        for (const literal of literals) {
            const constant = partialEvaluator.evaluate(literal);
            if (constants.some((it) => it.equals(constant))) {
                accept('warning', `The literal ${constant.toString()} was already listed.`, {
                    node: literal,
                    code: CODE_LITERAL_TYPE_DUPLICATE_LITERAL,
                });
            } else {
                constants.push(constant);
            }
        }
    };
};

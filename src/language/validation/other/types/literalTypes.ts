import { isSdsList, isSdsMap, SdsLiteralType } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { literalsOrEmpty } from '../../../helpers/nodeProperties.js';
import {isEmpty} from "radash";

export const CODE_UNION_TYPE_MISSING_LITERALS = 'union-type/missing-literals';
export const CODE_LITERAL_TYPE_LIST_LITERAL = 'literal-type/list-literal';
export const CODE_LITERAL_TYPE_MAP_LITERAL = 'literal-type/map-literal';

export const literalTypeMustHaveLiterals = (node: SdsLiteralType, accept: ValidationAcceptor): void => {
    if (isEmpty(literalsOrEmpty(node))) {
        accept('error', 'A literal type must have at least one literal.', {
            node,
            property: 'literalList',
            code: CODE_UNION_TYPE_MISSING_LITERALS,
        });
    }
}

export const literalTypeMustNotContainListLiteral = (node: SdsLiteralType, accept: ValidationAcceptor): void => {
    for (const literal of literalsOrEmpty(node)) {
        if (isSdsList(literal)) {
            accept('error', 'Literal types must not contain list literals.', {
                node: literal,
                code: CODE_LITERAL_TYPE_LIST_LITERAL,
            });
        }
    }
};

export const literalTypeMustNotContainMapLiteral = (node: SdsLiteralType, accept: ValidationAcceptor): void => {
    for (const literal of literalsOrEmpty(node)) {
        if (isSdsMap(literal)) {
            accept('error', 'Literal types must not contain map literals.', {
                node: literal,
                code: CODE_LITERAL_TYPE_MAP_LITERAL,
            });
        }
    }
};

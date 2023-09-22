import { SdsUnionType } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { typeArgumentsOrEmpty } from '../../../ast/shortcuts.js';
import {isEmpty} from "radash";

export const CODE_UNION_TYPE_MISSING_TYPE_ARGUMENTS = 'union-type/missing-type-arguments';

export const unionTypeMustHaveTypeArguments = (node: SdsUnionType, accept: ValidationAcceptor): void => {
    if (isEmpty(typeArgumentsOrEmpty(node.typeArgumentList))) {
        accept('error', 'A union type must have least one type argument.', {
            node,
            property: 'typeArgumentList',
            code: CODE_UNION_TYPE_MISSING_TYPE_ARGUMENTS,
        });
    }
};

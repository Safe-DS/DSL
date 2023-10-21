import { SdsUnionType } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { isEmpty } from 'radash';
import { typeArgumentsOrEmpty } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { Type } from '../../../typing/model.js';

export const CODE_UNION_TYPE_DUPLICATE_TYPE = 'union-type/duplicate-type';
export const CODE_UNION_TYPE_MISSING_TYPES = 'union-type/missing-types';

export const unionTypeMustHaveTypes = (node: SdsUnionType, accept: ValidationAcceptor): void => {
    if (isEmpty(typeArgumentsOrEmpty(node.typeArgumentList))) {
        accept('error', 'A union type must have at least one type.', {
            node,
            property: 'typeArgumentList',
            code: CODE_UNION_TYPE_MISSING_TYPES,
        });
    }
};

export const unionTypeShouldNotHaveDuplicateTypes = (services: SafeDsServices) => {
    const typeComputer = services.types.TypeComputer;

    return (node: SdsUnionType, accept: ValidationAcceptor): void => {
        const typeArguments = typeArgumentsOrEmpty(node.typeArgumentList);
        const knownTypes: Type[] = [];

        for (const typeArgument of typeArguments) {
            const type = typeComputer.computeType(typeArgument);
            if (knownTypes.some(it => it.equals(type))) {
                accept('warning', `The type '${type.toString()}' was already listed.`, {
                    node: typeArgument,
                    code: CODE_UNION_TYPE_DUPLICATE_TYPE,
                });
            } else {
                knownTypes.push(type);
            }
        }
    };
};

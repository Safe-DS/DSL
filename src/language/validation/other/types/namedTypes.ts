import { SdsNamedType } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { typeArgumentsOrEmpty } from '../../../helpers/nodeProperties.js';
import { duplicatesBy } from '../../../helpers/collectionUtils.js';

export const CODE_NAMED_TYPE_DUPLICATE_TYPE_PARAMETER = 'named-type/duplicate-type-parameter';
export const CODE_NAMED_TYPE_POSITIONAL_AFTER_NAMED = 'named-type/positional-after-named';

export const namedTypeMustNotSetTypeParameterMultipleTimes = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const typeArgumentToTypeParameterOrUndefined = nodeMapper.typeArgumentToTypeParameterOrUndefined.bind(nodeMapper);

    return (node: SdsNamedType, accept: ValidationAcceptor): void => {
        const typeArguments = typeArgumentsOrEmpty(node.typeArgumentList);
        const duplicates = duplicatesBy(typeArguments, typeArgumentToTypeParameterOrUndefined);

        for (const duplicate of duplicates) {
            const correspondingTypeParameter = typeArgumentToTypeParameterOrUndefined(duplicate)!;
            accept('error', `The type parameter '${correspondingTypeParameter.name}' is already set.`, {
                node: duplicate,
                code: CODE_NAMED_TYPE_DUPLICATE_TYPE_PARAMETER,
            });
        }
    };
};

export const namedTypeTypeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments = (
    node: SdsNamedType,
    accept: ValidationAcceptor,
): void => {
    const typeArgumentList = node.typeArgumentList;
    if (!typeArgumentList) {
        return;
    }

    let foundNamed = false;
    for (const typeArgument of typeArgumentList.typeArguments) {
        if (typeArgument.typeParameter) {
            foundNamed = true;
        } else if (foundNamed) {
            accept('error', 'After the first named type argument all type arguments must be named.', {
                node: typeArgument,
                code: CODE_NAMED_TYPE_POSITIONAL_AFTER_NAMED,
            });
        }
    }
};

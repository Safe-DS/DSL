import { SdsNamedType } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { getTypeArguments, getTypeParameters, TypeParameter } from '../../../helpers/nodeProperties.js';
import { duplicatesBy } from '../../../../helpers/collections.js';
import { pluralize } from '../../../../helpers/strings.js';

export const CODE_NAMED_TYPE_DUPLICATE_TYPE_PARAMETER = 'named-type/duplicate-type-parameter';
export const CODE_NAMED_TYPE_POSITIONAL_AFTER_NAMED = 'named-type/positional-after-named';
export const CODE_NAMED_TYPE_TOO_MANY_TYPE_ARGUMENTS = 'named-type/too-many-type-arguments';

export const namedTypeMustNotSetTypeParameterMultipleTimes = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const typeArgumentToTypeParameter = nodeMapper.typeArgumentToTypeParameter.bind(nodeMapper);

    return (node: SdsNamedType, accept: ValidationAcceptor): void => {
        const typeArguments = getTypeArguments(node.typeArgumentList);
        const duplicates = duplicatesBy(typeArguments, typeArgumentToTypeParameter);

        for (const duplicate of duplicates) {
            const correspondingTypeParameter = typeArgumentToTypeParameter(duplicate)!;
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

export const namedTypeMustNotHaveTooManyTypeArguments = (node: SdsNamedType, accept: ValidationAcceptor): void => {
    const actualTypeArgumentCount = getTypeArguments(node).length;

    // We can never have too many arguments in this case
    if (actualTypeArgumentCount === 0) {
        return;
    }

    // If the declaration is unresolved, we already show another error
    const namedTypeDeclaration = node.declaration?.ref;
    if (!namedTypeDeclaration) {
        return;
    }

    const typeParameters = getTypeParameters(namedTypeDeclaration);
    const maxTypeArgumentCount = typeParameters.length;

    // All is good
    if (actualTypeArgumentCount <= maxTypeArgumentCount) {
        return;
    }

    const minTypeArgumentCount = typeParameters.filter(TypeParameter.isRequired).length;
    const kind = pluralize(Math.max(minTypeArgumentCount, maxTypeArgumentCount), 'type argument');
    if (minTypeArgumentCount === maxTypeArgumentCount) {
        accept('error', `Expected exactly ${minTypeArgumentCount} ${kind} but got ${actualTypeArgumentCount}.`, {
            node,
            property: 'typeArgumentList',
            code: CODE_NAMED_TYPE_TOO_MANY_TYPE_ARGUMENTS,
        });
    } else {
        accept(
            'error',
            `Expected between ${minTypeArgumentCount} and ${maxTypeArgumentCount} ${kind} but got ${actualTypeArgumentCount}.`,
            {
                node,
                property: 'typeArgumentList',
                code: CODE_NAMED_TYPE_TOO_MANY_TYPE_ARGUMENTS,
            },
        );
    }
};

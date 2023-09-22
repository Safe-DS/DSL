import { SdsTypeArgumentList } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';

export const CODE_TYPE_ARGUMENT_LIST_POSITIONAL_AFTER_NAMED = 'type-argument-list/positional-after-named';

export const typeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments = (
    node: SdsTypeArgumentList,
    accept: ValidationAcceptor,
): void => {
    let foundNamed = false;
    for (const typeArgument of node.typeArguments) {
        if (typeArgument.typeParameter) {
            foundNamed = true;
        } else if (foundNamed) {
            accept('error', 'After the first named type argument all type arguments must be named.', {
                node: typeArgument,
                code: CODE_TYPE_ARGUMENT_LIST_POSITIONAL_AFTER_NAMED,
            });
        }
    }
};

import { SdsArgumentList } from '../../generated/ast.js';
import { ValidationAcceptor } from 'langium';

export const CODE_ARGUMENT_LIST_POSITIONAL_AFTER_NAMED = 'argument-list/positional-after-named';

export const argumentListMustNotHavePositionalArgumentsAfterNamedArguments = (
    node: SdsArgumentList,
    accept: ValidationAcceptor,
): void => {
    let foundNamed = false;
    for (const argument of node.arguments) {
        if (argument.parameter) {
            foundNamed = true;
        } else if (foundNamed) {
            accept('error', 'After the first named argument all arguments must be named.', {
                node: argument,
                code: CODE_ARGUMENT_LIST_POSITIONAL_AFTER_NAMED,
            });
        }
    }
};

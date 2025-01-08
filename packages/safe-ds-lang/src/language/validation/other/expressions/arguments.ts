import { SafeDsServices } from '../../../safe-ds-module.js';
import type { SdsArgumentList } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { Argument, getArguments, Parameter } from '../../../helpers/nodeProperties.js';

export const CODE_ARGUMENT_POSITIONAL = 'argument/positional';

export const argumentMustBeNamedIfParameterIsOptional = (services: SafeDsServices) => {
    const locator = services.workspace.AstNodeLocator;
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsArgumentList, accept: ValidationAcceptor) => {
        for (const argument of getArguments(node).reverse()) {
            const parameter = nodeMapper.argumentToParameter(argument);
            if (!parameter) {
                // Still keep going if there are extra arguments.
                continue;
            }
            if (Parameter.isRequired(parameter)) {
                // Required parameters must appear before optional parameters.
                return;
            }

            if (!Argument.isNamed(argument)) {
                accept('error', 'Argument must be named if the parameter is optional.', {
                    node: argument,
                    property: 'value',
                    code: CODE_ARGUMENT_POSITIONAL,
                    data: { path: locator.getAstNodePath(node) },
                });

                // Only show the error for the last argument. If users added names starting in the middle, we would no
                // longer be able to assign the arguments to the correct parameters.
                return;
            }
        }
    };
};

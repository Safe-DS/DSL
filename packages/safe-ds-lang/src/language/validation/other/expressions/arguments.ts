import { SafeDsServices } from '../../../safe-ds-module.js';
import type { SdsArgument } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { Argument, Parameter } from '../../../helpers/nodeProperties.js';

export const CODE_ARGUMENT_POSITIONAL = 'argument/positional';

export const argumentMustBeNamedIfParameterIsOptional = (services: SafeDsServices) => {
    const locator = services.workspace.AstNodeLocator;
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsArgument, accept: ValidationAcceptor) => {
        const parameter = nodeMapper.argumentToParameter(node);
        if (!parameter || !Parameter.isOptional(parameter)) {
            return;
        }

        if (!Argument.isNamed(node)) {
            accept('error', 'Argument must be named if the parameter is optional.', {
                node,
                property: 'value',
                code: CODE_ARGUMENT_POSITIONAL,
                data: { path: locator.getAstNodePath(node) },
            });
        }
    };
};

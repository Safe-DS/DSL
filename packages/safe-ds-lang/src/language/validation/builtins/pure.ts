import type { ValidationAcceptor } from 'langium';
import type { SdsParameter } from '../../generated/ast.js';
import type { SafeDsServices } from '../../safe-ds-module.js';
import { CallableType } from '../../typing/model.js';

export const CODE_PURE_PARAMETER_MUST_HAVE_CALLABLE_TYPE = 'pure/parameter-must-have-callable-type';

export const pureParameterMustHaveCallableType = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        // Don't show an error if no type is specified (yet) or if the parameter is not marked as pure
        if (!node.type || !builtinAnnotations.isPure(node)) {
            return;
        }

        const type = typeComputer.computeType(node);
        if (!(type instanceof CallableType)) {
            accept('error', 'A pure parameter must have a callable type.', {
                node,
                property: 'name',
                code: CODE_PURE_PARAMETER_MUST_HAVE_CALLABLE_TYPE,
            });
        }
    };
};

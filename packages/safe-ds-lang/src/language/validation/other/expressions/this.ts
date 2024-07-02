import { SdsThis } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { UnknownType } from '../../../typing/model.js';

export const CODE_THIS_USAGE = 'this/usage';

export const thisMustReferToClassInstance = (services: SafeDsServices) => {
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsThis, accept: ValidationAcceptor): void => {
        const type = typeComputer.computeType(node);
        if (type === UnknownType) {
            accept('error', `The keyword 'this' must refer to a class instance.`, {
                node,
                code: CODE_THIS_USAGE,
            });
        }
    };
};

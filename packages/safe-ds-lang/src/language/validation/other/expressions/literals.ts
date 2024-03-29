import {
    isSdsCallable,
    isSdsCallableType,
    isSdsClass,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsParameter,
    SdsUnknown,
} from '../../../generated/ast.js';
import { AstUtils, ValidationAcceptor } from 'langium';

export const CODE_LITERALS_UNKNOWN = 'literals/unknown';

export const unknownMustOnlyBeUsedAsDefaultValueOfStub = (node: SdsUnknown, accept: ValidationAcceptor): void => {
    if (!unknownIsUsedCorrectly(node)) {
        accept(
            'error',
            'unknown is only allowed as the default value of a parameter of a class, enum variant, or function.',
            {
                node,
                code: CODE_LITERALS_UNKNOWN,
            },
        );
    }
};

const unknownIsUsedCorrectly = (node: SdsUnknown): boolean => {
    if (!isSdsParameter(node.$container) || node.$containerProperty !== 'defaultValue') {
        return false;
    }

    const containingCallable = AstUtils.getContainerOfType(node.$container, isSdsCallable);
    return (
        isSdsCallableType(containingCallable) || // Callable types must not have default values in general
        isSdsClass(containingCallable) ||
        isSdsEnumVariant(containingCallable) ||
        isSdsFunction(containingCallable)
    );
};

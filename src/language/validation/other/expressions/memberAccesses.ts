import { SafeDsServices } from '../../../safe-ds-module.js';
import { isSdsCall, isSdsEnumVariant, SdsMemberAccess } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { UnknownType } from '../../../typing/model.js';
import { isEmpty } from 'radash';
import { parametersOrEmpty } from '../../../helpers/nodeProperties.js';

export const CODE_MEMBER_ACCESS_MISSING_ENUM_VARIANT_INSTANTIATION = 'member-access/missing-enum-variant-instantiation';
export const CODE_MEMBER_ACCESS_MISSING_NULL_SAFETY = 'member-access/missing-null-safety';

export const memberAccessOfEnumVariantMustNotLackInstantiation = (
    node: SdsMemberAccess,
    accept: ValidationAcceptor,
): void => {
    const declaration = node.member.target.ref;
    if (!isSdsEnumVariant(declaration)) {
        return;
    }

    if (!isSdsCall(node.$container) && !isEmpty(parametersOrEmpty(declaration))) {
        accept('error', `The enum variant '${declaration.name}' has parameters, so an argument list must be added.`, {
            node,
            property: 'member',
            code: CODE_MEMBER_ACCESS_MISSING_ENUM_VARIANT_INSTANTIATION,
        });
    }
};

export const memberAccessMustBeNullSafeIfReceiverIsNullable =
    (services: SafeDsServices) =>
    (node: SdsMemberAccess, accept: ValidationAcceptor): void => {
        if (node.isNullSafe) {
            return;
        }

        const receiverType = services.types.TypeComputer.computeType(node.receiver);
        if (receiverType === UnknownType) {
            return;
        }

        if (receiverType.isNullable) {
            accept('error', 'The receiver can be null so a safe access must be used.', {
                node,
                code: CODE_MEMBER_ACCESS_MISSING_NULL_SAFETY,
            });
        }
    };

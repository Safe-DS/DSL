import {SafeDsServices} from "../../../safe-ds-module.js";
import {SdsMemberAccess} from "../../../generated/ast.js";
import {ValidationAcceptor} from "langium";
import {UnknownType} from "../../../typing/model.js";

export const CODE_MEMBER_ACCESS_MISSING_NULL_SAFETY = 'member-access/missing-null-safety';

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
                accept('error', "The receiver can be null so a safe access must be used.", {
                    node,
                    code: CODE_MEMBER_ACCESS_MISSING_NULL_SAFETY,
                });
            }
        };

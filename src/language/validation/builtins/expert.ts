import { getContainerOfType, ValidationAcceptor } from 'langium';
import {
    isSdsCallable,
    isSdsCallableType,
    isSdsLambda,
    SdsCallableType,
    SdsLambda,
    SdsParameter,
} from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { isRequiredParameter, parametersOrEmpty } from '../../helpers/nodeProperties.js';

export const CODE_EXPERT_TARGET_PARAMETER = 'expert/target-parameter';

export const requiredParameterMustNotBeExpert =
    (services: SafeDsServices) => (node: SdsParameter, accept: ValidationAcceptor) => {
        const expertAnnotationCall = services.builtins.Annotations.findExpertAnnotationCall(node);
        if (!expertAnnotationCall) {
            return;
        }

        const containingCallable = getContainerOfType(node, isSdsCallable);
        /* c8 ignore start */
        if (!containingCallable) {
            return;
        }
        /* c8 ignore stop */

        if (isSdsCallableType(containingCallable)) {
            accept('error', "The '@Expert' annotation is not applicable to parameters of callable types.", {
                node: expertAnnotationCall,
                code: CODE_EXPERT_TARGET_PARAMETER,
            });
        } else if (isSdsLambda(containingCallable)) {
            accept('error', "The '@Expert' annotation is not applicable to lambda parameters.", {
                node: expertAnnotationCall,
                code: CODE_EXPERT_TARGET_PARAMETER,
            });
        } else if (isRequiredParameter(node)) {
            if (expertAnnotationCall) {
                accept('error', 'An expert parameter must be optional.', {
                    node,
                    property: 'name',
                    code: CODE_EXPERT_TARGET_PARAMETER,
                });
            }
        }
    };

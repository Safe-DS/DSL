import { ValidationAcceptor } from 'langium';
import { SdsParameter } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { isRequiredParameter } from '../../helpers/nodeProperties.js';
import { parameterCanBeAnnotated } from '../other/declarations/annotationCalls.js';

export const CODE_EXPERT_TARGET_PARAMETER = 'expert/target-parameter';

export const requiredParameterMustNotBeExpert =
    (services: SafeDsServices) => (node: SdsParameter, accept: ValidationAcceptor) => {
        if (isRequiredParameter(node) && parameterCanBeAnnotated(node)) {
            const expertAnnotationCall = services.builtins.Annotations.findExpertAnnotationCall(node);
            if (expertAnnotationCall) {
                accept('error', 'An expert parameter must be optional.', {
                    node,
                    property: 'name',
                    code: CODE_EXPERT_TARGET_PARAMETER,
                });
            }
        }
    };

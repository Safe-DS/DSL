import { ValidationAcceptor } from 'langium';
import { SdsParameter } from '../../generated/ast.js';
import { Parameter } from '../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { parameterCanBeAnnotated } from '../other/declarations/annotationCalls.js';

export const CODE_EXPERT_TARGET_PARAMETER = 'expert/target-parameter';

export const requiredParameterMustNotBeExpert =
    (services: SafeDsServices) => (node: SdsParameter, accept: ValidationAcceptor) => {
        if (Parameter.isRequired(node) && parameterCanBeAnnotated(node)) {
            if (services.builtins.Annotations.callsExpert(node)) {
                accept('error', 'An expert parameter must be optional.', {
                    node,
                    property: 'name',
                    code: CODE_EXPERT_TARGET_PARAMETER,
                });
            }
        }
    };

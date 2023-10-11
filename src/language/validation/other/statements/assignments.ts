import { isSdsPipeline, SdsAssignment, SdsYield } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { assigneesOrEmpty } from '../../../helpers/nodeProperties.js';

export const CODE_ASSIGMENT_NOTHING_ASSIGNED = 'assignment/nothing-assigned';
export const CODE_ASSIGMENT_YIELD_FORBIDDEN_IN_PIPELINE = 'assignment/yield-forbidden-in-pipeline';

export const assignmentAssigneeMustGetValue = (services: SafeDsServices) => (node: SdsAssignment, accept: ValidationAcceptor): void => {
    for (const assignee of assigneesOrEmpty(node)) {
            if (!services.helpers.NodeMapper.assigneeToAssignedObjectOrUndefined(assignee)) {
                accept('error', "No value is assigned to this assignee.", {
                    node: assignee,
                    code: CODE_ASSIGMENT_NOTHING_ASSIGNED,
                });
            }
    }
}

export const yieldMustNotBeUsedInPipeline = (node: SdsYield, accept: ValidationAcceptor): void => {
    const containingPipeline = getContainerOfType(node, isSdsPipeline);

    if (containingPipeline) {
        accept('error', 'Yield must not be used in a pipeline.', {
            node,
            code: CODE_ASSIGMENT_YIELD_FORBIDDEN_IN_PIPELINE,
        });
    }
};

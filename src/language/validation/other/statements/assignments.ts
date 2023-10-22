import { isSdsCall, isSdsPipeline, SdsAssignment, SdsYield } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { abstractResultsOrEmpty, assigneesOrEmpty } from '../../../helpers/nodeProperties.js';
import { pluralize } from '../../../../helpers/stringUtils.js';

export const CODE_ASSIGNMENT_IMPLICITLY_IGNORED_RESULT = 'assignment/implicitly-ignored-result';
export const CODE_ASSIGMENT_NOTHING_ASSIGNED = 'assignment/nothing-assigned';
export const CODE_ASSIGMENT_YIELD_FORBIDDEN_IN_PIPELINE = 'assignment/yield-forbidden-in-pipeline';

export const assignmentAssigneeMustGetValue =
    (services: SafeDsServices) =>
    (node: SdsAssignment, accept: ValidationAcceptor): void => {
        for (const assignee of assigneesOrEmpty(node)) {
            if (!services.helpers.NodeMapper.assigneeToAssignedObject(assignee)) {
                accept('error', 'No value is assigned to this assignee.', {
                    node: assignee,
                    code: CODE_ASSIGMENT_NOTHING_ASSIGNED,
                });
            }
        }
    };

export const assignmentShouldNotImplicitlyIgnoreResult = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsAssignment, accept: ValidationAcceptor): void => {
        const expression = node.expression;
        if (!isSdsCall(expression)) {
            return;
        }

        const assignees = assigneesOrEmpty(node);
        const callable = nodeMapper.callToCallable(expression);
        const results = abstractResultsOrEmpty(callable);

        if (results.length > assignees.length) {
            const kind = pluralize(results.length - assignees.length, 'result');
            const names = results
                .slice(assignees.length)
                .map((result) => `'${result.name}'`)
                .join(', ');

            accept('warning', `The assignment implicitly ignores the ${kind} ${names}.`, {
                node,
                code: CODE_ASSIGNMENT_IMPLICITLY_IGNORED_RESULT,
            });
        }
    };
};

export const yieldMustNotBeUsedInPipeline = (node: SdsYield, accept: ValidationAcceptor): void => {
    const containingPipeline = getContainerOfType(node, isSdsPipeline);

    if (containingPipeline) {
        accept('error', 'Yield must not be used in a pipeline.', {
            node,
            code: CODE_ASSIGMENT_YIELD_FORBIDDEN_IN_PIPELINE,
        });
    }
};

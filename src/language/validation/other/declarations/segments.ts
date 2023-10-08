import { SdsSegment } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { parametersOrEmpty, resultsOrEmpty } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_SEGMENT_DUPLICATE_YIELD = 'segment/duplicate-yield';
export const CODE_SEGMENT_UNASSIGNED_RESULT = 'segment/unassigned-result';
export const CODE_SEGMENT_UNUSED_PARAMETER = 'segment/unused-parameter';

export const segmentResultMustBeAssignedExactlyOnce =
    (services: SafeDsServices) => (node: SdsSegment, accept: ValidationAcceptor) => {
        const results = resultsOrEmpty(node.resultList);
        for (const result of results) {
            const yields = services.helpers.NodeMapper.resultToYields(result);
            if (yields.isEmpty()) {
                accept('error', 'Nothing is assigned to this result.', {
                    node: result,
                    property: 'name',
                    code: CODE_SEGMENT_UNASSIGNED_RESULT,
                });
                continue;
            }

            const duplicateYields = yields.tail(1);
            for (const duplicate of duplicateYields) {
                accept('error', `The result '${result.name}' has been assigned already.`, {
                    node: duplicate,
                    property: 'result',
                    code: CODE_SEGMENT_DUPLICATE_YIELD,
                });
            }
        }
    };

export const segmentParameterShouldBeUsed =
    (services: SafeDsServices) => (node: SdsSegment, accept: ValidationAcceptor) => {
        for (const parameter of parametersOrEmpty(node)) {
            const usages = services.helpers.NodeMapper.parameterToReferences(parameter);

            if (usages.isEmpty()) {
                accept('warning', 'This parameter is unused and can be removed.', {
                    node: parameter,
                    property: 'name',
                    code: CODE_SEGMENT_UNUSED_PARAMETER,
                });
            }
        }
    };

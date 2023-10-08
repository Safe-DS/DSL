import { SdsSegment } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { parametersOrEmpty, resultsOrEmpty, yieldsOrEmpty } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { duplicatesBy } from '../../../helpers/collectionUtils.js';

export const CODE_SEGMENT_DUPLICATE_YIELD = 'segment/duplicate-yield';
export const CODE_SEGMENT_UNASSIGNED_RESULT = 'segment/unassigned-result';
export const CODE_SEGMENT_UNUSED_PARAMETER = 'segment/unused-parameter';

export const segmentResultMustOnlyBeAssignedOnce = (node: SdsSegment, accept: ValidationAcceptor) => {
    const yields = yieldsOrEmpty(node.body);
    for (const duplicate of duplicatesBy(yields, (it) => it.result?.ref)) {
        accept('error', `The result '${duplicate.result?.$refText}' has been assigned already.`, {
            node: duplicate,
            property: 'result',
            code: CODE_SEGMENT_DUPLICATE_YIELD,
        });
    }
};

export const segmentResultMustBeAssigned =
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

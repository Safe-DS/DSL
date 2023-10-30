import { SdsSegment } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { getParameters, getResults } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { DiagnosticTag } from 'vscode-languageserver';

export const CODE_SEGMENT_DUPLICATE_YIELD = 'segment/duplicate-yield';
export const CODE_SEGMENT_UNASSIGNED_RESULT = 'segment/unassigned-result';
export const CODE_SEGMENT_UNUSED = 'segment/unused';
export const CODE_SEGMENT_UNUSED_PARAMETER = 'segment/unused-parameter';

export const segmentResultMustBeAssignedExactlyOnce = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsSegment, accept: ValidationAcceptor) => {
        const results = getResults(node.resultList);
        for (const result of results) {
            const yields = nodeMapper.resultToYields(result);
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
};

export const segmentShouldBeUsed = (services: SafeDsServices) => {
    const referenceProvider = services.references.References;

    return (node: SdsSegment, accept: ValidationAcceptor) => {
        // Don't show this warning for public segments
        if (node.visibility === undefined) {
            return;
        }

        const references = referenceProvider.findReferences(node, {});
        if (references.isEmpty()) {
            accept('warning', 'This segment is unused and can be removed.', {
                node,
                property: 'name',
                code: CODE_SEGMENT_UNUSED,
                tags: [DiagnosticTag.Unnecessary],
            });
        }
    };
};

export const segmentParameterShouldBeUsed = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsSegment, accept: ValidationAcceptor) => {
        for (const parameter of getParameters(node)) {
            const usages = nodeMapper.parameterToReferences(parameter);

            if (usages.isEmpty()) {
                accept('warning', 'This parameter is unused and can be removed.', {
                    node: parameter,
                    property: 'name',
                    code: CODE_SEGMENT_UNUSED_PARAMETER,
                    tags: [DiagnosticTag.Unnecessary],
                });
            }
        }
    };
};

import { isSdsPipeline, SdsYield } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';

export const CODE_ASSIGMENT_YIELD_FORBIDDEN_IN_PIPELINE = 'assignment/yield-forbidden-in-pipeline';

export const yieldMustNotBeUsedInPipeline = (node: SdsYield, accept: ValidationAcceptor): void => {
    const containingPipeline = getContainerOfType(node, isSdsPipeline);

    if (containingPipeline) {
        accept('error', 'Yield must not be used in a pipeline.', {
            node,
            code: CODE_ASSIGMENT_YIELD_FORBIDDEN_IN_PIPELINE,
        });
    }
};

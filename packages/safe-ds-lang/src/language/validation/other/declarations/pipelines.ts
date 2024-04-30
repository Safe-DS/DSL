import { ValidationAcceptor } from 'langium';
import { SdsPipeline } from '../../../generated/ast.js';
import { isInternal, isPrivate } from '../../../helpers/nodeProperties.js';

export const CODE_PIPELINE_VISIBILITY = 'pipeline/visibility';

export const pipelinesMustBePrivate = (node: SdsPipeline, accept: ValidationAcceptor) => {
    if (isInternal(node)) {
        accept('error', 'Pipelines are always private and cannot be declared as internal.', {
            node,
            property: 'visibility',
            code: CODE_PIPELINE_VISIBILITY,
        });
    } else if (isPrivate(node)) {
        accept('info', 'Pipelines are always private and need no explicit visibility modifier.', {
            node,
            property: 'visibility',
            code: CODE_PIPELINE_VISIBILITY,
        });
    }
};

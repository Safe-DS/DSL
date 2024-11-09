import { isSdsBlock, isSdsPipeline, SdsOutputStatement } from '../../../generated/ast.js';
import { AstUtils, ValidationAcceptor } from 'langium';

export const CODE_OUTPUT_STATEMENT_ONLY_IN_PIPELINE = 'output-statement/only-in-pipeline';

export const outputStatementMustOnlyBeUsedInPipeline = (node: SdsOutputStatement, accept: ValidationAcceptor): void => {
    const containingBlock = AstUtils.getContainerOfType(node, isSdsBlock);

    if (!isSdsPipeline(containingBlock?.$container)) {
        accept('error', 'Output statements can only be used in a pipeline.', {
            node,
            code: CODE_OUTPUT_STATEMENT_ONLY_IN_PIPELINE,
        });
    }
};

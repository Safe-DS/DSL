import { isSdsBlock, isSdsPipeline, SdsOutputStatement } from '../../../generated/ast.js';
import { AstUtils, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { NamedTupleType } from '../../../typing/model.js';

export const CODE_OUTPUT_STATEMENT_NO_VALUE = 'output-statement/no-value';
export const CODE_OUTPUT_STATEMENT_ONLY_IN_PIPELINE = 'output-statement/only-in-pipeline';

export const outputStatementMustHaveValue = (services: SafeDsServices) => {
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsOutputStatement, accept: ValidationAcceptor): void => {
        const containingBlock = AstUtils.getContainerOfType(node, isSdsBlock);
        if (!isSdsPipeline(containingBlock?.$container)) {
            // We already show another error in this case.
            return;
        }

        const expressionType = typeComputer.computeType(node.expression);
        if (expressionType instanceof NamedTupleType && expressionType.length === 0) {
            accept('error', 'This expression does not produce a value to output.', {
                node,
                property: 'expression',
                code: CODE_OUTPUT_STATEMENT_NO_VALUE,
            });
        }
    };
};

export const outputStatementMustOnlyBeUsedInPipeline = (node: SdsOutputStatement, accept: ValidationAcceptor): void => {
    const containingBlock = AstUtils.getContainerOfType(node, isSdsBlock);

    if (!isSdsPipeline(containingBlock?.$container)) {
        accept('error', 'Output statements can only be used in a pipeline.', {
            node,
            code: CODE_OUTPUT_STATEMENT_ONLY_IN_PIPELINE,
        });
    }
};

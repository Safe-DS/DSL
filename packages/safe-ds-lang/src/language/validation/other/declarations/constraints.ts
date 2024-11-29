import { isSdsParameter, isSdsReference, isSdsString, SdsConstraint } from '../../../generated/ast.js';
import { AstUtils, ValidationAcceptor } from 'langium';
import { Parameter } from '../../../helpers/nodeProperties.js';

export const CODE_CONSTRAINT_MESSAGE = 'constraint/message';

export const messageOfConstraintsMustOnlyReferenceConstantParameters = (
    node: SdsConstraint,
    accept: ValidationAcceptor,
) => {
    if (!node.message || isSdsString(node.message)) {
        return;
    }

    for (const expression of node.message.expressions) {
        const isInvalid = AstUtils.streamAst(expression)
            .filter(isSdsReference)
            .map((reference) => reference.target.ref)
            .some((target) => {
                return target && (!isSdsParameter(target) || !Parameter.isConstant(target));
            });

        if (isInvalid) {
            accept('error', 'The message of a constraint must only reference constant parameters.', {
                node: expression,
                property: 'target',
                code: CODE_CONSTRAINT_MESSAGE,
            });
        }
    }
};

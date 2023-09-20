import {isSdsTemplateStringPart, SdsTemplateString} from "../generated/ast.js";
import {ValidationAcceptor} from "langium";

export const CODE_OTHER_MISSING_TEMPLATE_EXPRESSION = 'other/missing-template-expression';

export const templateStringMustHaveExpressionBetweenTwoStringParts = (node: SdsTemplateString, accept: ValidationAcceptor): void => {
    for (let i = 0; i < node.expressions.length - 1; i++) {
        const first = node.expressions[i];
        const second = node.expressions[i + 1];

        if (isSdsTemplateStringPart(first) && isSdsTemplateStringPart(second)) {
            accept('error', 'There must be an expression between two string parts.', {
                node: second,
                code: CODE_OTHER_MISSING_TEMPLATE_EXPRESSION,
            });
        }
    }
}

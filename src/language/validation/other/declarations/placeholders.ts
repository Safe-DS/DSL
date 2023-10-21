import {
    isSdsAssignment,
    isSdsBlock,
    isSdsParameter,
    isSdsPlaceholder,
    isSdsReference,
    isSdsStatement,
    SdsPlaceholder,
} from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { statementsOrEmpty } from '../../../helpers/nodeProperties.js';
import { last } from 'radash';
import { DiagnosticTag } from 'vscode-languageserver';

export const CODE_PLACEHOLDER_ALIAS = 'placeholder/alias';
export const CODE_PLACEHOLDER_UNUSED = 'placeholder/unused';

export const placeholdersMustNotBeAnAlias = (node: SdsPlaceholder, accept: ValidationAcceptor): void => {
    if (node.$containerIndex ?? 0 > 0) {
        return;
    }

    const containingAssignment = getContainerOfType(node, isSdsAssignment);
    const rhs = containingAssignment?.expression;
    if (!isSdsReference(rhs)) {
        return;
    }

    const referenceTarget = rhs.target.ref;
    if (isSdsParameter(referenceTarget) || isSdsPlaceholder(referenceTarget)) {
        accept('error', 'Aliases are not allowed to provide a cleaner graphical view.', {
            node,
            property: 'name',
            code: CODE_PLACEHOLDER_ALIAS,
        });
    }
};

export const placeholderShouldBeUsed =
    (services: SafeDsServices) => (node: SdsPlaceholder, accept: ValidationAcceptor) => {
        const usages = services.helpers.NodeMapper.placeholderToReferences(node);
        if (!usages.isEmpty()) {
            return;
        }

        // Don't show a warning if the placeholder is declared in the last statement in the block
        const containingStatement = getContainerOfType(node, isSdsStatement);
        const containingBlock = getContainerOfType(containingStatement, isSdsBlock);
        const allStatementsInBlock = statementsOrEmpty(containingBlock);
        if (last(allStatementsInBlock) === containingStatement) {
            return;
        }

        accept('warning', 'This placeholder is unused and can be removed.', {
            node,
            property: 'name',
            code: CODE_PLACEHOLDER_UNUSED,
            tags: [DiagnosticTag.Unnecessary],
        });
    };

import { isSdsBlock, isSdsStatement, SdsPlaceholder } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { statementsOrEmpty } from '../../../helpers/nodeProperties.js';
import { last } from 'radash';

export const CODE_PLACEHOLDER_UNUSED = 'placeholder/unused';

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
        });
    };

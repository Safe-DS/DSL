import { DefaultScopeProvider, EMPTY_SCOPE, getContainerOfType, ReferenceInfo, Scope } from 'langium';
import { isSdsSegment, isSdsYield } from '../generated/ast.js';
import { resultsOrEmpty } from '../helpers/astShortcuts.js';

export class SafeDsScopeProvider extends DefaultScopeProvider {
    override getScope(context: ReferenceInfo): Scope {
        if (isSdsYield(context.container) && context.property === 'result') {
            return this.getScopeForYieldedResult(context);
        } else {
            return super.getScope(context);
        }
    }

    getScopeForYieldedResult(context: ReferenceInfo): Scope {
        const containingSegment = getContainerOfType(context.container, isSdsSegment);
        if (!containingSegment) {
            return EMPTY_SCOPE;
        }

        return this.createScopeForNodes(resultsOrEmpty(containingSegment.resultList));
    }
}

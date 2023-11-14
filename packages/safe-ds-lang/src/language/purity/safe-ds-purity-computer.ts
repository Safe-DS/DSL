import { type AstNode, type AstNodeLocator, getDocument, WorkspaceCache } from 'langium';
import { isEmpty } from '../../helpers/collectionUtils.js';
import type { SafeDsCallGraphComputer } from '../flow/safe-ds-call-graph-computer.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { type ImpurityReason, OtherImpurityReason } from './model.js';

/* c8 ignore start */
export class SafeDsPurityComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly callGraphComputer: SafeDsCallGraphComputer;
    private readonly reasonsCache: WorkspaceCache<string, ImpurityReason[]>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.callGraphComputer = services.flow.CallGraphComputer;
        this.reasonsCache = new WorkspaceCache(services.shared);
    }

    // TODO: What should be the type of `node`? Can it be AstNode or should it be restricted?

    isPure(node: AstNode): boolean {
        return isEmpty(this.getImpurityReasons(node));
    }

    hasSideEffects(node: AstNode): boolean {
        return this.getImpurityReasons(node).some((it) => it.isSideEffect);
    }

    getImpurityReasons(node: AstNode): ImpurityReason[] {
        const key = this.getNodeId(node);
        return this.reasonsCache.get(key, () => [OtherImpurityReason]);
    }

    private getNodeId(node: AstNode) {
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }
}
/* c8 ignore stop */

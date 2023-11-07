import {
    AbstractCallHierarchyProvider,
    type AstNode,
    type CstNode,
    getDocument,
    type NodeKindProvider,
    type ReferenceDescription,
    type Stream,
} from 'langium';
import {
    type CallHierarchyIncomingCall,
    type CallHierarchyOutgoingCall,
    type Range,
    SymbolKind,
    SymbolTag,
} from 'vscode-languageserver';
import type { SafeDsCallGraphComputer } from '../flow/safe-ds-call-graph-computer.js';
import type { SdsCallable } from '../generated/ast.js';
import type { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import type { SafeDsNodeInfoProvider } from './safe-ds-node-info-provider.js';

export class SafeDsCallHierarchyProvider extends AbstractCallHierarchyProvider {
    private readonly callGraphComputer: SafeDsCallGraphComputer;
    private readonly nodeInfoProvider: SafeDsNodeInfoProvider;
    private readonly nodeKindProvider: NodeKindProvider;
    private readonly nodeMapper: SafeDsNodeMapper;

    constructor(services: SafeDsServices) {
        super(services);

        this.callGraphComputer = services.flow.CallGraphComputer;
        this.nodeInfoProvider = services.lsp.NodeInfoProvider;
        this.nodeKindProvider = services.shared.lsp.NodeKindProvider;
        this.nodeMapper = services.helpers.NodeMapper;
    }

    protected override getCallHierarchyItem(targetNode: AstNode): {
        kind: SymbolKind;
        tags?: SymbolTag[];
        detail?: string;
    } {
        return {
            kind: this.nodeKindProvider.getSymbolKind(targetNode),
            tags: this.nodeInfoProvider.getTags(targetNode),
            detail: this.nodeInfoProvider.getDetails(targetNode),
        };
    }

    protected getIncomingCalls(
        _node: AstNode,
        _references: Stream<ReferenceDescription>,
    ): CallHierarchyIncomingCall[] | undefined {
        return undefined;
    }

    protected getOutgoingCalls(node: AstNode): CallHierarchyOutgoingCall[] | undefined {
        const calls = this.callGraphComputer.getCalls(node);
        const callsGroupedByCallable = new Map<
            string,
            { callable: SdsCallable; callableNameCstNode: CstNode; callableDocumentUri: string; fromRanges: Range[] }
        >();

        // Group calls by the callable they refer to
        calls.forEach((call) => {
            const callCstNode = call.$cstNode;
            if (!callCstNode) {
                return;
            }

            const callable = this.nodeMapper.callToCallable(call);
            if (!callable?.$cstNode) {
                return;
            }

            const callableNameCstNode = this.nameProvider.getNameNode(callable);
            if (!callableNameCstNode) {
                return;
            }

            const callableDocumentUri = getDocument(callable).uri.toString();
            const callableId = callableDocumentUri + '~' + callableNameCstNode.text;

            const previousFromRanges = callsGroupedByCallable.get(callableId)?.fromRanges ?? [];
            callsGroupedByCallable.set(callableId, {
                callable,
                callableNameCstNode,
                fromRanges: [...previousFromRanges, callCstNode.range],
                callableDocumentUri,
            });
        });

        if (callsGroupedByCallable.size === 0) {
            return undefined;
        }

        return Array.from(callsGroupedByCallable.values()).map((call) => ({
            to: {
                name: call.callableNameCstNode.text,
                range: call.callable.$cstNode!.range,
                selectionRange: call.callableNameCstNode.range,
                uri: call.callableDocumentUri,
                ...this.getCallHierarchyItem(call.callable),
            },
            fromRanges: call.fromRanges,
        }));
    }
}

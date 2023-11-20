import {
    AbstractCallHierarchyProvider,
    type AstNode,
    type CstNode,
    findLeafNodeAtOffset,
    getContainerOfType,
    getDocument,
    type NodeKindProvider,
    type ReferenceDescription,
    type Stream,
} from 'langium';
import type {
    CallHierarchyIncomingCall,
    CallHierarchyOutgoingCall,
    Range,
    SymbolKind,
    SymbolTag,
} from 'vscode-languageserver';
import type { SafeDsCallGraphComputer } from '../flow/safe-ds-call-graph-computer.js';
import {
    isSdsDeclaration,
    isSdsParameter,
    type SdsCall,
    type SdsCallable,
    type SdsDeclaration,
} from '../generated/ast.js';
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
        node: AstNode,
        references: Stream<ReferenceDescription>,
    ): CallHierarchyIncomingCall[] | undefined {
        const result: CallHierarchyIncomingCall[] = [];

        this.getUniquePotentialCallers(references).forEach((caller) => {
            if (!caller.$cstNode) {
                /* c8 ignore next 2 */
                return;
            }

            const callerNameCstNode = this.nameProvider.getNameNode(caller);
            if (!callerNameCstNode) {
                /* c8 ignore next 2 */
                return;
            }

            // Find all calls inside the caller that refer to the given node. This can also handle aliases.
            const callsOfNode = this.getCallsOf(caller, node);
            if (callsOfNode.length === 0 || callsOfNode.some((it) => !it.$cstNode)) {
                return;
            }

            const callerDocumentUri = getDocument(caller).uri.toString();

            result.push({
                from: {
                    name: callerNameCstNode.text,
                    range: caller.$cstNode.range,
                    selectionRange: callerNameCstNode.range,
                    uri: callerDocumentUri,
                    ...this.getCallHierarchyItem(caller),
                },
                fromRanges: callsOfNode.map((it) => it.$cstNode!.range),
            });
        });

        if (result.length === 0) {
            return undefined;
        }

        return result;
    }

    /**
     * Returns all declarations that contain at least one of the given references. Some of them might not be actual
     * callers, since the references might not occur in a call. This has to be checked later.
     */
    private getUniquePotentialCallers(references: Stream<ReferenceDescription>): Stream<SdsDeclaration> {
        return references
            .map((it) => {
                const document = this.documents.getOrCreateDocument(it.sourceUri);
                const rootNode = document.parseResult.value;
                if (!rootNode.$cstNode) {
                    /* c8 ignore next 2 */
                    return undefined;
                }

                const targetCstNode = findLeafNodeAtOffset(rootNode.$cstNode, it.segment.offset);
                if (!targetCstNode) {
                    /* c8 ignore next 2 */
                    return undefined;
                }

                const containingDeclaration = getContainerOfType(targetCstNode.astNode, isSdsDeclaration);
                if (isSdsParameter(containingDeclaration)) {
                    // For parameters, we return their containing callable instead
                    return getContainerOfType(containingDeclaration.$container, isSdsDeclaration);
                } else {
                    return containingDeclaration;
                }
            })
            .distinct()
            .filter(isSdsDeclaration);
    }

    private getCallsOf(caller: AstNode, callee: AstNode): SdsCall[] {
        return this.callGraphComputer
            .getAllContainedCalls(caller)
            .filter((call) => this.nodeMapper.callToCallable(call) === callee);
    }

    protected getOutgoingCalls(node: AstNode): CallHierarchyOutgoingCall[] | undefined {
        const calls = this.callGraphComputer.getAllContainedCalls(node);
        const callsGroupedByCallable = new Map<
            string,
            { callable: SdsCallable; callableNameCstNode: CstNode; callableDocumentUri: string; fromRanges: Range[] }
        >();

        // Group calls by the callable they refer to
        calls.forEach((call) => {
            const callCstNode = call.$cstNode;
            if (!callCstNode) {
                /* c8 ignore next 2 */
                return;
            }

            const callable = this.nodeMapper.callToCallable(call);
            if (!callable?.$cstNode) {
                /* c8 ignore next 2 */
                return;
            }

            const callableNameCstNode = this.nameProvider.getNameNode(callable);
            if (!callableNameCstNode) {
                /* c8 ignore next 2 */
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

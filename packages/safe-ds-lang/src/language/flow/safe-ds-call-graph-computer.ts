import { AstNode, type AstNodeLocator, getDocument, streamAst, WorkspaceCache } from 'langium';
import { isSdsCall, type SdsCall, SdsCallable } from '../generated/ast.js';
import type { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { ParameterSubstitutions } from '../partialEvaluation/model.js';
import { CallGraph } from './model.js';

export class SafeDsCallGraphComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly nodeMapper: SafeDsNodeMapper;

    /**
     * Stores the calls inside the node with the given ID.
     */
    private readonly callCache: WorkspaceCache<string, SdsCall[]>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.nodeMapper = services.helpers.NodeMapper;

        this.callCache = new WorkspaceCache(services.shared);
    }

    /**
     * Returns whether the given call is recursive using the given parameter substitutions.
     *
     * @param node
     * The call to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of the call, but the values of the parameters
     * of any containing callables, i.e. the context of the call.
     */
    isRecursive(node: SdsCall, substitutions: ParameterSubstitutions): boolean {
        const callGraph = this.getCallGraph(node, substitutions);
        return this.doCheckIsRecursive(callGraph, new Set());
    }

    private doCheckIsRecursive(graph: CallGraph | undefined, visited: Set<SdsCallable>): boolean {
        if (!graph) {
            return false;
        } else if (visited.has(graph.root)) {
            return true;
        }

        const newVisited = new Set([...visited, graph.root]);
        return graph.children.some((child) => this.doCheckIsRecursive(child, newVisited));
    }

    /**
     * Returns a stream of all callables that are called directly or indirectly by the given call. The call graph is
     * traversed depth-first. If a callable is called recursively, it is only included once again.
     *
     * @param node
     * The call to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of the call, but the values of the parameters
     * of any containing callables, i.e. the context of the call.
     */
    getCallGraph(node: SdsCall, substitutions: ParameterSubstitutions): CallGraph | undefined {
        return this.getCallGraphWithRecursionCheck(node, substitutions, new Set());
    }

    private getCallGraphWithRecursionCheck(
        node: SdsCall,
        substitutions: ParameterSubstitutions,
        visited: Set<SdsCallable>,
    ): CallGraph | undefined {
        const callable = this.getCallable(node, substitutions);
        if (!callable) {
            return undefined;
        } else if (visited.has(callable)) {
            return new CallGraph(callable, []);
        }

        const newVisited = new Set([...visited, callable]);
        const children = this.getExecutedCallsInCallable(callable, substitutions)
            .map((child) => this.getCallGraphWithRecursionCheck(child, substitutions, newVisited))
            .filter((child) => child !== undefined) as CallGraph[];
        return new CallGraph(callable, children);
    }

    private getCallable(node: SdsCall, _substitutions: ParameterSubstitutions): SdsCallable | undefined {
        const callable = this.nodeMapper.callToCallable(node);
        if (callable === undefined) {
            return undefined;
        }

        // TODO replace callable types with substitution values

        return callable;
    }

    private getExecutedCallsInCallable(node: SdsCallable, _substitutions: ParameterSubstitutions): SdsCall[] {
        // TODO
        return this.getCalls(node);
    }

    getCalls(node: AstNode): SdsCall[] {
        const key = this.getNodeId(node);
        return this.callCache.get(key, () => streamAst(node).filter(isSdsCall).toArray());
    }

    private getNodeId(node: AstNode) {
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }
}

import {
    AstNode,
    type AstNodeLocator,
    getContainerOfType,
    getDocument,
    isNamed,
    stream,
    streamAst,
    WorkspaceCache,
} from 'langium';
import {
    isSdsAnnotation,
    isSdsBlockLambda,
    isSdsCall,
    isSdsCallable,
    isSdsCallableType,
    isSdsClass,
    isSdsEnumVariant,
    isSdsExpressionLambda,
    isSdsFunction,
    isSdsParameter,
    isSdsSegment,
    SdsCall,
    SdsCallable,
    SdsExpression,
} from '../generated/ast.js';
import type { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import {
    BlockLambdaClosure,
    EvaluatedCallable,
    EvaluatedNode,
    ExpressionLambdaClosure,
    NamedCallable,
    ParameterSubstitutions,
    UnknownEvaluatedNode,
} from '../partialEvaluation/model.js';
import { CallGraph } from './model.js';
import { getArguments, getParameters } from '../helpers/nodeProperties.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { CallableType, StaticType } from '../typing/model.js';

export class SafeDsCallGraphComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly typeComputer: SafeDsTypeComputer;

    /**
     * Stores the calls inside the node with the given ID.
     */
    private readonly callCache: WorkspaceCache<string, SdsCall[]>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.nodeMapper = services.helpers.NodeMapper;
        this.typeComputer = services.types.TypeComputer;

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

    private doCheckIsRecursive(graph: CallGraph, visited: Set<SdsCallable>): boolean {
        if (!graph.root) {
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
    getCallGraph(node: SdsCall, substitutions: ParameterSubstitutions): CallGraph {
        return this.getCallGraphWithRecursionCheck(node, substitutions, new Set());
    }

    private getCallGraphWithRecursionCheck(
        node: SdsCall | SdsCallable,
        substitutions: ParameterSubstitutions,
        visited: Set<SdsCallable>,
    ): CallGraph {
        const callable = this.getCallable(node, substitutions);
        if (!callable || visited.has(callable)) {
            return new CallGraph(callable, []);
        }

        const newSubstitutions = this.getNewSubstitutions(node, substitutions);
        const newVisited = new Set([...visited, callable]);
        const children = this.getExecutedCalls(callable, newSubstitutions).map((child) =>
            this.getCallGraphWithRecursionCheck(child, newSubstitutions, newVisited),
        );
        return new CallGraph(callable, children);
    }

    //TODO
    private getCallable(node: SdsCall | SdsCallable, substitutions: ParameterSubstitutions): SdsCallable | undefined {
        let callable;
        if (isSdsCallable(node)) {
            callable = node;
        } else {
            callable = this.nodeMapper.callToCallable(node);
        }

        if (!callable || isSdsAnnotation(callable)) {
            return undefined;
        } else if (isSdsCallableType(callable)) {
            // TODO problem: lambdas might not have a manifest callable type on the parameter
            //  so far the callable type of the parameter the lambda is assigned to is used
            //  thus, the containment check does not work.
            const containingParameter = getContainerOfType(callable, isSdsParameter);
            if (!containingParameter) {
                return undefined;
            }

            const substitution = substitutions.get(containingParameter);
            if (!(substitution instanceof EvaluatedCallable)) {
                return undefined;
            }

            return substitution.callable;
        } else {
            return callable;
        }
    }

    private getNewSubstitutions(
        node: SdsCall | SdsCallable,
        substitutions: ParameterSubstitutions,
    ): ParameterSubstitutions {
        // If we get a callable, we assume no arguments are passed in the call
        if (isSdsCallable(node)) {
            return new Map();
        }

        return new Map(
            getArguments(node).flatMap((it) => {
                // Ignore arguments that don't get assigned to a parameter
                const parameter = this.nodeMapper.argumentToParameter(it);
                if (!parameter) {
                    return [];
                }

                const value = this.getEvaluatedCallable(it.value, substitutions);
                return [[parameter, value]];
            }),
        );
    }

    // TODO
    private getEvaluatedCallable(node: SdsExpression, substitutions: ParameterSubstitutions): EvaluatedNode {
        const valueType = this.typeComputer.computeType(node);
        let callable: SdsCallable | undefined = undefined;

        if (valueType instanceof CallableType) {
            callable = valueType.callable;
        } else if (valueType instanceof StaticType) {
            const declaration = valueType.instanceType.declaration;
            if (isSdsCallable(declaration)) {
                callable = declaration;
            }
        }

        if (!callable) {
            return UnknownEvaluatedNode;
        }

        if (isNamed(callable)) {
            return new NamedCallable(callable);
        } else if (isSdsBlockLambda(callable)) {
            return new BlockLambdaClosure(callable, substitutions);
        } else if (isSdsExpressionLambda(callable)) {
            return new ExpressionLambdaClosure(callable, substitutions);
        } else {
            // TODO callable type?
            return UnknownEvaluatedNode;
        }
    }

    // TODO
    private getExecutedCalls(node: SdsCallable, substitutions: ParameterSubstitutions): (SdsCall | SdsCallable)[] {
        const parameters = getParameters(node);

        if (isSdsClass(node) || isSdsEnumVariant(node) || isSdsFunction(node)) {
            const callsInDefaultValues = parameters.flatMap((it) => {
                // The default value is only executed if no argument is passed for the parameter
                if (it.defaultValue && !substitutions.has(it)) {
                    return this.getCalls(it.defaultValue);
                } else {
                    return [];
                }
            });

            const callablesInSubstitutions = stream(substitutions.values()).flatMap((it) => {
                if (!(it instanceof EvaluatedCallable)) {
                    return [];
                }

                return [it.callable];
            });

            return [...callsInDefaultValues, ...callablesInSubstitutions];
        } else if (isSdsBlockLambda(node)) {
            return this.getCalls(node.body);
        } else if (isSdsExpressionLambda(node)) {
            return this.getCalls(node.result);
        } else if (isSdsSegment(node)) {
            return this.getCalls(node.body);
        } else {
            // TODO - throw if callable type or annotation
            return this.getCalls(node);
        }
    }

    /**
     * Returns all calls inside the given node. If the node is a call, it is included as well.
     */
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

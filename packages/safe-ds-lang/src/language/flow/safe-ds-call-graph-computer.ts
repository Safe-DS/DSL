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
    isSdsClass,
    isSdsEnumVariant,
    isSdsExpressionLambda,
    isSdsFunction,
    isSdsParameter,
    isSdsSegment,
    SdsCall,
    SdsCallable,
    SdsExpression,
    SdsParameter,
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
    isRecursive(node: SdsCall, substitutions: ParameterSubstitutions = new Map()): boolean {
        return this.getCallGraph(node, substitutions).isRecursive;
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
    getCallGraph(node: SdsCall, substitutions: ParameterSubstitutions = new Map()): CallGraph {
        return this.getCallGraphWithRecursionCheck(node, substitutions, new Set());
    }

    private getCallGraphWithRecursionCheck(
        node: SdsCall | SdsCallable,
        substitutions: ParameterSubstitutions,
        visited: Set<SdsCallable>,
    ): CallGraph {
        const callable = this.getCallable(node, substitutions);
        if (!callable) {
            return new CallGraph(callable, [], false);
        } else if (visited.has(callable)) {
            return new CallGraph(callable, [], true);
        }

        // Visit all calls in the callable
        const newSubstitutions = this.getNewSubstitutions(node, substitutions);
        const newVisited = new Set([...visited, callable]);
        const children = this.getExecutedCallsOrCallables(callable, newSubstitutions).map((child) => {
            return this.getCallGraphWithRecursionCheck(child, newSubstitutions, newVisited);
        });
        return new CallGraph(
            callable,
            children,
            children.some((it) => it.isRecursive),
        );
    }

    //TODO
    private getCallable(node: SdsCall | SdsCallable, substitutions: ParameterSubstitutions): SdsCallable | undefined {
        let callableOrParameter: SdsCallable | SdsParameter | undefined = undefined;
        if (isSdsCallable(node)) {
            callableOrParameter = node;
        } else {
            const receiverType = this.typeComputer.computeType(node.receiver);
            if (receiverType instanceof CallableType) {
                callableOrParameter = receiverType.parameter ?? receiverType.callable;
            } else if (receiverType instanceof StaticType) {
                const declaration = receiverType.instanceType.declaration;
                if (isSdsCallable(declaration)) {
                    callableOrParameter = declaration;
                }
            }
        }

        if (!callableOrParameter || isSdsAnnotation(callableOrParameter)) {
            return undefined;
        } else if (isSdsParameter(callableOrParameter)) {
            const substitution = substitutions.get(callableOrParameter);
            if (!(substitution instanceof EvaluatedCallable)) {
                return undefined;
            }

            return substitution.callable;
        } else {
            return callableOrParameter;
        }
        // TODO use evaluatedcallable or remove altogether
    }

    // TODO
    private getEvaluatedCallable(node: SdsExpression, substitutions: ParameterSubstitutions): EvaluatedNode {
        const type = this.typeComputer.computeType(node);
        let callable: SdsCallable | undefined = undefined;

        if (type instanceof CallableType) {
            callable = type.callable;
        } else if (type instanceof StaticType) {
            const declaration = type.instanceType.declaration;
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
    private getNewSubstitutions(
        node: SdsCall | SdsCallable,
        substitutions: ParameterSubstitutions,
    ): ParameterSubstitutions {
        // If we get a callable, we assume no arguments are passed in the call
        if (isSdsCallable(node)) {
            return new Map();
        }

        const parameters = getParameters(this.getCallable(node, substitutions));

        return new Map(
            getArguments(node).flatMap((it) => {
                // Ignore arguments that don't get assigned to a parameter
                const parameterIndex = this.nodeMapper.argumentToParameter(it)?.$containerIndex ?? -1;
                if (parameterIndex === -1) {
                    return [];
                }

                const parameter = parameters[parameterIndex];
                if (!parameter) {
                    return [];
                }

                // TODO: argumentToParameter points to parameters of a callable type,
                //  not parameters of a passed lambda; we need to map the parameters of
                //  the callable type to the parameters of the lambda

                const value = this.getEvaluatedCallable(it.value, substitutions);
                return [[parameter, value]];
            }),
        );
    }

    // TODO
    private getExecutedCallsOrCallables(
        node: SdsCallable,
        substitutions: ParameterSubstitutions,
    ): (SdsCall | SdsCallable)[] {
        const parameters = getParameters(node);

        if (isSdsClass(node) || isSdsEnumVariant(node) || isSdsFunction(node)) {
            const callsInDefaultValues = parameters.flatMap((it) => {
                // The default value is only executed if no argument is passed for the parameter
                if (it.defaultValue && !substitutions.has(it)) {
                    const calls = this.getCalls(it.defaultValue);
                    if (calls.length > 0) {
                        return calls;
                    }

                    const callable = this.getEvaluatedCallable(it.defaultValue, substitutions);
                    if (callable instanceof EvaluatedCallable) {
                        return callable.callable;
                    }

                    return [];
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
            const callsInDefaultValues = parameters.flatMap((it) => {
                // The default value is only executed if no argument is passed for the parameter
                if (it.defaultValue && !substitutions.has(it)) {
                    return this.getCalls(it.defaultValue).filter(
                        (call) => getContainerOfType(call, isSdsCallable) === node,
                    );
                } else {
                    return [];
                }
            });

            const callsInBody = this.getCalls(node.body).filter((it) => getContainerOfType(it, isSdsCallable) === node);

            return [...callsInDefaultValues, ...callsInBody];
        } else if (isSdsExpressionLambda(node)) {
            const callsInDefaultValues = parameters.flatMap((it) => {
                // The default value is only executed if no argument is passed for the parameter
                if (it.defaultValue && !substitutions.has(it)) {
                    return this.getCalls(it.defaultValue).filter(
                        (call) => getContainerOfType(call, isSdsCallable) === node,
                    );
                } else {
                    return [];
                }
            });

            const callsInBody = this.getCalls(node.result).filter(
                (it) => getContainerOfType(it, isSdsCallable) === node,
            );

            return [...callsInDefaultValues, ...callsInBody];
        } else if (isSdsSegment(node)) {
            const callsInDefaultValues = parameters.flatMap((it) => {
                // The default value is only executed if no argument is passed for the parameter
                if (it.defaultValue && !substitutions.has(it)) {
                    return this.getCalls(it.defaultValue).filter(
                        (call) => getContainerOfType(call, isSdsCallable) === node,
                    );
                } else {
                    return [];
                }
            });

            const callsInBody = this.getCalls(node.body).filter((it) => getContainerOfType(it, isSdsCallable) === node);

            return [...callsInDefaultValues, ...callsInBody];
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

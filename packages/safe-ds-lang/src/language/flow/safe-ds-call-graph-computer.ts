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
    isSdsBlockLambda,
    isSdsCall,
    isSdsCallable,
    isSdsClass,
    isSdsEnumVariant,
    isSdsExpressionLambda,
    isSdsFunction,
    isSdsSegment,
    SdsArgument,
    SdsBlockLambda,
    SdsCall,
    SdsCallable,
    SdsClass,
    SdsEnumVariant,
    SdsExpression,
    SdsExpressionLambda,
    SdsFunction,
    SdsSegment,
} from '../generated/ast.js';
import type { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import {
    BlockLambdaClosure,
    EvaluatedCallable,
    ExpressionLambdaClosure,
    NamedCallable,
    ParameterSubstitutions,
    substitutionsAreEqual,
} from '../partialEvaluation/model.js';
import { CallGraph } from './model.js';
import { getArguments, getParameters } from '../helpers/nodeProperties.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { CallableType, StaticType } from '../typing/model.js';
import { isEmpty } from '../../helpers/collectionUtils.js';

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
    isRecursive(node: SdsCall, substitutions: ParameterSubstitutions = NO_SUBSTITUTIONS): boolean {
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
    getCallGraph(node: SdsCall, substitutions: ParameterSubstitutions = NO_SUBSTITUTIONS): CallGraph {
        const call = this.createSyntheticCallForCall(node, substitutions);
        return this.getCallGraphWithRecursionCheck(call, []);
    }

    private getCallGraphWithRecursionCheck(syntheticCall: SyntheticCall, visited: SyntheticCall[]): CallGraph {
        console.log(
            syntheticCall?.callable?.callable?.$cstNode?.text,
            stream(syntheticCall?.substitutions.entries())
                .map(([parameter, value]) => {
                    return `${parameter.name} = ${value.toString()}`;
                })
                .toArray(),
        );

        const evaluatedCallable = syntheticCall.callable;

        // Handle unknown callables & recursive calls
        if (!evaluatedCallable) {
            return new CallGraph(undefined, [], false);
        } else if (visited.some((it) => it.equals(syntheticCall))) {
            return new CallGraph(evaluatedCallable.callable, [], true);
        }

        // Visit all calls in the callable
        const newVisited = [...visited, syntheticCall];
        const children = this.getExecutedCalls(syntheticCall).map((it) => {
            return this.getCallGraphWithRecursionCheck(it, newVisited);
        });

        return new CallGraph(
            evaluatedCallable.callable,
            children,
            children.some((it) => it.isRecursive),
        );
    }

    private getExecutedCalls(syntheticCall: SyntheticCall): SyntheticCall[] {
        if (!syntheticCall.callable) {
            return [];
        }

        const callable = syntheticCall.callable.callable;
        const substitutions = syntheticCall.substitutions;

        if (isSdsBlockLambda(callable) || isSdsExpressionLambda(callable) || isSdsSegment(callable)) {
            return this.getExecutedCallsInPipelineCallable(callable, substitutions);
        } else if (isSdsClass(callable) || isSdsEnumVariant(callable) || isSdsFunction(callable)) {
            return this.getExecutedCallsInStubCallable(callable, substitutions);
        } else {
            return [];
        }
    }

    private getExecutedCallsInPipelineCallable(
        callable: SdsBlockLambda | SdsExpressionLambda | SdsSegment,
        substitutions: ParameterSubstitutions,
    ): SyntheticCall[] {
        const callsInDefaultValues = getParameters(callable).flatMap((it) => {
            // The default value is only executed if no argument is passed for the parameter
            if (it.defaultValue && !substitutions.has(it)) {
                return this.getCalls(it.defaultValue);
            } else {
                return [];
            }
        });

        let callsInBody: SdsCall[];
        if (isSdsBlockLambda(callable)) {
            callsInBody = this.getCalls(callable.body);
        } else if (isSdsExpressionLambda(callable)) {
            callsInBody = this.getCalls(callable.result);
        } else {
            callsInBody = this.getCalls(callable.body);
        }

        return [...callsInDefaultValues, ...callsInBody]
            .filter((it) => getContainerOfType(it, isSdsCallable) === callable)
            .map((it) => this.createSyntheticCallForCall(it, substitutions));
    }

    private getExecutedCallsInStubCallable(
        callable: SdsClass | SdsEnumVariant | SdsFunction,
        substitutions: ParameterSubstitutions,
    ): SyntheticCall[] {
        const callsInDefaultValues = getParameters(callable).flatMap((parameter) => {
            // The default value is only executed if no argument is passed for the parameter
            if (parameter.defaultValue && !substitutions.has(parameter)) {
                // We assume all calls in the default value are executed
                const calls = this.getCalls(parameter.defaultValue);
                if (!isEmpty(calls)) {
                    return calls.map((call) => this.createSyntheticCallForCall(call, substitutions));
                }

                // We assume a single callable as default value is executed
                const evaluatedCallable = this.getEvaluatedCallable(parameter.defaultValue, substitutions);
                if (evaluatedCallable) {
                    return [this.createSyntheticCallForEvaluatedCallable(evaluatedCallable)];
                }
            }

            return [];
        });

        const callablesInSubstitutions = stream(substitutions.values()).flatMap((it) => {
            if (it instanceof EvaluatedCallable) {
                return [this.createSyntheticCallForEvaluatedCallable(it)];
            }

            return [];
        });

        return [...callsInDefaultValues, ...callablesInSubstitutions];
    }

    private createSyntheticCallForCall(call: SdsCall, substitutions: ParameterSubstitutions): SyntheticCall {
        const evaluatedCallable = this.getEvaluatedCallable(call.receiver, substitutions);
        const newSubstitutions = this.getNewSubstitutions(evaluatedCallable, getArguments(call), substitutions);
        return new SyntheticCall(evaluatedCallable, newSubstitutions);
    }

    private createSyntheticCallForEvaluatedCallable(evaluatedCallable: EvaluatedCallable): SyntheticCall {
        return new SyntheticCall(evaluatedCallable, evaluatedCallable.substitutionsOnCreation);
    }

    // TODO
    private getEvaluatedCallable(
        expression: SdsExpression,
        substitutions: ParameterSubstitutions,
    ): EvaluatedCallable | undefined {
        const type = this.typeComputer.computeType(expression);
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
            return undefined;
        }

        if (isNamed(callable)) {
            return new NamedCallable(callable);
        } else if (isSdsBlockLambda(callable)) {
            return new BlockLambdaClosure(callable, substitutions);
        } else if (isSdsExpressionLambda(callable)) {
            return new ExpressionLambdaClosure(callable, substitutions);
        } else {
            // TODO callable type?
            return undefined;
        }

        // private getCallable(
        //         node: SdsCall | SdsCallable | undefined,
        //         substitutions: ParameterSubstitutions,
        // ): SdsCallable | undefined {
        //         if (!node) {
        //             return undefined;
        //         }
        //
        //         let callableOrParameter: SdsCallable | SdsParameter | undefined = undefined;
        //         if (isSdsCallable(node)) {
        //             callableOrParameter = node;
        //         } else {
        //             const receiverType = this.typeComputer.computeType(node.receiver);
        //             if (receiverType instanceof CallableType) {
        //                 callableOrParameter = receiverType.parameter ?? receiverType.callable;
        //             } else if (receiverType instanceof StaticType) {
        //                 const declaration = receiverType.instanceType.declaration;
        //                 if (isSdsCallable(declaration)) {
        //                     callableOrParameter = declaration;
        //                 }
        //             }
        //         }
        //
        //         if (!callableOrParameter || isSdsAnnotation(callableOrParameter)) {
        //             return undefined;
        //         } else if (isSdsParameter(callableOrParameter)) {
        //             const substitution = substitutions.get(callableOrParameter);
        //             if (substitution) {
        //                 if (substitution instanceof EvaluatedCallable) {
        //                     return substitution.callable;
        //                 } else {
        //                     return undefined;
        //                 }
        //             }
        //
        //             if (!callableOrParameter.defaultValue) {
        //                 return undefined;
        //             }
        //
        //             const defaultValue = this.getEvaluatedCallable(callableOrParameter.defaultValue, substitutions);
        //             if (!(defaultValue instanceof EvaluatedCallable)) {
        //                 return undefined;
        //             }
        //
        //             return defaultValue.callable;
        //         } else {
        //             return callableOrParameter;
        //         }
        //         // TODO use evaluatedcallable or remove altogether
        //     }
    }

    // TODO
    private getNewSubstitutions(
        callable: EvaluatedCallable | undefined,
        args: SdsArgument[],
        substitutions: ParameterSubstitutions,
    ): ParameterSubstitutions {
        if (!callable) {
            return NO_SUBSTITUTIONS;
        }

        const substitutionsOnCreation = callable.substitutionsOnCreation;

        const parameters = getParameters(callable?.callable);
        const substitutionsOnCall = new Map(
            args.flatMap((it) => {
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
                if (!value) {
                    return [];
                }

                return [[parameter, value]];
            }),
        );

        return new Map([...substitutionsOnCreation, ...substitutionsOnCall]);
    }

    /**
     * Returns all calls inside the given node. If the node is a call, it is included as well.
     */
    getCalls(node: AstNode | undefined): SdsCall[] {
        if (!node) {
            return [];
        }

        const key = this.getNodeId(node);
        return this.callCache.get(key, () => streamAst(node).filter(isSdsCall).toArray());
    }

    private getNodeId(node: AstNode) {
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }
}

class SyntheticCall {
    constructor(
        readonly callable: EvaluatedCallable | undefined,
        readonly substitutions: ParameterSubstitutions,
    ) {}

    equals(other: SyntheticCall): boolean {
        if (!this.callable) {
            return !other.callable && substitutionsAreEqual(this.substitutions, other.substitutions);
        }

        return this.callable.equals(other.callable) && substitutionsAreEqual(this.substitutions, other.substitutions);
    }
}

const NO_SUBSTITUTIONS: ParameterSubstitutions = new Map();

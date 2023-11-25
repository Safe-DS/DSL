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
    SdsArgument,
    SdsBlockLambda,
    SdsCall,
    SdsCallable,
    SdsClass,
    SdsEnumVariant,
    SdsExpression,
    SdsExpressionLambda,
    SdsFunction,
    SdsParameter,
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
    UnknownEvaluatedNode,
} from '../partialEvaluation/model.js';
import { CallGraph } from './model.js';
import { getArguments, getParameters } from '../helpers/nodeProperties.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { CallableType, StaticType } from '../typing/model.js';
import { isEmpty } from '../../helpers/collectionUtils.js';
import { SafeDsPartialEvaluator } from '../partialEvaluation/safe-ds-partial-evaluator.js';

export class SafeDsCallGraphComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly partialEvaluator: SafeDsPartialEvaluator;
    private readonly typeComputer: SafeDsTypeComputer;

    /**
     * Stores the calls inside the node with the given ID.
     */
    private readonly callCache: WorkspaceCache<string, SdsCall[]>;

    /**
     * Stores the call graph for the callable with the given ID if it is called without substitutions.
     */
    private readonly callGraphCache: WorkspaceCache<string, CallGraph>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;
        this.typeComputer = services.types.TypeComputer;

        this.callCache = new WorkspaceCache(services.shared);
        this.callGraphCache = new WorkspaceCache(services.shared);
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
     * **If given a call**: Returns a stream of all callables that are called directly or indirectly by the given call.
     * The call graph is traversed depth-first. If a callable is called recursively, it is only included once again.
     *
     * **If given a callable**: Does the above for all calls that get executed in the callable.
     *
     * @param node
     * The call/callable to get the call graph for.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of the call, but the values of the parameters
     * of any containing callables, i.e. the context of the call/callable.
     */
    getCallGraph(node: SdsCall | SdsCallable, substitutions: ParameterSubstitutions = NO_SUBSTITUTIONS): CallGraph {
        // Cache the result if no substitutions are given
        if (isEmpty(substitutions)) {
            const key = this.getNodeId(node);
            return this.callGraphCache.get(key, () => {
                return this.doGetCallGraph(node, substitutions);
            });
        } else {
            /* c8 ignore next 2 */
            return this.doGetCallGraph(node, substitutions);
        }
    }

    private doGetCallGraph(node: SdsCall | SdsCallable, substitutions: ParameterSubstitutions): CallGraph {
        if (isSdsCall(node)) {
            const call = this.createSyntheticCallForCall(node, substitutions);
            return this.getCallGraphWithRecursionCheck(call, []);
        } else {
            // TODO if a callable is passed and no substitutions are , we must not use its default values, since we
            //  don't know whether parameters are given in a call or not.
            const children = this.getExecutedCallsInCallable(node, substitutions).map((it) => {
                return this.getCallGraphWithRecursionCheck(it, []);
            });
            return new CallGraph(
                node,
                children,
                children.some((it) => it.isRecursive),
            );
        }
    }

    private getCallGraphWithRecursionCheck(syntheticCall: SyntheticCall, visited: SyntheticCall[]): CallGraph {
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
            /* c8 ignore next 2 */
            return [];
        }

        return this.getExecutedCallsInCallable(syntheticCall.callable.callable, syntheticCall.substitutions);
    }

    private getExecutedCallsInCallable(callable: SdsCallable | SdsParameter, substitutions: ParameterSubstitutions) {
        if (isSdsBlockLambda(callable) || isSdsExpressionLambda(callable) || isSdsSegment(callable)) {
            return this.getExecutedCallsInPipelineCallable(callable, substitutions);
        } else if (isSdsClass(callable) || isSdsEnumVariant(callable) || isSdsFunction(callable)) {
            return this.getExecutedCallsInStubCallable(callable, substitutions);
        } else {
            /* c8 ignore next 2 */
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
                return this.getAllContainedCalls(it.defaultValue);
            } else {
                return [];
            }
        });

        let callsInBody: SdsCall[];
        if (isSdsBlockLambda(callable)) {
            callsInBody = this.getAllContainedCalls(callable.body);
        } else if (isSdsExpressionLambda(callable)) {
            callsInBody = this.getAllContainedCalls(callable.result);
        } else {
            callsInBody = this.getAllContainedCalls(callable.body);
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
                const calls = this.getAllContainedCalls(parameter.defaultValue);
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

    private getEvaluatedCallable(
        expression: SdsExpression,
        substitutions: ParameterSubstitutions,
    ): EvaluatedCallable | undefined {
        const value = this.partialEvaluator.evaluate(expression, substitutions);
        if (value instanceof EvaluatedCallable) {
            return value;
        }

        let callableOrParameter = this.getCallableOrParameter(expression);

        if (!callableOrParameter || isSdsAnnotation(callableOrParameter) || isSdsCallableType(callableOrParameter)) {
            return undefined;
        } else if (isSdsParameter(callableOrParameter)) {
            // Parameter is set
            const substitution = substitutions.get(callableOrParameter);
            if (substitution) {
                if (substitution instanceof EvaluatedCallable) {
                    return substitution;
                } else {
                    /* c8 ignore next 2 */
                    return undefined;
                }
            }

            // Parameter is not set
            return new NamedCallable(callableOrParameter);
        } else if (isNamed(callableOrParameter)) {
            return new NamedCallable(callableOrParameter);
        } else if (isSdsBlockLambda(callableOrParameter)) {
            return new BlockLambdaClosure(callableOrParameter, substitutions);
        } else if (isSdsExpressionLambda(callableOrParameter)) {
            return new ExpressionLambdaClosure(callableOrParameter, substitutions);
        } else {
            /* c8 ignore next 2 */
            return undefined;
        }
    }

    private getCallableOrParameter(expression: SdsExpression): SdsCallable | SdsParameter | undefined {
        const type = this.typeComputer.computeType(expression);

        if (type instanceof CallableType) {
            return type.parameter ?? type.callable;
        } else if (type instanceof StaticType) {
            const declaration = type.instanceType.declaration;
            if (isSdsCallable(declaration)) {
                return declaration;
            }
        }

        return undefined;
    }

    private getNewSubstitutions(
        callable: EvaluatedCallable | undefined,
        args: SdsArgument[],
        substitutions: ParameterSubstitutions,
    ): ParameterSubstitutions {
        // TODO: Use this in the partial evaluator too. Here (maybe) filter and keep only the substitutions that are
        //  callables.
        if (!callable || isSdsParameter(callable.callable)) {
            return NO_SUBSTITUTIONS;
        }

        // Substitutions on creation
        const substitutionsOnCreation = callable.substitutionsOnCreation;

        // Substitutions on call via arguments
        const parameters = getParameters(callable.callable);
        const substitutionsOnCall = new Map(
            args.flatMap((it) => {
                // Ignore arguments that don't get assigned to a parameter
                const parameterIndex = this.nodeMapper.argumentToParameter(it)?.$containerIndex ?? -1;
                if (parameterIndex === -1) {
                    /* c8 ignore next 2 */
                    return [];
                }

                // argumentToParameter returns parameters of callable types. We have to remap this to parameter of the
                // actual callable.
                const parameter = parameters[parameterIndex];
                if (!parameter) {
                    /* c8 ignore next 2 */
                    return [];
                }

                const value = this.getEvaluatedCallable(it.value, substitutions);
                if (!value) {
                    // We still have to remember that a value was passed, so the default value is not used
                    return [[parameter, UnknownEvaluatedNode]];
                }

                return [[parameter, value]];
            }),
        );

        // Substitutions on call via default values
        let result = new Map([...substitutionsOnCreation, ...substitutionsOnCall]);
        for (const parameter of parameters) {
            if (!result.has(parameter) && parameter.defaultValue) {
                // Default values may depend on the values of previous parameters, so we have to evaluate them in order
                const value = this.getEvaluatedCallable(parameter.defaultValue, result);
                if (value) {
                    result = new Map([...result, [parameter, value]]);
                }
            }
        }

        return result;
    }

    /**
     * Returns all calls inside the given node. If the given node is a call, it is included as well.
     */
    getAllContainedCalls(node: AstNode | undefined): SdsCall[] {
        if (!node) {
            /* c8 ignore next 2 */
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
            /* c8 ignore next 2 */
            return !other.callable && substitutionsAreEqual(this.substitutions, other.substitutions);
        }

        return this.callable.equals(other.callable) && substitutionsAreEqual(this.substitutions, other.substitutions);
    }
}

const NO_SUBSTITUTIONS: ParameterSubstitutions = new Map();

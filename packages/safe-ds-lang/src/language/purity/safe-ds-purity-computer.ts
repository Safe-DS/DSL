import {
    type AstNode,
    type AstNodeLocator,
    EMPTY_STREAM,
    getContainerOfType,
    getDocument,
    Stream,
    WorkspaceCache,
} from 'langium';
import { isEmpty } from '../../helpers/collectionUtils.js';
import type { SafeDsCallGraphComputer } from '../flow/safe-ds-call-graph-computer.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import {
    FileRead,
    FileWrite,
    type ImpurityReason,
    OtherImpurityReason,
    PotentiallyImpureParameterCall,
} from './model.js';
import {
    isSdsFunction,
    isSdsLambda,
    SdsCall,
    SdsCallable,
    SdsExpression,
    SdsFunction,
    SdsParameter,
} from '../generated/ast.js';
import { EvaluatedEnumVariant, ParameterSubstitutions, StringConstant } from '../partialEvaluation/model.js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { SafeDsImpurityReasons } from '../builtins/safe-ds-enums.js';
import { getParameters } from '../helpers/nodeProperties.js';
import { isContainedInOrEqual } from '../helpers/astUtils.js';

export class SafeDsPurityComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly builtinImpurityReasons: SafeDsImpurityReasons;
    private readonly callGraphComputer: SafeDsCallGraphComputer;

    private readonly reasonsCache: WorkspaceCache<string, ImpurityReason[]>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.builtinAnnotations = services.builtins.Annotations;
        this.builtinImpurityReasons = services.builtins.ImpurityReasons;
        this.callGraphComputer = services.flow.CallGraphComputer;

        this.reasonsCache = new WorkspaceCache(services.shared);
    }

    // We need separate methods for callables and expressions because lambdas are both. The caller must decide whether
    // the lambda should get "executed" (***Callable methods) when computing the impurity reasons or not (***Expression
    // methods).

    /**
     * Returns whether the given callable is pure.
     *
     * @param node
     * The callable to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of a call, but the values of the parameters
     * of any containing callables, i.e. the context of the node.
     */
    isPureCallable(node: SdsCallable, substitutions = NO_SUBSTITUTIONS): boolean {
        return isEmpty(this.getImpurityReasonsForCallable(node, substitutions));
    }

    /**
     * Returns whether the given expression is pure.
     *
     * @param node
     * The expression to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of a call, but the values of the parameters
     * of any containing callables, i.e. the context of the node.
     */
    isPureExpression(node: SdsExpression, substitutions = NO_SUBSTITUTIONS): boolean {
        return isEmpty(this.getImpurityReasonsForExpression(node, substitutions));
    }

    /**
     * Returns whether the given callable has side effects.
     *
     * @param node
     * The callable to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of a call, but the values of the parameters
     * of any containing callables, i.e. the context of the node.
     */
    callableHasSideEffects(node: SdsCallable, substitutions = NO_SUBSTITUTIONS): boolean {
        return this.getImpurityReasonsForCallable(node, substitutions).some((it) => it.isSideEffect);
    }

    /**
     * Returns whether the given expression has side effects.
     *
     * @param node
     * The expression to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of a call, but the values of the parameters
     * of any containing callables, i.e. the context of the node.
     */
    expressionHasSideEffects(node: SdsExpression, substitutions = NO_SUBSTITUTIONS): boolean {
        return this.getImpurityReasonsForExpression(node, substitutions).some((it) => it.isSideEffect);
    }

    /**
     * Returns the reasons why the given callable is impure.
     *
     * @param node
     * The callable to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of a call, but the values of the parameters
     * of any containing callables, i.e. the context of the node.
     */
    getImpurityReasonsForCallable(node: SdsCallable, substitutions = NO_SUBSTITUTIONS): ImpurityReason[] {
        return this.getImpurityReasons(node, substitutions);
    }

    /**
     * Returns the reasons why the given expression is impure.
     *
     * @param node
     * The expression to check.
     *
     * @param substitutions
     * The parameter substitutions to use. These are **not** the argument of a call, but the values of the parameters
     * of any containing callables, i.e. the context of the node.
     */
    getImpurityReasonsForExpression(node: SdsExpression, substitutions = NO_SUBSTITUTIONS): ImpurityReason[] {
        return this.getExecutedCallsInExpression(node).flatMap((it) => this.getImpurityReasons(it, substitutions));
    }

    private getImpurityReasons(node: SdsCall | SdsCallable, substitutions = NO_SUBSTITUTIONS): ImpurityReason[] {
        const key = this.getNodeId(node);
        return this.reasonsCache.get(key, () => {
            return this.callGraphComputer
                .getCallGraph(node, substitutions)
                .streamCalledCallables()
                .flatMap((it) => {
                    if (isSdsFunction(it)) {
                        return this.getImpurityReasonsForFunction(it);
                    } else {
                        return EMPTY_STREAM;
                    }
                })
                .toArray();
        });
    }

    private getExecutedCallsInExpression(expression: SdsExpression): SdsCall[] {
        return this.callGraphComputer.getAllContainedCalls(expression).filter((it) => {
            // Keep only calls that are not contained in a lambda inside the expression
            const containingLambda = getContainerOfType(it, isSdsLambda);
            return !containingLambda || !isContainedInOrEqual(containingLambda, expression);
        });
    }

    private getImpurityReasonsForFunction(node: SdsFunction): Stream<ImpurityReason> {
        return this.builtinAnnotations.streamImpurityReasons(node).flatMap((it) => {
            switch (it.variant) {
                case this.builtinImpurityReasons.FileReadFromConstantPath:
                    return new FileRead(this.getPath(it));
                case this.builtinImpurityReasons.FileReadFromParameterizedPath:
                    return new FileRead(this.getParameter(node, it));
                case this.builtinImpurityReasons.FileWriteToConstantPath:
                    return new FileWrite(this.getPath(it));
                case this.builtinImpurityReasons.FileWriteToParameterizedPath:
                    return new FileWrite(this.getParameter(node, it));
                case this.builtinImpurityReasons.PotentiallyImpureParameterCall:
                    return new PotentiallyImpureParameterCall(this.getParameter(node, it));
                case this.builtinImpurityReasons.Other:
                    return OtherImpurityReason;
                default:
                    /* c8 ignore next */
                    return EMPTY_STREAM;
            }
        });
    }

    private getPath(variant: EvaluatedEnumVariant): string | undefined {
        const path = variant.getArgumentValueByName('path');
        if (path instanceof StringConstant) {
            return path.value;
        } else {
            return undefined;
        }
    }

    private getParameter(node: SdsFunction, variant: EvaluatedEnumVariant): SdsParameter | undefined {
        const parameterName = variant.getArgumentValueByName('parameterName');
        if (!(parameterName instanceof StringConstant)) {
            return undefined;
        }

        return getParameters(node).find((it) => it.name === parameterName.value);
    }

    private getNodeId(node: AstNode) {
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }
}

const NO_SUBSTITUTIONS: ParameterSubstitutions = new Map();

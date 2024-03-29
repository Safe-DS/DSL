import { AstNode, AstNodeLocator, AstUtils, WorkspaceCache } from 'langium';
import { isEmpty } from '../../helpers/collections.js';
import {
    isSdsArgument,
    isSdsAssignee,
    isSdsAssignment,
    isSdsBlockLambda,
    isSdsBoolean,
    isSdsCall,
    isSdsCallable,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnumVariant,
    isSdsExpression,
    isSdsExpressionLambda,
    isSdsFloat,
    isSdsFunction,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsInt,
    isSdsList,
    isSdsMap,
    isSdsMemberAccess,
    isSdsNull,
    isSdsParameter,
    isSdsParenthesizedExpression,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsResult,
    isSdsSegment,
    isSdsString,
    isSdsTemplateString,
    isSdsTemplateStringEnd,
    isSdsTemplateStringInner,
    isSdsTemplateStringStart,
    isSdsTypeCast,
    isSdsUnknown,
    type SdsArgument,
    type SdsAssignee,
    type SdsCall,
    type SdsCallable,
    type SdsDeclaration,
    type SdsExpression,
    type SdsIndexedAccess,
    type SdsInfixOperation,
    type SdsList,
    type SdsMap,
    type SdsMemberAccess,
    type SdsParameter,
    type SdsPrefixOperation,
    type SdsTemplateString,
} from '../generated/ast.js';
import { getAbstractResults, getArguments, getParameters } from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { SafeDsServices } from '../safe-ds-module.js';
import {
    BlockLambdaClosure,
    BooleanConstant,
    Constant,
    EvaluatedCallable,
    EvaluatedEnumVariant,
    EvaluatedList,
    EvaluatedMap,
    EvaluatedMapEntry,
    EvaluatedNamedTuple,
    EvaluatedNode,
    ExpressionLambdaClosure,
    FloatConstant,
    IntConstant,
    isConstant,
    NamedCallable,
    NullConstant,
    NumberConstant,
    ParameterSubstitutions,
    StringConstant,
    substitutionsAreEqual,
    UnknownEvaluatedNode,
} from './model.js';

export class SafeDsPartialEvaluator {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly nodeMapper: SafeDsNodeMapper;

    private readonly cache: WorkspaceCache<string, EvaluatedNode>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.nodeMapper = services.helpers.NodeMapper;

        this.cache = new WorkspaceCache(services.shared);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // evaluate
    // -----------------------------------------------------------------------------------------------------------------

    evaluate(node: AstNode | undefined, substitutions: ParameterSubstitutions = NO_SUBSTITUTIONS): EvaluatedNode {
        return this.evaluateWithRecursionCheck(node, substitutions, [])?.unwrap();
    }

    private evaluateWithRecursionCheck(
        node: AstNode | undefined,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        if (!node || visited.some((it) => visitedStatesAreEqual(it, [node, substitutions]))) {
            return UnknownEvaluatedNode;
        }

        // Remember that we have already visited this node
        const newVisited: VisitedState[] = [...visited, [node, substitutions]];

        // Try to evaluate the node without parameter substitutions and cache the result
        const resultWithoutSubstitutions = this.cache.get(this.getNodeId(node), () =>
            this.doEvaluateWithRecursionCheck(node, NO_SUBSTITUTIONS, newVisited),
        );
        if (resultWithoutSubstitutions.isFullyEvaluated || isEmpty(substitutions)) {
            return resultWithoutSubstitutions;
        } else {
            // Try again with parameter substitutions but don't cache the result
            return this.doEvaluateWithRecursionCheck(node, substitutions, newVisited);
        }
    }

    private getNodeId(node: AstNode) {
        const documentUri = AstUtils.getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }

    private doEvaluateWithRecursionCheck(
        node: AstNode | undefined,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        if (isSdsAssignee(node)) {
            return this.evaluateAssignee(node, substitutions, visited);
        } else if (isSdsDeclaration(node)) {
            return this.evaluateDeclaration(node, substitutions, visited);
        } else if (isSdsExpression(node)) {
            return this.evaluateExpression(node, substitutions, visited);
        } /* c8 ignore start */ else {
            return UnknownEvaluatedNode;
        } /* c8 ignore stop */
    }

    private evaluateAssignee(
        node: SdsAssignee,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        const containingAssignment = AstUtils.getContainerOfType(node, isSdsAssignment);
        if (!containingAssignment) {
            /* c8 ignore next 2 */
            return UnknownEvaluatedNode;
        }

        const evaluatedExpression = this.evaluateWithRecursionCheck(
            containingAssignment.expression,
            substitutions,
            visited,
        );
        const nodeIndex = node.$containerIndex ?? -1;
        if (evaluatedExpression instanceof EvaluatedNamedTuple) {
            return evaluatedExpression.getResultValueByIndex(nodeIndex);
        } else if (nodeIndex === 0) {
            return evaluatedExpression;
        } else {
            return UnknownEvaluatedNode;
        }
    }

    private evaluateDeclaration(
        node: SdsDeclaration,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        if (isSdsClass(node)) {
            return new NamedCallable(node);
        } else if (isSdsEnumVariant(node)) {
            return new EvaluatedEnumVariant(node, undefined);
        } else if (isSdsFunction(node)) {
            return new NamedCallable(node);
        } else if (isSdsParameter(node)) {
            return substitutions.get(node) ?? UnknownEvaluatedNode;
        } else if (isSdsResult(node)) {
            return this.evaluateWithRecursionCheck(this.nodeMapper.resultToYields(node).head(), substitutions, visited);
        } else if (isSdsSegment(node)) {
            return new NamedCallable(node);
        } else {
            return UnknownEvaluatedNode;
        }
    }
    private evaluateExpression(
        node: SdsExpression,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        // Base cases
        if (isSdsBoolean(node)) {
            return new BooleanConstant(node.value);
        } else if (isSdsFloat(node)) {
            return new FloatConstant(node.value);
        } else if (isSdsInt(node)) {
            return new IntConstant(node.value);
        } else if (isSdsNull(node)) {
            return NullConstant;
        } else if (isSdsString(node)) {
            return new StringConstant(node.value);
        } else if (isSdsTemplateStringStart(node)) {
            return new StringConstant(node.value);
        } else if (isSdsTemplateStringInner(node)) {
            return new StringConstant(node.value);
        } else if (isSdsTemplateStringEnd(node)) {
            return new StringConstant(node.value);
        } else if (isSdsUnknown(node)) {
            return UnknownEvaluatedNode;
        } else if (isSdsBlockLambda(node)) {
            return new BlockLambdaClosure(node, substitutions);
        } else if (isSdsExpressionLambda(node)) {
            return new ExpressionLambdaClosure(node, substitutions);
        }

        // Recursive cases
        else if (isSdsArgument(node)) {
            return this.evaluateWithRecursionCheck(node.value, substitutions, visited);
        } else if (isSdsCall(node)) {
            return this.evaluateCall(node, substitutions, visited);
        } else if (isSdsIndexedAccess(node)) {
            return this.evaluateIndexedAccess(node, substitutions, visited);
        } else if (isSdsInfixOperation(node)) {
            return this.evaluateInfixOperation(node, substitutions, visited);
        } else if (isSdsList(node)) {
            return this.evaluateList(node, substitutions, visited);
        } else if (isSdsMap(node)) {
            return this.evaluateMap(node, substitutions, visited);
        } else if (isSdsMemberAccess(node)) {
            return this.evaluateMemberAccess(node, substitutions, visited);
        } else if (isSdsParenthesizedExpression(node)) {
            return this.evaluateWithRecursionCheck(node.expression, substitutions, visited);
        } else if (isSdsPrefixOperation(node)) {
            return this.evaluatePrefixOperation(node, substitutions, visited);
        } else if (isSdsReference(node)) {
            return this.evaluateWithRecursionCheck(node.target.ref, substitutions, visited);
        } else if (isSdsTemplateString(node)) {
            return this.evaluateTemplateString(node, substitutions, visited);
        } else if (isSdsTypeCast(node)) {
            return this.evaluateWithRecursionCheck(node.expression, substitutions, visited);
        } /* c8 ignore start */ else {
            throw new Error(`Unexpected expression type: ${node.$type}`);
        } /* c8 ignore stop */
    }

    private evaluateInfixOperation(
        node: SdsInfixOperation,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        // Handle operators that can short-circuit
        const evaluatedLeft = this.evaluateWithRecursionCheck(node.leftOperand, substitutions, visited);
        if (evaluatedLeft === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        switch (node.operator) {
            case 'or':
                return this.evaluateOr(evaluatedLeft, node.rightOperand, substitutions, visited);
            case 'and':
                return this.evaluateAnd(evaluatedLeft, node.rightOperand, substitutions, visited);
            case '?:':
                return this.evaluateElvisOperator(evaluatedLeft, node.rightOperand, substitutions, visited);
        }

        // Handle other operators
        const evaluatedRight = this.evaluateWithRecursionCheck(node.rightOperand, substitutions, visited);
        if (evaluatedRight === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        switch (node.operator) {
            case '==':
            case '===':
                return new BooleanConstant(evaluatedLeft.equals(evaluatedRight));
            case '!=':
            case '!==':
                return new BooleanConstant(!evaluatedLeft.equals(evaluatedRight));
            case '<':
                return this.evaluateComparisonOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand < rightOperand,
                    evaluatedRight,
                );
            case '<=':
                return this.evaluateComparisonOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand <= rightOperand,
                    evaluatedRight,
                );
            case '>=':
                return this.evaluateComparisonOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand >= rightOperand,
                    evaluatedRight,
                );
            case '>':
                return this.evaluateComparisonOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand > rightOperand,
                    evaluatedRight,
                );
            case '+':
                return this.evaluateArithmeticOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand + rightOperand,
                    (leftOperand, rightOperand) => leftOperand + rightOperand,
                    evaluatedRight,
                );
            case '-':
                return this.evaluateArithmeticOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand - rightOperand,
                    (leftOperand, rightOperand) => leftOperand - rightOperand,
                    evaluatedRight,
                );
            case '*':
                return this.evaluateArithmeticOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand * rightOperand,
                    (leftOperand, rightOperand) => leftOperand * rightOperand,
                    evaluatedRight,
                );
            case '/':
                // Division by zero
                if (zeroConstants.some((it) => it.equals(evaluatedRight))) {
                    return UnknownEvaluatedNode;
                }

                return this.evaluateArithmeticOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand / rightOperand,
                    (leftOperand, rightOperand) => leftOperand / rightOperand,
                    evaluatedRight,
                );

            /* c8 ignore next 2 */
            default:
                throw new Error(`Unexpected operator: ${node.operator}`);
        }
    }

    private evaluateOr(
        evaluatedLeft: EvaluatedNode,
        rightOperand: SdsExpression,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        // Short-circuit
        if (evaluatedLeft.equals(trueConstant)) {
            return trueConstant;
        }

        // Compute the result if both operands are constant booleans
        const evaluatedRight = this.evaluateWithRecursionCheck(rightOperand, substitutions, visited);
        if (evaluatedLeft instanceof BooleanConstant && evaluatedRight instanceof BooleanConstant) {
            return new BooleanConstant(evaluatedLeft.value || evaluatedRight.value);
        }

        return UnknownEvaluatedNode;
    }

    private evaluateAnd(
        evaluatedLeft: EvaluatedNode,
        rightOperand: SdsExpression,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        // Short-circuit
        if (evaluatedLeft.equals(falseConstant)) {
            return falseConstant;
        }

        // Compute the result if both operands are constant booleans
        const evaluatedRight = this.evaluateWithRecursionCheck(rightOperand, substitutions, visited);
        if (evaluatedLeft instanceof BooleanConstant && evaluatedRight instanceof BooleanConstant) {
            return new BooleanConstant(evaluatedLeft.value && evaluatedRight.value);
        }

        return UnknownEvaluatedNode;
    }

    private evaluateElvisOperator(
        evaluatedLeft: EvaluatedNode,
        rightOperand: SdsExpression,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        // Short-circuit
        if (evaluatedLeft instanceof Constant && !evaluatedLeft.equals(NullConstant)) {
            return evaluatedLeft;
        }

        // Compute the result from both operands
        const evaluatedRight = this.evaluateWithRecursionCheck(rightOperand, substitutions, visited);
        if (evaluatedLeft.equals(NullConstant)) {
            return evaluatedRight;
        } else if (evaluatedRight === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        } else {
            return evaluatedLeft;
        }
    }

    private evaluateComparisonOp(
        leftOperand: EvaluatedNode,
        operation: (leftOperand: number | bigint, rightOperand: number | bigint) => boolean,
        rightOperand: EvaluatedNode,
    ): EvaluatedNode {
        if (leftOperand instanceof NumberConstant && rightOperand instanceof NumberConstant) {
            return new BooleanConstant(operation(leftOperand.value, rightOperand.value));
        }

        return UnknownEvaluatedNode;
    }

    private evaluateArithmeticOp(
        leftOperand: EvaluatedNode,
        intOperation: (leftOperand: bigint, rightOperand: bigint) => bigint,
        floatOperation: (leftOperand: number, rightOperand: number) => number,
        rightOperand: EvaluatedNode,
    ): EvaluatedNode {
        if (leftOperand instanceof IntConstant && rightOperand instanceof IntConstant) {
            return new IntConstant(intOperation(leftOperand.value, rightOperand.value));
        } else if (leftOperand instanceof NumberConstant && rightOperand instanceof NumberConstant) {
            return new FloatConstant(floatOperation(Number(leftOperand.value), Number(rightOperand.value)));
        }

        return UnknownEvaluatedNode;
    }

    private evaluateList(node: SdsList, substitutions: ParameterSubstitutions, visited: VisitedState[]): EvaluatedNode {
        return new EvaluatedList(
            node.elements.map((it) => this.evaluateWithRecursionCheck(it, substitutions, visited)),
        );
    }

    private evaluateMap(node: SdsMap, substitutions: ParameterSubstitutions, visited: VisitedState[]): EvaluatedNode {
        return new EvaluatedMap(
            node.entries.map((it) => {
                const key = this.evaluateWithRecursionCheck(it.key, substitutions, visited);
                const value = this.evaluateWithRecursionCheck(it.value, substitutions, visited);
                return new EvaluatedMapEntry(key, value);
            }),
        );
    }

    private evaluatePrefixOperation(
        node: SdsPrefixOperation,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        const evaluatedOperand = this.evaluateWithRecursionCheck(node.operand, substitutions, visited);
        if (evaluatedOperand === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        if (node.operator === 'not') {
            if (evaluatedOperand instanceof BooleanConstant) {
                return new BooleanConstant(!evaluatedOperand.value);
            }
        } else if (node.operator === '-') {
            if (evaluatedOperand instanceof FloatConstant) {
                return new FloatConstant(-evaluatedOperand.value);
            } else if (evaluatedOperand instanceof IntConstant) {
                return new IntConstant(-evaluatedOperand.value);
            }
        }

        return UnknownEvaluatedNode;
    }

    private evaluateTemplateString(
        node: SdsTemplateString,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        const expressions = node.expressions.map((it) => this.evaluateWithRecursionCheck(it, substitutions, visited));
        if (expressions.every(isConstant)) {
            return new StringConstant(expressions.map((it) => it.toInterpolationString()).join(''));
        }

        return UnknownEvaluatedNode;
    }

    private evaluateCall(node: SdsCall, substitutions: ParameterSubstitutions, visited: VisitedState[]): EvaluatedNode {
        const receiver = this.evaluateWithRecursionCheck(node.receiver, substitutions, visited).unwrap();
        const args = getArguments(node);

        if (receiver instanceof EvaluatedEnumVariant) {
            return this.evaluateEnumVariantCall(receiver, args, substitutions, visited);
        } else if (receiver instanceof EvaluatedCallable) {
            return this.evaluateCallableCall(
                receiver.callable,
                args,
                receiver.substitutionsOnCreation,
                substitutions,
                visited,
            );
        } else if (receiver.equals(NullConstant) && node.isNullSafe) {
            return NullConstant;
        }

        return UnknownEvaluatedNode;
    }

    private evaluateEnumVariantCall(
        receiver: EvaluatedEnumVariant,
        args: SdsArgument[],
        substitutions: Map<SdsParameter, EvaluatedNode>,
        visited: VisitedState[],
    ) {
        // The enum variant has already been instantiated
        if (receiver.hasBeenInstantiated) {
            return UnknownEvaluatedNode;
        }

        const parameterSubstitutionsAfterCall = this.getParameterSubstitutionsAfterCall(
            receiver.variant,
            args,
            NO_SUBSTITUTIONS,
            substitutions,
            visited,
        );

        return new EvaluatedEnumVariant(receiver.variant, parameterSubstitutionsAfterCall);
    }

    private evaluateCallableCall(
        callable: SdsCallable | SdsParameter,
        args: SdsArgument[],
        substitutionsOnCreation: ParameterSubstitutions,
        substitutionsOnCall: ParameterSubstitutions,
        visited: VisitedState[],
    ) {
        if (!isSdsCallable(callable)) {
            /* c8 ignore next 2 */
            return UnknownEvaluatedNode;
        }

        const parameterSubstitutionsAfterCall = this.getParameterSubstitutionsAfterCall(
            callable,
            args,
            substitutionsOnCreation,
            substitutionsOnCall,
            visited,
        );

        if (isSdsExpressionLambda(callable)) {
            return this.evaluateWithRecursionCheck(callable.result, parameterSubstitutionsAfterCall, visited);
        } else if (isSdsBlockLambda(callable) || isSdsSegment(callable)) {
            return new EvaluatedNamedTuple(
                new Map(
                    getAbstractResults(callable).map((it) => [
                        it,
                        this.evaluateWithRecursionCheck(it, parameterSubstitutionsAfterCall, visited),
                    ]),
                ),
            );
        } else {
            return UnknownEvaluatedNode;
        }
    }

    private getParameterSubstitutionsAfterCall(
        callable: SdsCallable | SdsParameter | undefined,
        args: SdsArgument[],
        substitutionsOnCreation: ParameterSubstitutions,
        substitutionsOnCall: ParameterSubstitutions,
        visited: VisitedState[],
    ): ParameterSubstitutions {
        if (!callable || isSdsParameter(callable)) {
            /* c8 ignore next 2 */
            return NO_SUBSTITUTIONS;
        }

        // Compute which parameters are set via arguments
        const parameters = getParameters(callable);
        const argumentsByParameter = this.nodeMapper.parametersToArguments(parameters, args);

        let result = substitutionsOnCreation;

        for (const parameter of parameters) {
            if (argumentsByParameter.has(parameter)) {
                // Substitutions on call via arguments
                const value = this.evaluateWithRecursionCheck(
                    argumentsByParameter.get(parameter),
                    substitutionsOnCall,
                    visited,
                );
                if (value !== UnknownEvaluatedNode) {
                    result = new Map([...result, [parameter, value]]);
                }
            } else if (parameter.defaultValue) {
                // Substitutions on call via default values
                const value = this.evaluateWithRecursionCheck(parameter.defaultValue, result, visited);
                if (value !== UnknownEvaluatedNode) {
                    result = new Map([...result, [parameter, value]]);
                }
            }
        }

        return result;
    }

    private evaluateIndexedAccess(
        node: SdsIndexedAccess,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        const receiver = this.evaluateWithRecursionCheck(node.receiver, substitutions, visited).unwrap();

        if (receiver instanceof EvaluatedList) {
            const index = this.evaluateWithRecursionCheck(node.index, substitutions, visited).unwrap();
            if (index instanceof IntConstant) {
                return receiver.getElementByIndex(Number(index.value));
            }
        } else if (receiver instanceof EvaluatedMap) {
            const key = this.evaluateWithRecursionCheck(node.index, substitutions, visited).unwrap();
            return receiver.getLastValueForKey(key);
        } else if (receiver.equals(NullConstant) && node.isNullSafe) {
            return NullConstant;
        }

        return UnknownEvaluatedNode;
    }

    private evaluateMemberAccess(
        node: SdsMemberAccess,
        substitutions: ParameterSubstitutions,
        visited: VisitedState[],
    ): EvaluatedNode {
        const member = node.member?.target?.ref;
        if (!member) {
            return UnknownEvaluatedNode;
        } else if (isSdsEnumVariant(member)) {
            return this.evaluateWithRecursionCheck(member, substitutions, visited);
        }

        const receiver = this.evaluateWithRecursionCheck(node.receiver, substitutions, visited);
        if (receiver instanceof EvaluatedEnumVariant) {
            return receiver.getParameterValueByName(member.name);
        } else if (receiver instanceof EvaluatedNamedTuple) {
            return receiver.getResultValueByName(member.name);
        } else if (receiver.equals(NullConstant) && node.isNullSafe) {
            return NullConstant;
        }

        return UnknownEvaluatedNode;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Parameter substitutions
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Returns the parameter substitutions for the given call.
     */
    computeParameterSubstitutionsForCall(
        call: SdsCall | undefined,
        substitutions: ParameterSubstitutions = NO_SUBSTITUTIONS,
    ): ParameterSubstitutions {
        const callable = this.nodeMapper.callToCallable(call);
        const args = getArguments(call);
        return this.getParameterSubstitutionsAfterCall(callable, args, NO_SUBSTITUTIONS, substitutions, []);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Checks
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Returns whether the given expression can be the value of a constant parameter.
     */
    canBeValueOfConstantParameter = (node: SdsExpression): boolean => {
        if (isSdsBoolean(node) || isSdsFloat(node) || isSdsInt(node) || isSdsNull(node) || isSdsString(node)) {
            return true;
        } else if (isSdsCall(node)) {
            // If some arguments are not provided, we already show an error.
            return (
                this.canBeValueOfConstantParameter(node.receiver) &&
                getArguments(node).every((it) => this.canBeValueOfConstantParameter(it.value))
            );
        } else if (isSdsList(node)) {
            return node.elements.every(this.canBeValueOfConstantParameter);
        } else if (isSdsMap(node)) {
            return node.entries.every(
                (it) => this.canBeValueOfConstantParameter(it.key) && this.canBeValueOfConstantParameter(it.value),
            );
        } else if (isSdsMemberAccess(node)) {
            // 1. We cannot allow all member accesses, since we might also access an attribute that has type 'Int', for
            //    example. Thus, type checking does not always show an error, even though we already restrict the
            //    possible types of constant parameters.
            // 2. If the member cannot be resolved, we already show an error.
            // 3. If the enum variant has parameters that are not provided, we already show an error.
            const member = node.member?.target?.ref;
            return !member || isSdsEnumVariant(member);
        } else if (isSdsPrefixOperation(node)) {
            return node.operator === '-' && this.canBeValueOfConstantParameter(node.operand);
        } else if (isSdsReference(node)) {
            // If the reference cannot be resolved, we already show an error.
            return !node.target.ref;
        } else {
            return false;
        }
    };
}

const NO_SUBSTITUTIONS: ParameterSubstitutions = new Map();
const falseConstant = new BooleanConstant(false);
const trueConstant = new BooleanConstant(true);
const zeroConstants = [new IntConstant(0n), new FloatConstant(0.0), new FloatConstant(-0.0)];

type VisitedState = [AstNode, ParameterSubstitutions];

const visitedStatesAreEqual = (a: VisitedState, b: VisitedState) => a[0] === b[0] && substitutionsAreEqual(a[1], b[1]);

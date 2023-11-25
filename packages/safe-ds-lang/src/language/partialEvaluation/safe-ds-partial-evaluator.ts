import { AstNode, AstNodeLocator, getContainerOfType, getDocument, WorkspaceCache } from 'langium';
import { isEmpty } from '../../helpers/collectionUtils.js';
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
    UnknownEvaluatedNode,
} from './model.js';
import { SafeDsPurityComputer } from '../purity/safe-ds-purity-computer.js';

export class SafeDsPartialEvaluator {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly purityComputer: () => SafeDsPurityComputer;

    private readonly cache: WorkspaceCache<string, EvaluatedNode>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.nodeMapper = services.helpers.NodeMapper;
        this.purityComputer = () => services.purity.PurityComputer;

        this.cache = new WorkspaceCache(services.shared);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // evaluate
    // -----------------------------------------------------------------------------------------------------------------

    evaluate(node: AstNode | undefined, substitutions: ParameterSubstitutions = NO_SUBSTITUTIONS): EvaluatedNode {
        return this.evaluateWithSubstitutions(node, substitutions)?.unwrap();
    }

    private evaluateWithSubstitutions(node: AstNode | undefined, substitutions: ParameterSubstitutions): EvaluatedNode {
        if (!node) {
            return UnknownEvaluatedNode;
        }

        // Try to evaluate the node without parameter substitutions and cache the result
        const resultWithoutSubstitutions = this.cache.get(this.getNodeId(node), () =>
            this.doEvaluateWithSubstitutions(node, NO_SUBSTITUTIONS),
        );
        if (resultWithoutSubstitutions.isFullyEvaluated || isEmpty(substitutions)) {
            return resultWithoutSubstitutions;
        } else {
            // Try again with parameter substitutions but don't cache the result
            return this.doEvaluateWithSubstitutions(node, substitutions);
        }
    }

    private getNodeId(node: AstNode) {
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }

    private doEvaluateWithSubstitutions(
        node: AstNode | undefined,
        substitutions: ParameterSubstitutions,
    ): EvaluatedNode {
        if (isSdsAssignee(node)) {
            return this.evaluateAssignee(node, substitutions);
        } else if (isSdsDeclaration(node)) {
            return this.evaluateDeclaration(node, substitutions);
        } else if (isSdsExpression(node)) {
            return this.evaluateExpression(node, substitutions);
        } /* c8 ignore start */ else {
            return UnknownEvaluatedNode;
        } /* c8 ignore stop */
    }

    private evaluateAssignee(node: SdsAssignee, substitutions: ParameterSubstitutions): EvaluatedNode {
        const containingAssignment = getContainerOfType(node, isSdsAssignment);
        if (!containingAssignment) {
            /* c8 ignore next 2 */
            return UnknownEvaluatedNode;
        }

        const evaluatedExpression = this.evaluateWithSubstitutions(containingAssignment.expression, substitutions);
        const nodeIndex = node.$containerIndex ?? -1;
        if (evaluatedExpression instanceof EvaluatedNamedTuple) {
            return evaluatedExpression.getResultValueByIndex(nodeIndex);
        } else if (nodeIndex === 0) {
            return evaluatedExpression;
        } else {
            return UnknownEvaluatedNode;
        }
    }

    private evaluateDeclaration(node: SdsDeclaration, substitutions: ParameterSubstitutions): EvaluatedNode {
        if (isSdsClass(node)) {
            // TODO test
            return new NamedCallable(node);
        } else if (isSdsEnumVariant(node)) {
            return new EvaluatedEnumVariant(node, undefined);
        } else if (isSdsFunction(node)) {
            // TODO test
            return new NamedCallable(node);
        } else if (isSdsParameter(node)) {
            return substitutions.get(node) ?? UnknownEvaluatedNode;
        } else if (isSdsResult(node)) {
            return this.evaluateWithSubstitutions(this.nodeMapper.resultToYields(node).head(), substitutions);
        } else if (isSdsSegment(node)) {
            return new NamedCallable(node);
        } else {
            return UnknownEvaluatedNode;
        }
    }
    private evaluateExpression(node: SdsExpression, substitutions: ParameterSubstitutions): EvaluatedNode {
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
        } else if (isSdsBlockLambda(node)) {
            return new BlockLambdaClosure(node, substitutions);
        } else if (isSdsExpressionLambda(node)) {
            return new ExpressionLambdaClosure(node, substitutions);
        }

        // Recursive cases
        else if (isSdsArgument(node)) {
            return this.evaluateWithSubstitutions(node.value, substitutions);
        } else if (isSdsCall(node)) {
            return this.evaluateCall(node, substitutions);
        } else if (isSdsIndexedAccess(node)) {
            return this.evaluateIndexedAccess(node, substitutions);
        } else if (isSdsInfixOperation(node)) {
            return this.evaluateInfixOperation(node, substitutions);
        } else if (isSdsList(node)) {
            return this.evaluateList(node, substitutions);
        } else if (isSdsMap(node)) {
            return this.evaluateMap(node, substitutions);
        } else if (isSdsMemberAccess(node)) {
            return this.evaluateMemberAccess(node, substitutions);
        } else if (isSdsParenthesizedExpression(node)) {
            return this.evaluateWithSubstitutions(node.expression, substitutions);
        } else if (isSdsPrefixOperation(node)) {
            return this.evaluatePrefixOperation(node, substitutions);
        } else if (isSdsReference(node)) {
            return this.evaluateWithSubstitutions(node.target.ref, substitutions);
        } else if (isSdsTemplateString(node)) {
            return this.evaluateTemplateString(node, substitutions);
        } /* c8 ignore start */ else {
            throw new Error(`Unexpected expression type: ${node.$type}`);
        } /* c8 ignore stop */
    }

    private evaluateInfixOperation(node: SdsInfixOperation, substitutions: ParameterSubstitutions): EvaluatedNode {
        // Handle operators that can short-circuit
        const evaluatedLeft = this.evaluateWithSubstitutions(node.leftOperand, substitutions);
        if (evaluatedLeft === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        switch (node.operator) {
            case 'or':
                return this.evaluateOr(evaluatedLeft, node.rightOperand, substitutions);
            case 'and':
                return this.evaluateAnd(evaluatedLeft, node.rightOperand, substitutions);
            case '?:':
                return this.evaluateElvisOperator(evaluatedLeft, node.rightOperand, substitutions);
        }

        // Handle other operators
        const evaluatedRight = this.evaluateWithSubstitutions(node.rightOperand, substitutions);
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
    ): EvaluatedNode {
        // Short-circuit if the left operand is true and the right operand has no side effects
        if (
            evaluatedLeft.equals(trueConstant) &&
            !this.purityComputer().expressionHasSideEffects(rightOperand, substitutions)
        ) {
            return trueConstant;
        }

        // Compute the result if both operands are constant booleans
        const evaluatedRight = this.evaluateWithSubstitutions(rightOperand, substitutions);
        if (evaluatedLeft instanceof BooleanConstant && evaluatedRight instanceof BooleanConstant) {
            return new BooleanConstant(evaluatedLeft.value || evaluatedRight.value);
        }

        return UnknownEvaluatedNode;
    }

    private evaluateAnd(
        evaluatedLeft: EvaluatedNode,
        rightOperand: SdsExpression,
        substitutions: ParameterSubstitutions,
    ): EvaluatedNode {
        // Short-circuit if the left operand is true and the right operand has no side effects
        if (
            evaluatedLeft.equals(falseConstant) &&
            !this.purityComputer().expressionHasSideEffects(rightOperand, substitutions)
        ) {
            return falseConstant;
        }

        // Compute the result if both operands are constant booleans
        const evaluatedRight = this.evaluateWithSubstitutions(rightOperand, substitutions);
        if (evaluatedLeft instanceof BooleanConstant && evaluatedRight instanceof BooleanConstant) {
            return new BooleanConstant(evaluatedLeft.value && evaluatedRight.value);
        }

        return UnknownEvaluatedNode;
    }

    private evaluateElvisOperator(
        evaluatedLeft: EvaluatedNode,
        rightOperand: SdsExpression,
        substitutions: ParameterSubstitutions,
    ): EvaluatedNode {
        // Short-circuit if the left operand is a non-null constant and the right operand has no side effects
        if (
            evaluatedLeft instanceof Constant &&
            !evaluatedLeft.equals(NullConstant) &&
            !this.purityComputer().expressionHasSideEffects(rightOperand, substitutions)
        ) {
            return evaluatedLeft;
        }

        // Compute the result from both operands
        const evaluatedRight = this.evaluateWithSubstitutions(rightOperand, substitutions);
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

    private evaluateList(node: SdsList, substitutions: ParameterSubstitutions): EvaluatedNode {
        return new EvaluatedList(node.elements.map((it) => this.evaluateWithSubstitutions(it, substitutions)));
    }

    private evaluateMap(node: SdsMap, substitutions: ParameterSubstitutions): EvaluatedNode {
        return new EvaluatedMap(
            node.entries.map((it) => {
                const key = this.evaluateWithSubstitutions(it.key, substitutions);
                const value = this.evaluateWithSubstitutions(it.value, substitutions);
                return new EvaluatedMapEntry(key, value);
            }),
        );
    }

    private evaluatePrefixOperation(node: SdsPrefixOperation, substitutions: ParameterSubstitutions): EvaluatedNode {
        const evaluatedOperand = this.evaluateWithSubstitutions(node.operand, substitutions);
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

    private evaluateTemplateString(node: SdsTemplateString, substitutions: ParameterSubstitutions): EvaluatedNode {
        const expressions = node.expressions.map((it) => this.evaluateWithSubstitutions(it, substitutions));
        if (expressions.every(isConstant)) {
            return new StringConstant(expressions.map((it) => it.toInterpolationString()).join(''));
        }

        return UnknownEvaluatedNode;
    }

    private evaluateCall(node: SdsCall, substitutions: ParameterSubstitutions): EvaluatedNode {
        const receiver = this.evaluateWithSubstitutions(node.receiver, substitutions).unwrap();
        const args = getArguments(node);

        if (receiver instanceof EvaluatedEnumVariant) {
            return this.evaluateEnumVariantCall(receiver, args, substitutions);
        } else if (receiver instanceof EvaluatedCallable) {
            return this.evaluateCallableCall(receiver.callable, args, receiver.substitutionsOnCreation, substitutions);
        }

        return UnknownEvaluatedNode;
    }

    private evaluateEnumVariantCall(
        receiver: EvaluatedEnumVariant,
        args: SdsArgument[],
        substitutions: Map<SdsParameter, EvaluatedNode>,
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
        );

        return new EvaluatedEnumVariant(receiver.variant, parameterSubstitutionsAfterCall);
    }

    private evaluateCallableCall(
        callable: SdsCallable | SdsParameter,
        args: SdsArgument[],
        substitutionsOnCreation: ParameterSubstitutions,
        substitutionsOnCall: ParameterSubstitutions,
    ) {
        if (!isSdsCallable(callable)) {
            return UnknownEvaluatedNode;
        }

        const parameterSubstitutionsAfterCall = this.getParameterSubstitutionsAfterCall(
            callable,
            args,
            substitutionsOnCreation,
            substitutionsOnCall,
        );

        if (isSdsClass(callable) || isSdsFunction(callable)) {
            return UnknownEvaluatedNode;
        } else if (isSdsExpressionLambda(callable)) {
            return this.evaluateWithSubstitutions(callable.result, parameterSubstitutionsAfterCall);
        } else {
            return new EvaluatedNamedTuple(
                new Map(
                    getAbstractResults(callable).map((it) => [
                        it,
                        this.evaluateWithSubstitutions(it, parameterSubstitutionsAfterCall),
                    ]),
                ),
            );
        }
    }

    getParameterSubstitutionsAfterCall(
        callable: SdsCallable | SdsParameter | undefined,
        args: SdsArgument[],
        substitutionsOnCreation: ParameterSubstitutions = NO_SUBSTITUTIONS,
        substitutionsOnCall: ParameterSubstitutions = NO_SUBSTITUTIONS,
    ): ParameterSubstitutions {
        if (!callable || isSdsParameter(callable)) {
            return NO_SUBSTITUTIONS;
        }

        // Compute which parameters are set via arguments
        const parameters = getParameters(callable);
        const argumentsByParameter = this.mapParametersToArguments(parameters, args);

        let result: [SdsParameter, EvaluatedNode][] = [...substitutionsOnCreation];

        for (const parameter of parameters) {
            if (argumentsByParameter.has(parameter)) {
                // Substitutions on call via arguments
                const value = this.evaluateWithSubstitutions(argumentsByParameter.get(parameter), substitutionsOnCall);
                if (value !== UnknownEvaluatedNode) {
                    result = [...result, [parameter, value]];
                }
            } else if (parameter.defaultValue) {
                // Substitutions on call via default values
                const value = this.evaluateWithSubstitutions(parameter.defaultValue, substitutionsOnCall);
                if (value !== UnknownEvaluatedNode) {
                    result = [...result, [parameter, value]];
                }
            }
        }

        return new Map(result);
    }

    private mapParametersToArguments(parameters: SdsParameter[], args: SdsArgument[]): Map<SdsParameter, SdsArgument> {
        const result = new Map<SdsParameter, SdsArgument>();

        for (const argument of args) {
            const parameterIndex = this.nodeMapper.argumentToParameter(argument)?.$containerIndex ?? -1;
            if (parameterIndex === -1) {
                // TODO: test (unresolved argument)
                continue;
            }

            // argumentToParameter returns parameters of callable types. We have to remap this to parameter of the
            // actual callable.
            const parameter = parameters[parameterIndex];
            if (!parameter) {
                // TODO: test (callable type has more parameters than the actual callable)
                continue;
            }

            // The first occurrence wins
            // TODO: test (pass multiple arguments for the same parameter)
            if (!result.has(parameter)) {
                result.set(parameter, argument);
            }
        }

        return result;
    }

    private evaluateIndexedAccess(node: SdsIndexedAccess, substitutions: ParameterSubstitutions): EvaluatedNode {
        const receiver = this.evaluateWithSubstitutions(node.receiver, substitutions).unwrap();

        if (receiver instanceof EvaluatedList) {
            const index = this.evaluateWithSubstitutions(node.index, substitutions).unwrap();
            if (index instanceof IntConstant) {
                return receiver.getElementByIndex(Number(index.value));
            }
        } else if (receiver instanceof EvaluatedMap) {
            const key = this.evaluateWithSubstitutions(node.index, substitutions).unwrap();
            return receiver.getLastValueForKey(key);
        }

        return UnknownEvaluatedNode;
    }

    private evaluateMemberAccess(node: SdsMemberAccess, substitutions: ParameterSubstitutions): EvaluatedNode {
        const member = node.member?.target?.ref;
        if (!member) {
            return UnknownEvaluatedNode;
        } else if (isSdsEnumVariant(member)) {
            return this.evaluateWithSubstitutions(member, substitutions);
        }

        const receiver = this.evaluateWithSubstitutions(node.receiver, substitutions);
        if (receiver instanceof EvaluatedEnumVariant) {
            return receiver.getParameterValueByName(member.name);
        } else if (receiver instanceof EvaluatedNamedTuple) {
            return receiver.getResultValueByName(member.name);
        }

        return UnknownEvaluatedNode;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // canBeValueOfConstantParameter
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

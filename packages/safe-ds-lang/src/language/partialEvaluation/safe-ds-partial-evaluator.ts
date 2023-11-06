import { AstNode, AstNodeLocator, getDocument, WorkspaceCache } from 'langium';
import { isEmpty } from '../../helpers/collectionUtils.js';
import {
    isSdsArgument,
    isSdsBlockLambda,
    isSdsBoolean,
    isSdsCall,
    isSdsEnumVariant,
    isSdsExpression,
    isSdsExpressionLambda,
    isSdsFloat,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsInt,
    isSdsList,
    isSdsMap,
    isSdsMemberAccess,
    isSdsNull,
    isSdsParenthesizedExpression,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsSegment,
    isSdsString,
    isSdsTemplateString,
    isSdsTemplateStringEnd,
    isSdsTemplateStringInner,
    isSdsTemplateStringStart,
    SdsCall,
    SdsExpression,
    SdsIndexedAccess,
    SdsInfixOperation,
    SdsList,
    SdsMap,
    SdsMemberAccess,
    SdsPrefixOperation,
    SdsReference,
    SdsTemplateString,
} from '../generated/ast.js';
import { getArguments, getParameters } from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { SafeDsServices } from '../safe-ds-module.js';
import {
    BlockLambdaClosure,
    BooleanConstant,
    EvaluatedEnumVariant,
    EvaluatedList,
    EvaluatedMap,
    EvaluatedMapEntry,
    EvaluatedNode,
    ExpressionLambdaClosure,
    FloatConstant,
    IntConstant,
    isConstant,
    NullConstant,
    NumberConstant,
    ParameterSubstitutions,
    SegmentClosure,
    StringConstant,
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

    evaluate(node: AstNode | undefined): EvaluatedNode {
        return this.evaluateWithSubstitutions(node, NO_SUBSTITUTIONS)?.unwrap();
    }

    private evaluateWithSubstitutions(node: AstNode | undefined, substitutions: ParameterSubstitutions): EvaluatedNode {
        if (!node) {
            return UnknownEvaluatedNode;
        }

        // Try to evaluate the node without parameter substitutions and cache the result
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        const resultWithoutSubstitutions = this.cache.get(key, () =>
            this.doEvaluateWithSubstitutions(node, NO_SUBSTITUTIONS),
        );
        if (resultWithoutSubstitutions.isFullyEvaluated || isEmpty(substitutions)) {
            return resultWithoutSubstitutions;
        } /* c8 ignore start */ else {
            // Try again with parameter substitutions but don't cache the result
            return this.doEvaluateWithSubstitutions(node, substitutions);
        } /* c8 ignore stop */
    }

    private doEvaluateWithSubstitutions(
        node: AstNode | undefined,
        substitutions: ParameterSubstitutions,
    ): EvaluatedNode {
        if (isSdsExpression(node)) {
            return this.evaluateExpression(node, substitutions);
        } else if (isSdsSegment(node)) {
            return new SegmentClosure(node);
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
            return this.evaluateReference(node, substitutions);
        } else if (isSdsTemplateString(node)) {
            return this.evaluateTemplateString(node, substitutions);
        } /* c8 ignore start */ else {
            throw new Error(`Unexpected expression type: ${node.$type}`);
        } /* c8 ignore stop */
    }

    private evaluateInfixOperation(node: SdsInfixOperation, substitutions: ParameterSubstitutions): EvaluatedNode {
        // By design none of the operators are short-circuited
        const evaluatedLeft = this.evaluateWithSubstitutions(node.leftOperand, substitutions);
        if (evaluatedLeft === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        const evaluatedRight = this.evaluateWithSubstitutions(node.rightOperand, substitutions);
        if (evaluatedRight === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        switch (node.operator) {
            case 'or':
                return this.evaluateLogicalOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand || rightOperand,
                    evaluatedRight,
                );
            case 'and':
                return this.evaluateLogicalOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand && rightOperand,
                    evaluatedRight,
                );
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
                if (zeroes.some((it) => it.equals(evaluatedRight))) {
                    return UnknownEvaluatedNode;
                }

                return this.evaluateArithmeticOp(
                    evaluatedLeft,
                    (leftOperand, rightOperand) => leftOperand / rightOperand,
                    (leftOperand, rightOperand) => leftOperand / rightOperand,
                    evaluatedRight,
                );
            case '?:':
                if (evaluatedLeft === NullConstant) {
                    return evaluatedRight;
                } else {
                    return evaluatedLeft;
                }

            /* c8 ignore next 2 */
            default:
                throw new Error(`Unexpected operator: ${node.operator}`);
        }
    }

    private evaluateLogicalOp(
        leftOperand: EvaluatedNode,
        operation: (leftOperand: boolean, rightOperand: boolean) => boolean,
        rightOperand: EvaluatedNode,
    ): EvaluatedNode {
        if (leftOperand instanceof BooleanConstant && rightOperand instanceof BooleanConstant) {
            return new BooleanConstant(operation(leftOperand.value, rightOperand.value));
        }

        return UnknownEvaluatedNode;
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
        // TODO: if any entry has side effects, return UnknownEvaluatedNode
        return new EvaluatedList(node.elements.map((it) => this.evaluateWithSubstitutions(it, substitutions)));
    }

    private evaluateMap(node: SdsMap, substitutions: ParameterSubstitutions): EvaluatedNode {
        // TODO: if any entry has side effects, return UnknownEvaluatedNode
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

        if (receiver instanceof EvaluatedEnumVariant) {
            // The enum variant has already been instantiated
            if (receiver.hasBeenInstantiated) {
                return UnknownEvaluatedNode;
            }

            // Store default values for all parameters
            const args = new Map(
                getParameters(receiver.variant).map((it) => {
                    // TODO We may refer to other parameters in the default value, so we must pass substitutions
                    return [it, this.evaluateWithSubstitutions(it.defaultValue, NO_SUBSTITUTIONS)];
                }),
            );

            // Override default values with the actual arguments
            // TODO: If any argument has side effects, return UnknownEvaluatedNode
            getArguments(node).forEach((it) => {
                const parameter = this.nodeMapper.argumentToParameter(it);
                if (parameter && args.has(parameter)) {
                    args.set(parameter, this.evaluateWithSubstitutions(it.value, substitutions));
                }
            });

            return new EvaluatedEnumVariant(receiver.variant, args);
        }

        //     val simpleReceiver = evaluateReceiver(substitutions) ?: return undefined
        //     val newSubstitutions = buildNewSubstitutions(simpleReceiver, substitutions)
        //     // TODO Also check whether the callable has side effects
        //     return when (simpleReceiver) {
        //     is SdsIntermediateBlockLambda -> {
        //         SdsIntermediateRecord(
        //             simpleReceiver.results.map {
        //             it to it.evaluateAssignee(newSubstitutions)
        //         }
        //     )
        //     }
        //     is SdsIntermediateExpressionLambda -> simpleReceiver.result.evaluate(newSubstitutions)
        //     is SdsIntermediateStep -> {
        //         SdsIntermediateRecord(
        //             simpleReceiver.results.map {
        //             it to it.uniqueYieldOrNull()?.evaluateAssignee(newSubstitutions)
        //         }
        //     )
        //     }
        // }
        return UnknownEvaluatedNode;
    }

    // private fun SdsCall.buildNewSubstitutions(
    //     simpleReceiver: SdsIntermediateCallable,
    //     oldSubstitutions: ParameterSubstitutions
    // ): ParameterSubstitutions {
    //
    //     val substitutionsOnCreation = when (simpleReceiver) {
    //         is SdsIntermediateBlockLambda -> simpleReceiver.substitutionsOnCreation
    //         is SdsIntermediateExpressionLambda -> simpleReceiver.substitutionsOnCreation
    //     else -> emptyMap()
    //     }
    //
    //     val substitutionsOnCall = argumentsOrEmpty()
    //         .groupBy { it.parameterOrNull() }
    // .mapValues { (parameter, arguments) ->
    //         when {
    //         parameter == undefined -> undefined
    //         parameter.isVariadic -> SdsIntermediateVariadicArguments(
    //             arguments.map { it.evaluate(oldSubstitutions) }
    //     )
    //     else -> arguments.uniqueOrNull()?.evaluate(oldSubstitutions)
    //     }
    //     }
    //
    //     return buildMap {
    //         putAll(substitutionsOnCreation)
    //         substitutionsOnCall.entries.forEach { (parameter, argument) ->
    //             if (parameter != undefined) {
    //                 put(parameter, argument)
    //             }
    //         }
    //     }
    // }

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

    private evaluateMemberAccess(node: SdsMemberAccess, _substitutions: ParameterSubstitutions): EvaluatedNode {
        const member = node.member?.target?.ref;
        if (isSdsEnumVariant(member)) {
            return new EvaluatedEnumVariant(member, undefined);
        }

        // return when (val simpleReceiver = receiver.evaluate(substitutions)) {
        //     SdsConstantNull -> when {
        //         isNullSafe -> SdsConstantNull
        //     else -> undefined
        //     }
        //     is SdsIntermediateRecord -> simpleReceiver.getSubstitutionByReferenceOrNull(member)
        // else -> undefined
        // }
        return UnknownEvaluatedNode;
    }

    private evaluateReference(_node: SdsReference, _substitutions: ParameterSubstitutions): EvaluatedNode {
        // TODO: always call evaluateWithSubstitutions so caching works
        // const target = node.target.ref;

        //     is SdsPlaceholder -> declaration.evaluateAssignee(substitutions)
        //     is SdsParameter -> declaration.evaluateParameter(substitutions)
        // else -> undefined
        // }
        return UnknownEvaluatedNode;
    }

    // private fun SdsAbstractAssignee.evaluateAssignee(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    //     val simpleFullAssignedExpression = closestAncestorOrNull<SdsAssignment>()
    //         ?.expression
    //         ?.evaluate(substitutions)
    //         ?: return undefined
    //
    //     return when (simpleFullAssignedExpression) {
    //     is SdsIntermediateRecord -> simpleFullAssignedExpression.getSubstitutionByIndexOrNull(indexOrNull())
    //     else -> when {
    //     indexOrNull() == 0 -> simpleFullAssignedExpression
    // else -> undefined
    // }
    // }
    // }
    //
    // private fun SdsParameter.evaluateParameter(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    //     return when {
    //     this in substitutions -> substitutions[this]
    //     isOptional() -> defaultValue?.evaluate(substitutions)
    // else -> undefined
    // }
    // }
}

const NO_SUBSTITUTIONS: ParameterSubstitutions = new Map();
const zeroes = [new IntConstant(0n), new FloatConstant(0.0), new FloatConstant(-0.0)];

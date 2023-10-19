import { SafeDsServices } from '../safe-ds-module.js';
import { AstNode, AstNodeLocator, getDocument, WorkspaceCache } from 'langium';
import {
    BooleanConstant,
    EvaluatedEnumVariant,
    EvaluatedList,
    EvaluatedMap,
    EvaluatedMapEntry,
    EvaluatedNode,
    FloatConstant,
    IntConstant,
    isConstant,
    NullConstant,
    ParameterSubstitutions,
    StringConstant,
    UnknownEvaluatedNode,
} from './model.js';
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
    isSdsString,
    isSdsTemplateString,
    isSdsTemplateStringEnd,
    isSdsTemplateStringInner,
    isSdsTemplateStringStart,
    SdsBlockLambda,
    SdsCall,
    SdsExpression,
    SdsExpressionLambda,
    SdsIndexedAccess,
    SdsInfixOperation,
    SdsList,
    SdsMap,
    SdsMemberAccess,
    SdsPrefixOperation,
    SdsReference,
    SdsTemplateString,
} from '../generated/ast.js';
import { isEmpty } from 'radash';
import { argumentsOrEmpty, parametersOrEmpty } from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';

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
        return this.cachedDoEvaluate(node, NO_SUBSTITUTIONS)?.unwrap();
    }

    private cachedDoEvaluate(node: AstNode | undefined, substitutions: ParameterSubstitutions): EvaluatedNode {
        // Only expressions can be evaluated at the moment
        if (!isSdsExpression(node)) {
            return UnknownEvaluatedNode;
        }

        // Try to evaluate the node without parameter substitutions and cache the result
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        const resultWithoutSubstitutions = this.cache.get(key, () => this.doEvaluate(node, NO_SUBSTITUTIONS));
        if (resultWithoutSubstitutions.isFullyEvaluated || isEmpty(substitutions)) {
            return resultWithoutSubstitutions;
        }

        // Try again with parameter substitutions but don't cache the result
        return this.doEvaluate(node, substitutions);
    }

    private doEvaluate(node: SdsExpression, substitutions: ParameterSubstitutions): EvaluatedNode {
        // Base cases
        if (isSdsBoolean(node)) {
            return new BooleanConstant(node.value);
        } else if (isSdsFloat(node)) {
            return new FloatConstant(node.value);
        } else if (isSdsInt(node)) {
            return new IntConstant(BigInt(node.value));
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
            return this.evaluateBlockLambda(node, substitutions);
        } else if (isSdsExpressionLambda(node)) {
            return this.evaluateExpressionLambda(node, substitutions);
        }

        // Recursive cases
        else if (isSdsArgument(node)) {
            return this.cachedDoEvaluate(node.value, substitutions);
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
            return this.cachedDoEvaluate(node.expression, substitutions);
        } else if (isSdsPrefixOperation(node)) {
            return this.evaluatePrefixOperation(node, substitutions);
        } else if (isSdsReference(node)) {
            return this.evaluateReference(node, substitutions);
        } else if (isSdsTemplateString(node)) {
            return this.evaluateTemplateString(node, substitutions);
        }

        /* c8 ignore next */
        return UnknownEvaluatedNode;
    }

    evaluateBlockLambda(_node: SdsBlockLambda, _substitutions: ParameterSubstitutions): EvaluatedNode {
        //     return when {
        //     callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateBlockLambda(
        //     parameters = parametersOrEmpty(),
        //     results = blockLambdaResultsOrEmpty(),
        //     substitutionsOnCreation = substitutions
        // )
        // else -> undefined
        // }
        return UnknownEvaluatedNode;
    }

    evaluateExpressionLambda(_node: SdsExpressionLambda, _substitutions: ParameterSubstitutions): EvaluatedNode {
        //     return when {
        //     callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateExpressionLambda(
        //     parameters = parametersOrEmpty(),
        //     result = result,
        //     substitutionsOnCreation = substitutions
        // )
        // else -> undefined
        // }
        return UnknownEvaluatedNode;
    }

    evaluateInfixOperation(node: SdsInfixOperation, substitutions: ParameterSubstitutions): EvaluatedNode {
        // By design none of the operators are short-circuited
        const constantLeft = this.cachedDoEvaluate(node.leftOperand, substitutions);
        if (constantLeft === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        const constantRight = this.cachedDoEvaluate(node.rightOperand, substitutions);
        if (constantRight === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        //     return when (operator()) {
        //     Or -> evaluateLogicalOp(constantLeft, Boolean::or, constantRight)
        // And -> evaluateLogicalOp(constantLeft, Boolean::and, constantRight)
        // Equals -> SdsConstantBoolean(constantLeft == constantRight)
        // NotEquals -> SdsConstantBoolean(constantLeft != constantRight)
        // IdenticalTo -> SdsConstantBoolean(constantLeft == constantRight)
        // NotIdenticalTo -> SdsConstantBoolean(constantLeft != constantRight)
        // LessThan -> evaluateComparisonOp(
        //     constantLeft,
        //     { a, b -> a < b },
        // { a, b -> a < b },
        // constantRight
        // )
        // LessThanOrEquals -> evaluateComparisonOp(
        //     constantLeft,
        //     { a, b -> a <= b },
        // { a, b -> a <= b },
        // constantRight
        // )
        // GreaterThanOrEquals -> evaluateComparisonOp(
        //     constantLeft,
        //     { a, b -> a >= b },
        // { a, b -> a >= b },
        // constantRight
        // )
        // GreaterThan -> evaluateComparisonOp(
        //     constantLeft,
        //     { a, b -> a > b },
        // { a, b -> a > b },
        // constantRight
        // )
        // Plus -> evaluateArithmeticOp(
        //     constantLeft,
        //     { a, b -> a + b },
        // { a, b -> a + b },
        // constantRight
        // )
        // InfixMinus -> evaluateArithmeticOp(
        //     constantLeft,
        //     { a, b -> a - b },
        // { a, b -> a - b },
        // constantRight
        // )
        // Times -> evaluateArithmeticOp(
        //     constantLeft,
        //     { a, b -> a * b },
        // { a, b -> a * b },
        // constantRight
        // )
        // By -> {
        //     if (constantRight == SdsConstantFloat(0.0) || constantRight == SdsConstantInt(0)) {
        //         return undefined
        //     }
        //
        //     evaluateArithmeticOp(
        //         constantLeft,
        //         { a, b -> a / b },
        //     { a, b -> a / b },
        //     constantRight
        // )
        // }
        // Elvis -> when (constantLeft) {
        //     SdsConstantNull -> constantRight
        // else -> constantLeft
        // }
        // }
        return UnknownEvaluatedNode;
    }

    // private fun evaluateLogicalOp(
    //     leftOperand: SdsConstantExpression,
    //     operation: (Boolean, Boolean) -> Boolean,
    //     rightOperand: SdsConstantExpression,
    // ): SdsConstantExpression? {
    //
    //     return when {
    //     leftOperand is SdsConstantBoolean && rightOperand is SdsConstantBoolean -> {
    //     SdsConstantBoolean(operation(leftOperand.value, rightOperand.value))
    // }
    // else -> undefined
    // }
    // }
    //
    // private fun evaluateComparisonOp(
    //     leftOperand: SdsConstantExpression,
    //     doubleOperation: (Double, Double) -> Boolean,
    //     intOperation: (Int, Int) -> Boolean,
    //     rightOperand: SdsConstantExpression,
    // ): SdsConstantExpression? {
    //
    //     return when {
    //     leftOperand is SdsConstantInt && rightOperand is SdsConstantInt -> {
    //     SdsConstantBoolean(intOperation(leftOperand.value, rightOperand.value))
    // }
    // leftOperand is SdsConstantNumber && rightOperand is SdsConstantNumber -> {
    //     SdsConstantBoolean(doubleOperation(leftOperand.value.toDouble(), rightOperand.value.toDouble()))
    // }
    // else -> undefined
    // }
    // }
    //
    // private fun evaluateArithmeticOp(
    //     leftOperand: SdsConstantExpression,
    //     doubleOperation: (Double, Double) -> Double,
    //     intOperation: (Int, Int) -> Int,
    //     rightOperand: SdsConstantExpression,
    // ): SdsConstantExpression? {
    //
    //     return when {
    //     leftOperand is SdsConstantInt && rightOperand is SdsConstantInt -> {
    //     SdsConstantInt(intOperation(leftOperand.value, rightOperand.value))
    // }
    // leftOperand is SdsConstantNumber && rightOperand is SdsConstantNumber -> {
    //     SdsConstantFloat(doubleOperation(leftOperand.value.toDouble(), rightOperand.value.toDouble()))
    // }
    // else -> undefined
    // }
    // }

    evaluateList(node: SdsList, substitutions: ParameterSubstitutions): EvaluatedNode {
        return new EvaluatedList(node.elements.map((it) => this.cachedDoEvaluate(it, substitutions)));
    }

    evaluateMap(node: SdsMap, substitutions: ParameterSubstitutions): EvaluatedNode {
        return new EvaluatedMap(
            node.entries.map((it) => {
                const key = this.cachedDoEvaluate(it.key, substitutions);
                const value = this.cachedDoEvaluate(it.value, substitutions);
                return new EvaluatedMapEntry(key, value);
            }),
        );
    }

    evaluatePrefixOperation(node: SdsPrefixOperation, substitutions: ParameterSubstitutions): EvaluatedNode {
        const constantOperand = this.cachedDoEvaluate(node.operand, substitutions);
        if (constantOperand === UnknownEvaluatedNode) {
            return UnknownEvaluatedNode;
        }

        if (node.operator === 'not') {
            if (constantOperand instanceof BooleanConstant) {
                return new BooleanConstant(!constantOperand.value);
            }
        } else if (node.operator === '-') {
            if (constantOperand instanceof FloatConstant) {
                return new FloatConstant(-constantOperand.value);
            } else if (constantOperand instanceof IntConstant) {
                return new IntConstant(-constantOperand.value);
            }
        }

        return UnknownEvaluatedNode;
    }

    evaluateTemplateString(node: SdsTemplateString, substitutions: ParameterSubstitutions): EvaluatedNode {
        const expressions = node.expressions.map((it) => this.cachedDoEvaluate(it, substitutions));
        if (expressions.every(isConstant)) {
            return new StringConstant(expressions.map((it) => it.toInterpolationString()).join(''));
        }

        return UnknownEvaluatedNode;
    }

    evaluateCall(node: SdsCall, substitutions: ParameterSubstitutions): EvaluatedNode {
        const receiver = this.cachedDoEvaluate(node.receiver, substitutions).unwrap();

        if (receiver instanceof EvaluatedEnumVariant) {
            // The enum variant has already been instantiated
            if (receiver.hasBeenInstantiated) {
                return UnknownEvaluatedNode;
            }

            // Store default values for all parameters
            const args = new Map(
                parametersOrEmpty(receiver.variant).map((it) => {
                    return [it, this.cachedDoEvaluate(it.defaultValue, NO_SUBSTITUTIONS)];
                }),
            );

            // Override default values with the actual arguments
            argumentsOrEmpty(node).forEach((it) => {
                const parameter = this.nodeMapper.argumentToParameterOrUndefined(it);
                if (parameter && args.has(parameter)) {
                    args.set(parameter, this.cachedDoEvaluate(it.value, substitutions));
                }
            });

            return new EvaluatedEnumVariant(receiver.variant, args);
        }

        //     val simpleReceiver = evaluateReceiver(substitutions) ?: return undefined
        //     val newSubstitutions = buildNewSubstitutions(simpleReceiver, substitutions)
        //
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

    evaluateIndexedAccess(_node: SdsIndexedAccess, _substitutions: ParameterSubstitutions): EvaluatedNode {
        //         val simpleReceiver = receiver.evaluate(substitutions) as? SdsIntermediateVariadicArguments ?: return undefined
        //         val simpleIndex = index.evaluate(substitutions) as? SdsConstantInt ?: return undefined
        //
        //         return simpleReceiver.getArgumentByIndexOrNull(simpleIndex.value)
        //     }
        return UnknownEvaluatedNode;
    }

    evaluateMemberAccess(node: SdsMemberAccess, _substitutions: ParameterSubstitutions): EvaluatedNode {
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

    evaluateReference(node: SdsReference, _substitutions: ParameterSubstitutions): EvaluatedNode {
        // const target = node.target.ref;

        //     is SdsPlaceholder -> declaration.evaluateAssignee(substitutions)
        //     is SdsParameter -> declaration.evaluateParameter(substitutions)
        //     is SdsStep -> declaration.evaluateStep()
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
    //
    // private fun SdsStep.evaluateStep(): SdsIntermediateStep? {
    //     return when {
    //     callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateStep(
    //     parameters = parametersOrEmpty(),
    //     results = resultsOrEmpty()
    // )
    // else -> undefined
    // }
    // }
}

const NO_SUBSTITUTIONS: ParameterSubstitutions = new Map();

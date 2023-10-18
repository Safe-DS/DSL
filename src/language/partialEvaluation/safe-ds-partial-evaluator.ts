import { SafeDsServices } from '../safe-ds-module.js';
import { AstNode, AstNodeLocator, getDocument, WorkspaceCache } from 'langium';
import {
    ConstantBoolean,
    ConstantExpression,
    ConstantFloat,
    ConstantInt,
    ConstantList,
    ConstantMap,
    ConstantNull,
    ConstantString, isConstantExpression,
    ParameterSubstitutions,
    PartialEvaluationResult,
} from './model.js';
import {
    isSdsArgument,
    isSdsBlockLambda,
    isSdsBoolean,
    isSdsCall,
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

export class SafeDsPartialEvaluator {
    private astNodeLocator: AstNodeLocator;

    private cache: WorkspaceCache<string, PartialEvaluationResult>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;

        this.cache = new WorkspaceCache(services.shared);
    }

    evaluate(node: AstNode | undefined): PartialEvaluationResult {
        if (!node) {
            return undefined;
        }

        return this.cachedDoEvaluate(node, new Map())?.unwrap();
    }

    private cachedDoEvaluate(node: AstNode, substitutions: ParameterSubstitutions): PartialEvaluationResult {
        // Try to evaluate the node without parameter substitutions and cache the result
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        const resultWithoutSubstitutions = this.cache.get(key, () => this.doEvaluate(node, new Map()));
        // A constant expression cannot be simplified further. Ditto, if the parameter substitutions are empty.
        if (resultWithoutSubstitutions?.unwrap() instanceof ConstantExpression || isEmpty(substitutions)) {
            return resultWithoutSubstitutions;
        }

        // Try again with parameter substitutions but don't cache the result
        return this.doEvaluate(node, substitutions);
    }

    private doEvaluate(node: AstNode, substitutions: ParameterSubstitutions): PartialEvaluationResult {
        // Only expressions have a value
        if (!isSdsExpression(node)) {
            return undefined;
        }

        // Base cases
        if (isSdsBoolean(node)) {
            return new ConstantBoolean(node.value);
        } else if (isSdsFloat(node)) {
            return new ConstantFloat(node.value);
        } else if (isSdsInt(node)) {
            return new ConstantInt(BigInt(node.value));
        } else if (isSdsNull(node)) {
            return ConstantNull;
        } else if (isSdsString(node)) {
            return new ConstantString(node.value);
        } else if (isSdsTemplateStringStart(node)) {
            return new ConstantString(node.value);
        } else if (isSdsTemplateStringInner(node)) {
            return new ConstantString(node.value);
        } else if (isSdsTemplateStringEnd(node)) {
            return new ConstantString(node.value);
        } else if (isSdsBlockLambda(node)) {
            return this.evaluateBlockLambda(node, substitutions);
        } else if (isSdsExpressionLambda(node)) {
            return this.evaluateExpressionLambda(node, substitutions);
        }

        // Simple recursive cases
        else if (isSdsArgument(node)) {
            return this.cachedDoEvaluate(node.value, substitutions);
        } else if (isSdsInfixOperation(node)) {
            return this.evaluateInfixOperation(node, substitutions);
        } else if (isSdsList(node)) {
            return this.evaluateList(node, substitutions);
        } else if (isSdsMap(node)) {
            return this.evaluateMap(node, substitutions);
        } else if (isSdsParenthesizedExpression(node)) {
            return this.cachedDoEvaluate(node.expression, substitutions);
        } else if (isSdsPrefixOperation(node)) {
            return this.evaluatePrefixOperation(node, substitutions);
        } else if (isSdsTemplateString(node)) {
            return this.evaluateTemplateString(node, substitutions);
        }

        // Complex recursive cases
        else if (isSdsCall(node)) {
            return this.evaluateCall(node, substitutions);
        } else if (isSdsIndexedAccess(node)) {
            return this.evaluateIndexedAccess(node, substitutions);
        } else if (isSdsMemberAccess(node)) {
            return this.evaluateMemberAccess(node, substitutions);
        } else if (isSdsReference(node)) {
            return this.evaluateReference(node, substitutions);
        }

        // Raise if case is missing (should not happen)
        /* c8 ignore next */
        throw new Error(`Missing case to handle ${node.$type}.`);
    }

    evaluateBlockLambda(_node: SdsBlockLambda, _substitutions: ParameterSubstitutions): PartialEvaluationResult {
        //     return when {
        //     callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateBlockLambda(
        //     parameters = parametersOrEmpty(),
        //     results = blockLambdaResultsOrEmpty(),
        //     substitutionsOnCreation = substitutions
        // )
        // else -> undefined
        // }
        return undefined;
    }

    evaluateExpressionLambda(
        _node: SdsExpressionLambda,
        _substitutions: ParameterSubstitutions,
    ): PartialEvaluationResult {
        //     return when {
        //     callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateExpressionLambda(
        //     parameters = parametersOrEmpty(),
        //     result = result,
        //     substitutionsOnCreation = substitutions
        // )
        // else -> undefined
        // }
        return undefined;
    }

    evaluateInfixOperation(node: SdsInfixOperation, substitutions: ParameterSubstitutions): PartialEvaluationResult {
        // By design none of the operators are short-circuited
        const constantLeft = this.cachedDoEvaluate(node.leftOperand, substitutions);
        if (constantLeft === undefined) {
            return undefined;
        }

        const constantRight = this.cachedDoEvaluate(node.rightOperand, substitutions);
        if (constantRight === undefined) {
            return undefined;
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
        return undefined;
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

    evaluateList(_node: SdsList, _substitutions: ParameterSubstitutions): PartialEvaluationResult {
        return new ConstantList([]);
    }

    evaluateMap(_node: SdsMap, _substitutions: ParameterSubstitutions): PartialEvaluationResult {
        return new ConstantMap([]);
    }

    evaluatePrefixOperation(node: SdsPrefixOperation, substitutions: ParameterSubstitutions): PartialEvaluationResult {
        const constantOperand = this.cachedDoEvaluate(node.operand, substitutions);
        if (constantOperand === undefined) {
            return undefined;
        }

        if (node.operator === 'not') {
            if (constantOperand instanceof ConstantBoolean) {
                return new ConstantBoolean(!constantOperand.value);
            }
        } else if (node.operator === '-') {
            if (constantOperand instanceof ConstantFloat) {
                return new ConstantFloat(-constantOperand.value);
            } else if (constantOperand instanceof ConstantInt) {
                return new ConstantInt(-constantOperand.value);
            }
        }

        return undefined;
    }

    evaluateTemplateString(node: SdsTemplateString, substitutions: ParameterSubstitutions): PartialEvaluationResult {
        const expressions = node.expressions.map((it) => this.cachedDoEvaluate(it, substitutions));
        if (expressions.every(isConstantExpression)) {
            return new ConstantString(
                expressions.map((it) => it.toInterpolationString()).join(''),
            );
        }

        return undefined;
    }

    evaluateCall(_node: SdsCall, _substitutions: ParameterSubstitutions): PartialEvaluationResult {
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
        return undefined;
    }

    // private fun SdsCall.evaluateReceiver(substitutions: ParameterSubstitutions): SdsIntermediateCallable? {
    //     return when (val simpleReceiver = receiver.evaluate(substitutions)) {
    //     is SdsIntermediateRecord -> simpleReceiver.unwrap() as? SdsIntermediateCallable
    //     is SdsIntermediateCallable -> simpleReceiver
    // else -> return undefined
    // }
    // }
    //
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

    evaluateIndexedAccess(_node: SdsIndexedAccess, _substitutions: ParameterSubstitutions): PartialEvaluationResult {
        //         val simpleReceiver = receiver.evaluate(substitutions) as? SdsIntermediateVariadicArguments ?: return undefined
        //         val simpleIndex = index.evaluate(substitutions) as? SdsConstantInt ?: return undefined
        //
        //         return simpleReceiver.getArgumentByIndexOrNull(simpleIndex.value)
        //     }
        return undefined;
    }

    evaluateMemberAccess(_node: SdsMemberAccess, _substitutions: ParameterSubstitutions): PartialEvaluationResult {
        //     private fun SdsMemberAccess.evaluateMemberAccess(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
        //     if (member.declaration is SdsEnumVariant) {
        //     return member.evaluateReference(substitutions)
        // }
        //
        // return when (val simpleReceiver = receiver.evaluate(substitutions)) {
        //     SdsConstantNull -> when {
        //         isNullSafe -> SdsConstantNull
        //     else -> undefined
        //     }
        //     is SdsIntermediateRecord -> simpleReceiver.getSubstitutionByReferenceOrNull(member)
        // else -> undefined
        // }
        return undefined;
    }

    evaluateReference(_node: SdsReference, _substitutions: ParameterSubstitutions): PartialEvaluationResult {
        //     return when (val declaration = this.declaration) {
        //     is SdsEnumVariant -> when {
        //         declaration.parametersOrEmpty().isEmpty() -> SdsConstantEnumVariant(declaration)
        //     else -> undefined
        //     }
        //     is SdsPlaceholder -> declaration.evaluateAssignee(substitutions)
        //     is SdsParameter -> declaration.evaluateParameter(substitutions)
        //     is SdsStep -> declaration.evaluateStep()
        // else -> undefined
        // }
        return undefined;
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

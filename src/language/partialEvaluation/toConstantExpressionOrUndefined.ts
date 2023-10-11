import {
    ParameterSubstitutions,
    SdsConstantBoolean,
    SdsConstantExpression,
    SdsConstantFloat, SdsConstantInt,
    SdsConstantNull,
    SdsConstantString,
    SdsIntermediateBlockLambda,
    SdsIntermediateExpressionLambda,
    SdsSimplifiedExpression,
} from './model.js';
import { AstNode } from 'langium';
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
    SdsMemberAccess,
    SdsPrefixOperation,
    SdsReference,
    SdsTemplateString,
} from '../generated/ast.js';

/**
 * Tries to evaluate this expression. On success an SdsConstantExpression is returned, otherwise `null`.
 */
export const toConstantExpressionOrUndefined = (node: AstNode): SdsConstantExpression | null => {
    return toConstantExpressionOrNullImpl(node, new Map());
};

/* c8 ignore start */
const toConstantExpressionOrNullImpl = (
    node: AstNode,
    substitutions: ParameterSubstitutions,
): SdsConstantExpression | null => {
    const simplifiedExpression = simplify(node, substitutions)?.unwrap();
    if (simplifiedExpression instanceof SdsConstantExpression) {
        return simplifiedExpression;
    } else {
        return null;
    }
};

const simplify = (node: AstNode, substitutions: ParameterSubstitutions): SdsSimplifiedExpression | null => {
    // Only expressions have a value
    if (!isSdsExpression(node)) {
        return null;
    }

    // Base cases
    if (isSdsBoolean(node)) {
        return new SdsConstantBoolean(node.value);
    } else if (isSdsFloat(node)) {
        return new SdsConstantFloat(node.value);
    } else if (isSdsInt(node)) {
        return new SdsConstantInt(BigInt(node.value));
    } else if (isSdsNull(node)) {
        return new SdsConstantNull();
    } else if (isSdsString(node)) {
        return new SdsConstantString(node.value);
    } else if (isSdsTemplateStringStart(node)) {
        return new SdsConstantString(node.value);
    } else if (isSdsTemplateStringInner(node)) {
        return new SdsConstantString(node.value);
    } else if (isSdsTemplateStringEnd(node)) {
        return new SdsConstantString(node.value);
    } else if (isSdsBlockLambda(node)) {
        return simplifyBlockLambda(node, substitutions);
    } else if (isSdsExpressionLambda(node)) {
        return simplifyExpressionLambda(node, substitutions);
    }

    // Simple recursive cases
    else if (isSdsArgument(node)) {
        return simplify(node.value, substitutions);
    } else if (isSdsInfixOperation(node)) {
        return simplifyInfixOperation(node, substitutions);
    } else if (isSdsParenthesizedExpression(node)) {
        return simplify(node.expression, substitutions);
    } else if (isSdsPrefixOperation(node)) {
        return simplifyPrefixOperation(node, substitutions);
    } else if (isSdsTemplateString(node)) {
        return simplifyTemplateString(node, substitutions);
    }

    // Complex recursive cases
    else if (isSdsCall(node)) {
        return simplifyCall(node, substitutions);
    } else if (isSdsIndexedAccess(node)) {
        return simplifyIndexedAccess(node, substitutions);
    } else if (isSdsMemberAccess(node)) {
        return simplifyMemberAccess(node, substitutions);
    } else if (isSdsReference(node)) {
        return simplifyReference(node, substitutions);
    }

    // Raise if case is missing (should not happen)
    /* c8 ignore next */
    throw new Error(`Missing case to handle ${node.$type}.`);
};

const simplifyBlockLambda = (
    _node: SdsBlockLambda,
    _substitutions: ParameterSubstitutions,
): SdsIntermediateBlockLambda | null => {
    //     return when {
    //     callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateBlockLambda(
    //     parameters = parametersOrEmpty(),
    //     results = blockLambdaResultsOrEmpty(),
    //     substitutionsOnCreation = substitutions
    // )
    // else -> null
    // }
    return null;
};

const simplifyExpressionLambda = (
    _node: SdsExpressionLambda,
    _substitutions: ParameterSubstitutions,
): SdsIntermediateExpressionLambda | null => {
    //     return when {
    //     callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateExpressionLambda(
    //     parameters = parametersOrEmpty(),
    //     result = result,
    //     substitutionsOnCreation = substitutions
    // )
    // else -> null
    // }
    return null;
};

const simplifyInfixOperation = (
    _node: SdsInfixOperation,
    _substitutions: ParameterSubstitutions,
): SdsConstantExpression | null => {
    //     // By design none of the operators are short-circuited
    //     val constantLeft = leftOperand.toConstantExpressionOrUndefined(substitutions) ?: return null
    //     val constantRight = rightOperand.toConstantExpressionOrUndefined(substitutions) ?: return null
    //
    //     return when (operator()) {
    //     Or -> simplifyLogicalOp(constantLeft, Boolean::or, constantRight)
    // And -> simplifyLogicalOp(constantLeft, Boolean::and, constantRight)
    // Equals -> SdsConstantBoolean(constantLeft == constantRight)
    // NotEquals -> SdsConstantBoolean(constantLeft != constantRight)
    // IdenticalTo -> SdsConstantBoolean(constantLeft == constantRight)
    // NotIdenticalTo -> SdsConstantBoolean(constantLeft != constantRight)
    // LessThan -> simplifyComparisonOp(
    //     constantLeft,
    //     { a, b -> a < b },
    // { a, b -> a < b },
    // constantRight
    // )
    // LessThanOrEquals -> simplifyComparisonOp(
    //     constantLeft,
    //     { a, b -> a <= b },
    // { a, b -> a <= b },
    // constantRight
    // )
    // GreaterThanOrEquals -> simplifyComparisonOp(
    //     constantLeft,
    //     { a, b -> a >= b },
    // { a, b -> a >= b },
    // constantRight
    // )
    // GreaterThan -> simplifyComparisonOp(
    //     constantLeft,
    //     { a, b -> a > b },
    // { a, b -> a > b },
    // constantRight
    // )
    // Plus -> simplifyArithmeticOp(
    //     constantLeft,
    //     { a, b -> a + b },
    // { a, b -> a + b },
    // constantRight
    // )
    // InfixMinus -> simplifyArithmeticOp(
    //     constantLeft,
    //     { a, b -> a - b },
    // { a, b -> a - b },
    // constantRight
    // )
    // Times -> simplifyArithmeticOp(
    //     constantLeft,
    //     { a, b -> a * b },
    // { a, b -> a * b },
    // constantRight
    // )
    // By -> {
    //     if (constantRight == SdsConstantFloat(0.0) || constantRight == SdsConstantInt(0)) {
    //         return null
    //     }
    //
    //     simplifyArithmeticOp(
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
    return null;
};

// private fun simplifyLogicalOp(
//     leftOperand: SdsConstantExpression,
//     operation: (Boolean, Boolean) -> Boolean,
//     rightOperand: SdsConstantExpression,
// ): SdsConstantExpression? {
//
//     return when {
//     leftOperand is SdsConstantBoolean && rightOperand is SdsConstantBoolean -> {
//     SdsConstantBoolean(operation(leftOperand.value, rightOperand.value))
// }
// else -> null
// }
// }
//
// private fun simplifyComparisonOp(
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
// else -> null
// }
// }
//
// private fun simplifyArithmeticOp(
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
// else -> null
// }
// }

const simplifyPrefixOperation = (
    _node: SdsPrefixOperation,
    _substitutions: ParameterSubstitutions,
): SdsConstantExpression | null => {
    //     val constantOperand = operand.toConstantExpressionOrUndefined(substitutions) ?: return null
    //
    //     return when (operator()) {
    //     Not -> when (constantOperand) {
    //     is SdsConstantBoolean -> SdsConstantBoolean(!constantOperand.value)
    // else -> null
    // }
    // PrefixMinus -> when (constantOperand) {
    //     is SdsConstantFloat -> SdsConstantFloat(-constantOperand.value)
    //     is SdsConstantInt -> SdsConstantInt(-constantOperand.value)
    // else -> null
    // }
    // }
    return null;
};

const simplifyTemplateString = (
    node: SdsTemplateString,
    substitutions: ParameterSubstitutions,
): SdsConstantExpression | null => {
    const constantExpressions = node.expressions.map((it) => toConstantExpressionOrNullImpl(it, substitutions));
    if (constantExpressions.some((it) => it === null)) {
        return null;
    }

    return new SdsConstantString(constantExpressions.map((it) => it!.toInterpolationString()).join(''));
};

const simplifyCall = (_node: SdsCall, _substitutions: ParameterSubstitutions): SdsSimplifiedExpression | null => {
    //     val simpleReceiver = simplifyReceiver(substitutions) ?: return null
    //     val newSubstitutions = buildNewSubstitutions(simpleReceiver, substitutions)
    //
    //     return when (simpleReceiver) {
    //     is SdsIntermediateBlockLambda -> {
    //         SdsIntermediateRecord(
    //             simpleReceiver.results.map {
    //             it to it.simplifyAssignee(newSubstitutions)
    //         }
    //     )
    //     }
    //     is SdsIntermediateExpressionLambda -> simpleReceiver.result.simplify(newSubstitutions)
    //     is SdsIntermediateStep -> {
    //         SdsIntermediateRecord(
    //             simpleReceiver.results.map {
    //             it to it.uniqueYieldOrNull()?.simplifyAssignee(newSubstitutions)
    //         }
    //     )
    //     }
    // }
    return null;
};

// private fun SdsCall.simplifyReceiver(substitutions: ParameterSubstitutions): SdsIntermediateCallable? {
//     return when (val simpleReceiver = receiver.simplify(substitutions)) {
//     is SdsIntermediateRecord -> simpleReceiver.unwrap() as? SdsIntermediateCallable
//     is SdsIntermediateCallable -> simpleReceiver
// else -> return null
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
//         parameter == null -> null
//         parameter.isVariadic -> SdsIntermediateVariadicArguments(
//             arguments.map { it.simplify(oldSubstitutions) }
//     )
//     else -> arguments.uniqueOrNull()?.simplify(oldSubstitutions)
//     }
//     }
//
//     return buildMap {
//         putAll(substitutionsOnCreation)
//         substitutionsOnCall.entries.forEach { (parameter, argument) ->
//             if (parameter != null) {
//                 put(parameter, argument)
//             }
//         }
//     }
// }

const simplifyIndexedAccess = (
    _node: SdsIndexedAccess,
    _substitutions: ParameterSubstitutions,
): SdsSimplifiedExpression | null => {
    //         val simpleReceiver = receiver.simplify(substitutions) as? SdsIntermediateVariadicArguments ?: return null
    //         val simpleIndex = index.simplify(substitutions) as? SdsConstantInt ?: return null
    //
    //         return simpleReceiver.getArgumentByIndexOrNull(simpleIndex.value)
    //     }
    return null;
};

const simplifyMemberAccess = (
    _node: SdsMemberAccess,
    _substitutions: ParameterSubstitutions,
): SdsSimplifiedExpression | null => {
    //     private fun SdsMemberAccess.simplifyMemberAccess(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    //     if (member.declaration is SdsEnumVariant) {
    //     return member.simplifyReference(substitutions)
    // }
    //
    // return when (val simpleReceiver = receiver.simplify(substitutions)) {
    //     SdsConstantNull -> when {
    //         isNullSafe -> SdsConstantNull
    //     else -> null
    //     }
    //     is SdsIntermediateRecord -> simpleReceiver.getSubstitutionByReferenceOrNull(member)
    // else -> null
    // }
    return null;
};

const simplifyReference = (
    _node: SdsReference,
    _substitutions: ParameterSubstitutions,
): SdsSimplifiedExpression | null => {
    //     return when (val declaration = this.declaration) {
    //     is SdsEnumVariant -> when {
    //         declaration.parametersOrEmpty().isEmpty() -> SdsConstantEnumVariant(declaration)
    //     else -> null
    //     }
    //     is SdsPlaceholder -> declaration.simplifyAssignee(substitutions)
    //     is SdsParameter -> declaration.simplifyParameter(substitutions)
    //     is SdsStep -> declaration.simplifyStep()
    // else -> null
    // }
    return null;
};

// private fun SdsAbstractAssignee.simplifyAssignee(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
//     val simpleFullAssignedExpression = closestAncestorOrNull<SdsAssignment>()
//         ?.expression
//         ?.simplify(substitutions)
//         ?: return null
//
//     return when (simpleFullAssignedExpression) {
//     is SdsIntermediateRecord -> simpleFullAssignedExpression.getSubstitutionByIndexOrNull(indexOrNull())
//     else -> when {
//     indexOrNull() == 0 -> simpleFullAssignedExpression
// else -> null
// }
// }
// }
//
// private fun SdsParameter.simplifyParameter(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
//     return when {
//     this in substitutions -> substitutions[this]
//     isOptional() -> defaultValue?.simplify(substitutions)
// else -> null
// }
// }
//
// private fun SdsStep.simplifyStep(): SdsIntermediateStep? {
//     return when {
//     callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateStep(
//     parameters = parametersOrEmpty(),
//     results = resultsOrEmpty()
// )
// else -> null
// }
// }
/* c8 ignore stop */

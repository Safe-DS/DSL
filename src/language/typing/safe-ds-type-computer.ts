import { AstNode, AstNodeLocator, getDocument, WorkspaceCache } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsCoreClasses } from '../builtins/safe-ds-core-classes.js';
import { ClassType, Type, UnresolvedType } from './model.js';
import {
    isSdsAssignee,
    isSdsBoolean,
    isSdsDeclaration,
    isSdsExpression,
    isSdsFloat,
    isSdsInt,
    isSdsNull, isSdsParenthesizedExpression,
    isSdsString,
    isSdsTemplateString,
    isSdsType,
    isSdsTypeArgument,
    isSdsTypeProjection,
    SdsAssignee,
    SdsClass,
    SdsDeclaration,
    SdsExpression,
    SdsType,
} from '../generated/ast.js';

/* c8 ignore start */
export class SafeDsTypeComputer {
    readonly astNodeLocator: AstNodeLocator;
    readonly coreClasses: SafeDsCoreClasses;

    readonly typeCache: WorkspaceCache<string, Type>;

    constructor(readonly services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.coreClasses = services.builtins.CoreClasses;

        this.typeCache = new WorkspaceCache(services.shared);
    }

    computeType(node: AstNode | undefined): Type {
        if (!node) {
            return UnresolvedType;
        }

        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        return this.typeCache.get(key, () => this.doComputeType(node));
    }

    private doComputeType(node: AstNode): Type {
        if (isSdsAssignee(node)) {
            return this.computeTypeOfAssignee(node);
        } else if (isSdsDeclaration(node)) {
            return this.computeTypeOfDeclaration(node);
        } else if (isSdsExpression(node)) {
            return this.computeTypeOfExpression(node);
        } else if (isSdsType(node)) {
            return this.computeTypeOfType(node);
        } else if (isSdsTypeArgument(node)) {
            return UnresolvedType;
            // return this.computeType(node.value);
        } else if (isSdsTypeProjection(node)) {
            return UnresolvedType;
            // return this.computeTypeOfType(node.type);
        } else {
            return this.Any();
        }
    }

    private computeTypeOfAssignee(_node: SdsAssignee): Type {
        return UnresolvedType;
    }

    private computeTypeOfDeclaration(_node: SdsDeclaration): Type {
        return UnresolvedType;
    }

    private computeTypeOfExpression(node: SdsExpression): Type {
        // Terminal cases
        if (isSdsBoolean(node)) {
            return this.Boolean();
        } else if (isSdsFloat(node)) {
            return this.Float();
        } else if (isSdsInt(node)) {
            return this.Int();
        } else if (isSdsNull(node)) {
            return this.Nothing(true);
        } else if (isSdsString(node)) {
            return this.String();
        } else if (isSdsTemplateString(node)) {
            return this.String();
        }

        // Recursive cases
        if (isSdsParenthesizedExpression(node)) {
            return this.computeType(node.expression);
        }

        return UnresolvedType;

        //     this is SdsArgument -> this.value.inferTypeExpression(context)
        //     this is SdsBlockLambda -> CallableType(
        //         this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
        //     blockLambdaResultsOrEmpty().map { it.inferTypeForAssignee(context) },
        // )
        //     this is SdsCall -> when (val callable = callableOrNull()) {
        //         is SdsClass -> {
        //             val typeParametersTypes = callable.typeParametersOrEmpty()
        //                 .map { it.inferTypeForDeclaration(context) }
        //         .filterIsInstance<ParameterisedType>()
        //
        //             ClassType(callable, typeParametersTypes, isNullable = false)
        //         }
        //         is SdsCallableType -> {
        //             val results = callable.resultsOrEmpty()
        //             when (results.size) {
        //                 1 -> results.first().inferTypeForDeclaration(context)
        //             else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
        //             }
        //         }
        //         is SdsFunction -> {
        //             val results = callable.resultsOrEmpty()
        //             when (results.size) {
        //                 1 -> results.first().inferTypeForDeclaration(context)
        //             else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
        //             }
        //         }
        //         is SdsBlockLambda -> {
        //             val results = callable.blockLambdaResultsOrEmpty()
        //             when (results.size) {
        //                 1 -> results.first().inferTypeForAssignee(context)
        //             else -> RecordType(results.map { it.name to it.inferTypeForAssignee(context) })
        //             }
        //         }
        //         is SdsEnumVariant -> {
        //             EnumVariantType(callable, isNullable = false)
        //         }
        //         is SdsExpressionLambda -> {
        //             callable.result.inferTypeExpression(context)
        //         }
        //         is SdsStep -> {
        //             val results = callable.resultsOrEmpty()
        //             when (results.size) {
        //                 1 -> results.first().inferTypeForDeclaration(context)
        //             else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
        //             }
        //         }
        //     else -> Any(context)
        //     }
        //     this is SdsExpressionLambda -> CallableType(
        //         this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
        //     listOf(result.inferTypeExpression(context)),
        // )
        //     this is SdsIndexedAccess -> {
        //         when (val receiverType = this.receiver.inferTypeExpression(context)) {
        //             is UnresolvedType -> UnresolvedType
        //             is VariadicType -> receiverType.elementType
        //         else -> Nothing(context)
        //         }
        //     }
        //     this is SdsInfixOperation -> when (operator) {
        //         "<", "<=", ">=", ">" -> Boolean(context)
        //         "==", "!=" -> Boolean(context)
        //         "===", "!==" -> Boolean(context)
        //         "or", "and" -> Boolean(context)
        //         "+", "-", "*", "/" -> when {
        //             this.leftOperand.inferTypeExpression(context) == Int(context) &&
        //             this.rightOperand.inferTypeExpression(context) == Int(context) -> Int(context)
        //         else -> Float(context)
        //         }
        //         "?:" -> {
        //             val leftOperandType = this.leftOperand.inferTypeExpression(context)
        //             if (leftOperandType.isNullable) {
        //                 lowestCommonSupertype(
        //                     context,
        //                     listOf(
        //                         leftOperandType.setIsNullableOnCopy(isNullable = false),
        //                         this.rightOperand.inferTypeExpression(context),
        //                     ),
        //                 )
        //             } else {
        //                 leftOperandType
        //             }
        //         }
        //     else -> Nothing(context)
        //     }
        //     this is SdsMemberAccess -> {
        //         val memberType = this.member.inferTypeExpression(context)
        //         memberType.setIsNullableOnCopy(this.isNullSafe || memberType.isNullable)
        //     }
        //     this is SdsPrefixOperation -> when (operator) {
        //         "not" -> Boolean(context)
        //         "-" -> when (this.operand.inferTypeExpression(context)) {
        //             Int(context) -> Int(context)
        //         else -> Float(context)
        //         }
        //     else -> Nothing(context)
        //     }
        //     this is SdsReference -> this.declaration.inferType(context)
        // else -> Any(context)
    }

    private computeTypeOfType(_node: SdsType): Type {
        return UnresolvedType;
    }

    private cachedAny: Type = UnresolvedType;

    private Any(): Type {
        if (this.cachedAny === UnresolvedType) {
            this.cachedAny = this.createCoreType(this.coreClasses.Any);
        }
        return this.cachedAny;
    }

    private cachedBoolean: Type = UnresolvedType;

    private Boolean(): Type {
        if (this.cachedBoolean === UnresolvedType) {
            this.cachedBoolean = this.createCoreType(this.coreClasses.Boolean);
        }
        return this.cachedBoolean;
    }

    private cachedFloat: Type = UnresolvedType;

    private Float(): Type {
        if (this.cachedFloat === UnresolvedType) {
            this.cachedFloat = this.createCoreType(this.coreClasses.Float);
        }
        return this.cachedFloat;
    }

    private cachedInt: Type = UnresolvedType;

    private Int(): Type {
        if (this.cachedInt === UnresolvedType) {
            this.cachedInt = this.createCoreType(this.coreClasses.Int);
        }
        return this.cachedInt;
    }

    private cachedNothingOrNull: Type = UnresolvedType;
    private cachedNothing: Type = UnresolvedType;

    private Nothing(isNullable: boolean): Type {
        if (isNullable) {
            if (this.cachedNothingOrNull === UnresolvedType) {
                this.cachedNothingOrNull = this.createCoreType(this.coreClasses.Nothing, true);
            }
            return this.cachedNothingOrNull;
        } else {
            if (this.cachedNothing === UnresolvedType) {
                this.cachedNothing = this.createCoreType(this.coreClasses.Nothing);
            }
            return this.cachedNothing;
        }
    }

    private cachedString: Type = UnresolvedType;

    private String(): Type {
        if (this.cachedString === UnresolvedType) {
            this.cachedString = this.createCoreType(this.coreClasses.String);
        }
        return this.cachedString;
    }

    private createCoreType(coreClass: SdsClass | undefined, isNullable: boolean = false): Type {
        if (coreClass) {
            return new ClassType(coreClass, isNullable);
        } else {
            return UnresolvedType;
        }
    }
}

/* c8 ignore stop */

/*
fun SdsAbstractObject.hasPrimitiveType(): Boolean {
    val type = type()
    if (type !is ClassType) {
        return false
    }

    val qualifiedName = type.sdsClass.qualifiedNameOrNull()
    return qualifiedName in setOf(
        StdlibClasses.Boolean,
        StdlibClasses.Float,
        StdlibClasses.Int,
        StdlibClasses.String,
    )
}

private fun SdsAbstractAssignee.inferTypeForAssignee(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SdsBlockLambdaResult || this is SdsPlaceholder || this is SdsYield -> {
            val assigned = assignedOrNull() ?: return Nothing(context)
            assigned.inferType(context)
        }
        else -> Any(context)
    }
}

@OptIn(ExperimentalSdsApi::class)
private fun SdsAbstractDeclaration.inferTypeForDeclaration(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SdsAttribute -> type.inferTypeForType(context)
        this is SdsClass -> {
            val typeParametersTypes = this.typeParametersOrEmpty()
                .map { it.inferTypeForDeclaration(context) }
                .filterIsInstance<ParameterisedType>()

            ClassType(this, typeParametersTypes, isNullable = false)
        }
        this is SdsEnum -> EnumType(this, isNullable = false)
        this is SdsEnumVariant -> EnumVariantType(this, isNullable = false)
        this is SdsFunction -> CallableType(
            parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            resultsOrEmpty().map { it.inferTypeForDeclaration(context) },
        )
        this is SdsParameter -> {
            // Declared parameter type
            if (this.type != null) {
                val declaredParameterType = this.type.inferTypeForType(context)
                return when {
                    this.isVariadic -> VariadicType(declaredParameterType)
                    else -> declaredParameterType
                }
            }

            // Inferred lambda parameter type
            val callable = this.closestAncestorOrNull<SdsAbstractCallable>()
            val thisIndex = callable.parametersOrEmpty().indexOf(this)
            if (callable is SdsAbstractLambda) {
                val containerType = when (val container = callable.eContainer()) {
                    is SdsArgument -> container.parameterOrNull()?.inferType(context)
                    is SdsAssignment ->
                        container
                            .yieldsOrEmpty()
                            .find { it.assignedOrNull() == callable }
                            ?.result
                            ?.inferType(context)
                    else -> null
                }

                return when (containerType) {
                    is CallableType -> containerType.parameters.getOrElse(thisIndex) { Any(context) }
                    else -> Any(context)
                }
            }

            // We don't know better
            return Any(context)
        }
        this is SdsResult -> type.inferTypeForType(context)
        // For now all Schema placeholders are of type 'ParameterisedType(::$SchemaType)'
        this is SdsSchemaPlaceholder -> ParameterisedType(this, SdsKind.SchemaKind.toString())
        this is SdsStep -> CallableType(
            parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            resultsOrEmpty().map { it.inferTypeForDeclaration(context) },
        )
        // Todo: resolve TypeParameter for "non kind" TypeParameter too
        this is SdsTypeParameter && this.kind != null -> ParameterisedType(this, kind)
        else -> Any(context)
    }
}

private fun SdsAbstractType.inferTypeForType(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SdsCallableType -> CallableType(
            this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            this.resultsOrEmpty().map { it.inferTypeForDeclaration(context) },
        )
        this is SdsMemberType -> {
            this.member.inferTypeForType(context)
        }
        this is SdsNamedType -> {
            this.declaration.inferTypeForDeclaration(context).setIsNullableOnCopy(this.isNullable)
        }
        this is SdsParenthesizedType -> {
            this.type.inferTypeForType(context)
        }
        this is SdsSchemaType -> {
            this.declaration.inferTypeForDeclaration(context)
        }
        this is SdsUnionType -> {
            UnionType(this.typeArgumentsOrEmpty().map { it.value.inferType(context) }.toSet())
        }
        else -> Any(context)
    }
}

private fun lowestCommonSupertype(context: EObject, types: List<Type>): Type {
    if (types.isEmpty()) {
        return Nothing(context)
    }

    val unwrappedTypes = unwrapUnionTypes(types)
    val isNullable = unwrappedTypes.any { it.isNullable }
    var candidate = unwrappedTypes.first().setIsNullableOnCopy(isNullable)

    while (!isLowestCommonSupertype(candidate, unwrappedTypes)) {
        candidate = when (candidate) {
            is CallableType -> Any(context, candidate.isNullable)
            is ClassType -> {
                val superClass = candidate.sdsClass.superClasses().firstOrNull()
                    ?: return Any(context, candidate.isNullable)

                val typeParametersTypes = superClass.typeParametersOrEmpty()
                    .map { it.inferTypeForDeclaration(context) }
                    .filterIsInstance<ParameterisedType>()

                ClassType(superClass, typeParametersTypes, candidate.isNullable)
            }
            is EnumType -> Any(context, candidate.isNullable)
            is EnumVariantType -> {
                val containingEnum = candidate.sdsEnumVariant.containingEnumOrNull()
                    ?: return Any(context, candidate.isNullable)
                EnumType(containingEnum, candidate.isNullable)
            }
            is RecordType -> Any(context, candidate.isNullable)
            // TODO: Correct ?
            is ParameterisedType -> Any(context, candidate.isNullable)
            is UnionType -> throw AssertionError("Union types should have been unwrapped.")
            UnresolvedType -> Any(context, candidate.isNullable)
            is VariadicType -> Any(context, candidate.isNullable)
        }
    }

    return candidate
}

private fun unwrapUnionTypes(types: List<Type>): List<Type> {
    return types.flatMap {
        when (it) {
            is UnionType -> it.possibleTypes
            else -> listOf(it)
        }
    }
}

private fun isLowestCommonSupertype(candidate: Type, otherTypes: List<Type>): Boolean {
    if (candidate is ClassType && candidate.sdsClass.qualifiedNameOrNull() == StdlibClasses.Any) {
        return true
    }

    return otherTypes.all { it.isSubstitutableFor(candidate) }
}
 */

// @Nested
// inner class BlockLambdaResults {
//
//     @Test
//     fun `attributes should have declared type`() {
//     withCompilationUnitFromFile("assignees/blockLambdaResults") {
//     descendants<SdsBlockLambdaResult>().forEach {
//     val assigned = it.assignedOrNull()
//     assigned.shouldNotBeNull()
//     it shouldHaveType assigned
// }
// }
// }
// }
//
// @Nested
// inner class Placeholders {
//
//     @Test
//     fun `classes should have non-nullable class type`() {
//     withCompilationUnitFromFile("assignees/placeholders") {
//     descendants<SdsPlaceholder>().forEach {
//     val assigned = it.assignedOrNull()
//     assigned.shouldNotBeNull()
//     it shouldHaveType assigned
// }
// }
// }
// }
//
// @Nested
// inner class Yields {
//
//     @Test
//     fun `enums should have non-nullable enum type`() {
//     withCompilationUnitFromFile("assignees/yields") {
//     descendants<SdsYield>().forEach {
//     val assigned = it.assignedOrNull()
//     assigned.shouldNotBeNull()
//     it shouldHaveType assigned
// }
// }
// }
// }
//
// // *****************************************************************************************************************
// // Declarations
// // ****************************************************************************************************************/
//
// @Nested
// inner class Attributes {
//
//     @Test
//     fun `attributes should have declared type`() {
//     withCompilationUnitFromFile("declarations/attributes") {
//     descendants<SdsAttribute>().forEach {
//     it shouldHaveType it.type
// }
// }
// }
// }
//
// @Nested
// inner class Classes {
//
//     @Test
//     fun `classes should have non-nullable class type`() {
//     withCompilationUnitFromFile("declarations/classes") {
//     descendants<SdsClass>().forEach {
//     it shouldHaveType ClassType(it, isNullable = false)
// }
// }
// }
// }
//
// @Nested
// inner class Enums {
//
//     @Test
//     fun `enums should have non-nullable enum type`() {
//     withCompilationUnitFromFile("declarations/enums") {
//     descendants<SdsEnum>().forEach {
//     it shouldHaveType EnumType(it, isNullable = false)
// }
// }
// }
// }
//
// @Nested
// inner class EnumVariants {
//
//     @Test
//     fun `enum variants should have non-nullable enum variant type`() {
//     withCompilationUnitFromFile("declarations/enumVariants") {
//     descendants<SdsEnumVariant>().forEach {
//     it shouldHaveType EnumVariantType(it, isNullable = false)
// }
// }
// }
// }
//
// @Nested
// inner class Functions {
//
//     @Test
//     fun `functions should have callable type with respective parameters and results`() {
//     withCompilationUnitFromFile("declarations/functions") {
//     descendants<SdsFunction>().forEach { function ->
//     function shouldHaveType CallableType(
//     function.parametersOrEmpty().map { it.type() },
// function.resultsOrEmpty().map { it.type() },
// )
// }
// }
// }
// }
//
// @Nested
// inner class Parameters {
//
//     @Test
//     fun `parameters should have declared type`() {
//     withCompilationUnitFromFile("declarations/parameters") {
//     findUniqueDeclarationOrFail<SdsStep>("myStepWithNormalParameter")
// .descendants<SdsParameter>().forEach {
//     it shouldHaveType it.type
// }
// }
// }
//
// @Test
// fun `variadic parameters should have variadic type with declared element type`() {
//     withCompilationUnitFromFile("declarations/parameters") {
//         findUniqueDeclarationOrFail<SdsStep>("myStepWithVariadicParameter")
//             .descendants<SdsParameter>().forEach {
//             it shouldHaveType VariadicType(it.type.type())
//         }
//     }
// }
//
// @Test
// fun `lambda parameters should have type inferred from context`() {
//     withCompilationUnitFromFile("declarations/parameters") {
//         findUniqueDeclarationOrFail<SdsStep>("myStepWithLambdas")
//             .descendants<SdsParameter>()
//             .toList()
//             .forEachAsClue {
//             it shouldHaveType String
//         }
//     }
// }
// }
//
// @Nested
// inner class Results {
//
//     @Test
//     fun `results should have declared type`() {
//     withCompilationUnitFromFile("declarations/results") {
//     descendants<SdsResult>().forEach {
//     it shouldHaveType it.type
// }
// }
// }
// }
//
// @Nested
// inner class Steps {
//
//     @Test
//     fun `steps should have callable type with respective parameters and results`() {
//     withCompilationUnitFromFile("declarations/steps") {
//     descendants<SdsStep>().forEach { step ->
//     step shouldHaveType CallableType(
//         step.parametersOrEmpty().map { it.type() },
// step.resultsOrEmpty().map { it.type() },
// )
// }
// }
// }
// }
//
// // *****************************************************************************************************************
// // Expressions
// // ****************************************************************************************************************/
//
// @Nested
// inner class Literals {
//
//     @Test
//     fun `boolean literals should have type Boolean`() {
//     withCompilationUnitFromFile("expressions/literals") {
//     placeholderWithName("booleanLiteral").assignedValueOrFail() shouldHaveType Boolean
// }
// }
//
// @Test
// fun `float literals should have type Float`() {
//     withCompilationUnitFromFile("expressions/literals") {
//         placeholderWithName("floatLiteral").assignedValueOrFail() shouldHaveType Float
//     }
// }
//
// @Test
// fun `int literals should have type Int`() {
//     withCompilationUnitFromFile("expressions/literals") {
//         placeholderWithName("intLiteral").assignedValueOrFail() shouldHaveType Int
//     }
// }
//
// @Test
// fun `null literals should have type nullable Nothing`() {
//     withCompilationUnitFromFile("expressions/literals") {
//         placeholderWithName("nullLiteral").assignedValueOrFail() shouldHaveType NothingOrNull
//     }
// }
//
// @Test
// fun `string literals should have type String`() {
//     withCompilationUnitFromFile("expressions/literals") {
//         placeholderWithName("stringLiteral").assignedValueOrFail() shouldHaveType String
//     }
// }
// }
//
// @Nested
// inner class TemplateStrings {
//
//     @Test
//     fun `template strings should have type String`() {
//     withCompilationUnitFromFile("expressions/templateStrings") {
//     placeholderWithName("templateString").assignedValueOrFail() shouldHaveType String
// }
// }
// }
//
// @Nested
// inner class Arguments {
//
//     @Test
//     fun `arguments should have type of value`() {
//     withCompilationUnitFromFile("expressions/arguments") {
//     descendants<SdsArgument>().forEach {
//     it shouldHaveType it.value
// }
// }
// }
// }
//
// @Nested
// inner class BlockLambdas {
//
//     @Test
//     fun `block lambdas should have callable type (explicit parameter types)`() {
//     withCompilationUnitFromFile("expressions/blockLambdas") {
//     findUniqueDeclarationOrFail<SdsStep>("lambdasWithExplicitParameterTypes")
// .descendants<SdsBlockLambda>().forEach { lambda ->
//     lambda shouldHaveType CallableType(
//         lambda.parametersOrEmpty().map { it.type() },
// lambda.blockLambdaResultsOrEmpty().map { it.type() },
// )
// }
// }
// }
//
// @Test
// fun `block lambdas should have callable type (explicit variadic parameter type)`() {
//     withCompilationUnitFromFile("expressions/blockLambdas") {
//         findUniqueDeclarationOrFail<SdsStep>("lambdasWithExplicitVariadicType")
//             .descendants<SdsBlockLambda>().forEach { lambda ->
//             lambda shouldHaveType CallableType(
//             lambda.parametersOrEmpty().map { it.type() },
//             lambda.blockLambdaResultsOrEmpty().map { it.type() },
//         )
//         }
//     }
// }
//
// @Test
// fun `block lambdas should have callable type (yielded)`() {
//     withCompilationUnitFromFile("expressions/blockLambdas") {
//         val step = findUniqueDeclarationOrFail<SdsStep>("yieldedLambda")
//
//         val result = step.findUniqueDeclarationOrFail<SdsResult>("result")
//         val resultType = result.type.shouldBeInstanceOf<SdsCallableType>()
//
//         val lambdas = step.descendants<SdsBlockLambda>()
//         lambdas.shouldHaveSize(1)
//         val lambda = lambdas.first()
//
//         lambda shouldHaveType CallableType(
//             resultType.parametersOrEmpty().map { it.type() },
//         lambda.blockLambdaResultsOrEmpty().map { it.type() },
//     )
//     }
// }
//
// @Test
// fun `block lambdas should have callable type (argument)`() {
//     withCompilationUnitFromFile("expressions/blockLambdas") {
//         val parameter = findUniqueDeclarationOrFail<SdsParameter>("parameter")
//         val parameterType = parameter.type.shouldBeInstanceOf<SdsCallableType>()
//
//         val step = findUniqueDeclarationOrFail<SdsStep>("argumentLambda")
//         val lambdas = step.descendants<SdsBlockLambda>()
//         lambdas.shouldHaveSize(1)
//         val lambda = lambdas.first()
//
//         lambda shouldHaveType CallableType(
//             parameterType.parametersOrEmpty().map { it.type() },
//         lambda.blockLambdaResultsOrEmpty().map { it.type() },
//     )
//     }
// }
// }
//
// @Nested
// inner class Calls {
//
//     @Test
//     fun `class call should have class type of called class`() {
//     withCompilationUnitFromFile("expressions/calls") {
//     val `class` = findUniqueDeclarationOrFail<SdsClass>("C")
//
//     val calls = descendants<SdsCall>().toList()
//     calls.shouldHaveSize(11)
//     calls[0] shouldHaveType ClassType(`class`, isNullable = false)
// }
// }
//
// @Test
// fun `callable type call should have type of result (one result)`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val parameter = findUniqueDeclarationOrFail<SdsParameter>("p1")
//         val parameterType = parameter.type.shouldBeInstanceOf<SdsCallableType>()
//         parameterType.resultsOrEmpty().shouldHaveSize(1)
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[1] shouldHaveType parameterType.resultsOrEmpty()[0]
//     }
// }
//
// @Test
// fun `callable type call should have record type (multiple result)`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val parameter = findUniqueDeclarationOrFail<SdsParameter>("p2")
//         val parameterType = parameter.type.shouldBeInstanceOf<SdsCallableType>()
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[2] shouldHaveType RecordType(parameterType.resultsOrEmpty().map { it.name to it.type() })
//     }
// }
//
// @Test
// fun `enum variant call should have enum variant type of called enum variant`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val enumVariant = findUniqueDeclarationOrFail<SdsEnumVariant>("V")
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[3] shouldHaveType EnumVariantType(enumVariant, isNullable = false)
//     }
// }
//
// @Test
// fun `function call should have type of result (one result)`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val function = findUniqueDeclarationOrFail<SdsFunction>("f1")
//         function.resultsOrEmpty().shouldHaveSize(1)
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[4] shouldHaveType function.resultsOrEmpty()[0]
//     }
// }
//
// @Test
// fun `function call should have record type (multiple result)`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val function = findUniqueDeclarationOrFail<SdsFunction>("f2")
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[5] shouldHaveType RecordType(function.resultsOrEmpty().map { it.name to it.type() })
//     }
// }
//
// @Test
// fun `block lambda call should have type of result (one result)`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val blockLambdas = descendants<SdsBlockLambda>().toList()
//         blockLambdas.shouldHaveSize(2)
//         val blockLambda = blockLambdas[0]
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[6] shouldHaveType blockLambda.blockLambdaResultsOrEmpty()[0]
//     }
// }
//
// @Test
// fun `block lambda call should have record type (multiple result)`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val blockLambdas = descendants<SdsBlockLambda>().toList()
//         blockLambdas.shouldHaveSize(2)
//         val blockLambda = blockLambdas[1]
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[7] shouldHaveType RecordType(blockLambda.blockLambdaResultsOrEmpty().map { it.name to it.type() })
//     }
// }
//
// @Test
// fun `expression lambda call should have type of result`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val expressionLambdas = descendants<SdsExpressionLambda>().toList()
//         expressionLambdas.shouldHaveSize(1)
//         val expressionLambda = expressionLambdas[0]
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[8] shouldHaveType expressionLambda.result
//     }
// }
//
// @Test
// fun `step call should have type of result (one result)`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val step = findUniqueDeclarationOrFail<SdsStep>("s1")
//         step.resultsOrEmpty().shouldHaveSize(1)
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[9] shouldHaveType step.resultsOrEmpty()[0]
//     }
// }
//
// @Test
// fun `step call should have record type (multiple result)`() {
//     withCompilationUnitFromFile("expressions/calls") {
//         val step = findUniqueDeclarationOrFail<SdsStep>("s2")
//
//         val calls = descendants<SdsCall>().toList()
//         calls.shouldHaveSize(11)
//         calls[10] shouldHaveType RecordType(step.resultsOrEmpty().map { it.name to it.type() })
//     }
// }
// }
//
// @Nested
// inner class ExpressionLambdas {
//
//     @Test
//     fun `expression lambdas should have callable type (explicit parameter types)`() {
//     withCompilationUnitFromFile("expressions/expressionLambdas") {
//     findUniqueDeclarationOrFail<SdsStep>("lambdasWithExplicitParameterTypes")
// .descendants<SdsExpressionLambda>().forEach { lambda ->
//     lambda shouldHaveType CallableType(
//         lambda.parametersOrEmpty().map { it.type() },
// listOf(lambda.result.type()),
// )
// }
// }
// }
//
// @Test
// fun `expression lambdas should have callable type (explicit variadic parameter type)`() {
//     withCompilationUnitFromFile("expressions/expressionLambdas") {
//         findUniqueDeclarationOrFail<SdsStep>("lambdasWithExplicitVariadicType")
//             .descendants<SdsExpressionLambda>().forEach { lambda ->
//             lambda shouldHaveType CallableType(
//             lambda.parametersOrEmpty().map { it.type() },
//             listOf(lambda.result.type()),
//         )
//         }
//     }
// }
//
// @Test
// fun `expression lambdas should have callable type (yielded)`() {
//     withCompilationUnitFromFile("expressions/expressionLambdas") {
//         val step = findUniqueDeclarationOrFail<SdsStep>("yieldedLambda")
//
//         val result = step.findUniqueDeclarationOrFail<SdsResult>("result")
//         val resultType = result.type.shouldBeInstanceOf<SdsCallableType>()
//
//         val lambdas = step.descendants<SdsExpressionLambda>()
//         lambdas.shouldHaveSize(1)
//         val lambda = lambdas.first()
//
//         lambda shouldHaveType CallableType(
//             resultType.parametersOrEmpty().map { it.type() },
//         listOf(lambda.result.type()),
//     )
//     }
// }
//
// @Test
// fun `expression lambdas should have callable type (argument)`() {
//     withCompilationUnitFromFile("expressions/expressionLambdas") {
//         val parameter = findUniqueDeclarationOrFail<SdsParameter>("parameter")
//         val parameterType = parameter.type.shouldBeInstanceOf<SdsCallableType>()
//
//         val step = findUniqueDeclarationOrFail<SdsStep>("argumentLambda")
//         val lambdas = step.descendants<SdsExpressionLambda>()
//         lambdas.shouldHaveSize(1)
//         val lambda = lambdas.first()
//
//         lambda shouldHaveType CallableType(
//             parameterType.parametersOrEmpty().map { it.type() },
//         listOf(lambda.result.type()),
//     )
//     }
// }
// }
//
// @Nested
// inner class IndexedAccesses {
//
//     @Test
//     fun `indexed accesses should return element type if receiver is variadic (myStep1)`() {
//     withCompilationUnitFromFile("expressions/indexedAccesses") {
//     findUniqueDeclarationOrFail<SdsStep>("myStep1")
// .descendants<SdsIndexedAccess>()
// .forEach {
//     it shouldHaveType Int
// }
// }
// }
//
// @Test
// fun `indexed accesses should return element type if receiver is variadic (myStep2)`() {
//     withCompilationUnitFromFile("expressions/indexedAccesses") {
//         findUniqueDeclarationOrFail<SdsStep>("myStep2")
//             .descendants<SdsIndexedAccess>()
//             .forEach {
//             it shouldHaveType String
//         }
//     }
// }
//
// @Test
// fun `indexed accesses should return Nothing type if receiver is not variadic`() {
//     withCompilationUnitFromFile("expressions/indexedAccesses") {
//         findUniqueDeclarationOrFail<SdsStep>("myStep3")
//             .descendants<SdsIndexedAccess>()
//             .forEach {
//             it shouldHaveType Nothing
//         }
//     }
// }
//
// @Test
// fun `indexed accesses should return Unresolved type if receiver is unresolved`() {
//     withCompilationUnitFromFile("expressions/indexedAccesses") {
//         findUniqueDeclarationOrFail<SdsStep>("myStep4")
//             .descendants<SdsIndexedAccess>()
//             .forEach {
//             it shouldHaveType UnresolvedType
//         }
//     }
// }
// }
//
// @Nested
// inner class MemberAccesses {
//
//     @Test
//     fun `non-null-safe member accesses should have type of referenced member`() {
//     withCompilationUnitFromFile("expressions/memberAccesses") {
//     descendants<SdsMemberAccess>()
// .filter { !it.isNullSafe }
// .forEach {
//     it shouldHaveType it.member
// }
// }
// }
//
// @Test
// fun `null-safe member accesses should have type of referenced member but nullable`() {
//     withCompilationUnitFromFile("expressions/memberAccesses") {
//         descendants<SdsMemberAccess>()
//             .filter { it.isNullSafe }
//     .forEach {
//             it shouldHaveType it.member.type().setIsNullableOnCopy(isNullable = true)
//         }
//     }
// }
// }

// @Nested
// inner class References {
//
//     @Test
//     fun `references should have type of referenced declaration`() {
//     withCompilationUnitFromFile("expressions/references") {
//     descendants<SdsReference>().forEach {
//     it shouldHaveType it.declaration
// }
// }
// }
// }
//
// @Nested
// inner class Operations {
//
//     @ParameterizedTest
//     @ValueSource(
//         strings = [
//             "additionIntInt",
//             "subtractionIntInt",
//             "multiplicationIntInt",
//             "divisionIntInt",
//             "negationInt",
//         ],
//     )
//     fun `arithmetic operations with only Int operands should have type Int`(placeholderName: String) {
//     withCompilationUnitFromFile("expressions/operations/arithmetic") {
//     placeholderWithName(placeholderName).assignedValueOrFail() shouldHaveType Int
// }
// }
//
// @ParameterizedTest
// @ValueSource(
//     strings = [
//         "additionIntFloat",
//         "subtractionIntFloat",
//         "multiplicationIntFloat",
//         "divisionIntFloat",
//         "negationFloat",
//         "additionInvalid",
//         "subtractionInvalid",
//         "multiplicationInvalid",
//         "divisionInvalid",
//         "negationInvalid",
//     ],
// )
// fun `arithmetic operations with non-Int operands should have type Float`(placeholderName: String) {
//     withCompilationUnitFromFile("expressions/operations/arithmetic") {
//         placeholderWithName(placeholderName).assignedValueOrFail() shouldHaveType Float
//     }
// }
//
// @ParameterizedTest
// @ValueSource(
//     strings = [
//         "lessThan",
//         "lessThanOrEquals",
//         "greaterThanOrEquals",
//         "greaterThan",
//         "lessThanInvalid",
//         "lessThanOrEqualsInvalid",
//         "greaterThanOrEqualsInvalid",
//         "greaterThanInvalid",
//     ],
// )
// fun `comparison operations should have type Boolean`(placeholderName: String) {
//     withCompilationUnitFromFile("expressions/operations/comparison") {
//         placeholderWithName(placeholderName).assignedValueOrFail() shouldHaveType Boolean
//     }
// }
//
// @ParameterizedTest
// @ValueSource(
//     strings = [
//         "equals",
//         "notEquals",
//     ],
// )
// fun `equality operations should have type Boolean`(placeholderName: String) {
//     withCompilationUnitFromFile("expressions/operations/equality") {
//         placeholderWithName(placeholderName).assignedValueOrFail() shouldHaveType Boolean
//     }
// }
//
// @ParameterizedTest
// @ValueSource(
//     strings = [
//         "strictlyEquals",
//         "notStrictlyEquals",
//     ],
// )
// fun `strict equality operations should have type Boolean`(placeholderName: String) {
//     withCompilationUnitFromFile("expressions/operations/strictEquality") {
//         placeholderWithName(placeholderName).assignedValueOrFail() shouldHaveType Boolean
//     }
// }
//
// @ParameterizedTest
// @ValueSource(
//     strings = [
//         "conjunction",
//         "disjunction",
//         "negation",
//         "conjunctionInvalid",
//         "disjunctionInvalid",
//         "negationInvalid",
//     ],
// )
// fun `logical operations should have type Boolean`(placeholderName: String) {
//     withCompilationUnitFromFile("expressions/operations/logical") {
//         placeholderWithName(placeholderName).assignedValueOrFail() shouldHaveType Boolean
//     }
// }
//
// @Test
// fun `elvis operator with non-nullable left operand should have type of left operand`() {
//     withCompilationUnitFromFile("expressions/operations/elvis") {
//         findUniqueDeclarationOrFail<SdsPipeline>("elvisWithNonNullableLeftOperand")
//             .descendants<SdsInfixOperation>()
//             .filter { it.operator() == SdsInfixOperationOperator.Elvis }
//     .forEach { it shouldHaveType it.leftOperand }
//     }
// }
//
// @Test
// fun `elvis operator with nullable left operand should have lowest common supertype of non-nullable left operand and right operand (intOrNullElseIntOrNull)`() {
//     withCompilationUnitFromFile("expressions/operations/elvis") {
//         placeholderWithName("intOrNullElseIntOrNull") shouldHaveType IntOrNull
//     }
// }
//
// @Test
// fun `elvis operator with nullable left operand should have lowest common supertype of non-nullable left operand and right operand (intOrNullElseNull)`() {
//     withCompilationUnitFromFile("expressions/operations/elvis") {
//         placeholderWithName("intOrNullElseNull") shouldHaveType IntOrNull
//     }
// }
//
// @Test
// fun `elvis operator with nullable left operand should have lowest common supertype of non-nullable left operand and right operand (intOrNullElseInt)`() {
//     withCompilationUnitFromFile("expressions/operations/elvis") {
//         placeholderWithName("intOrNullElseInt") shouldHaveType Int
//     }
// }
//
// @Test
// fun `elvis operator with nullable left operand should have lowest common supertype of non-nullable left operand and right operand (intOrNullElseFloat)`() {
//     withCompilationUnitFromFile("expressions/operations/elvis") {
//         placeholderWithName("intOrNullElseFloat") shouldHaveType Number
//     }
// }
//
// @Test
// fun `elvis operator with nullable left operand should have lowest common supertype of non-nullable left operand and right operand (intOrNullElseString)`() {
//     withCompilationUnitFromFile("expressions/operations/elvis") {
//         placeholderWithName("intOrNullElseString") shouldHaveType Any
//     }
// }
//
// @Test
// fun `elvis operator with nullable left operand should have lowest common supertype of non-nullable left operand and right operand (intOrNullElseStringOrNull)`() {
//     withCompilationUnitFromFile("expressions/operations/elvis") {
//         placeholderWithName("intOrNullElseStringOrNull") shouldHaveType AnyOrNull
//     }
// }
// }
//
// // *****************************************************************************************************************
// // Types
// // ****************************************************************************************************************/
//
// @Nested
// inner class CallableTypes {
//
//     @Test
//     fun `callable type should have callable type with respective parameters and results`() {
//     withCompilationUnitFromFile("types/callableTypes") {
//     descendants<SdsCallableType>().forEach { callableType ->
//     callableType shouldHaveType CallableType(
//         callableType.parametersOrEmpty().map { it.type() },
// callableType.resultsOrEmpty().map { it.type() },
// )
// }
// }
// }
// }
//
// @Nested
// inner class MemberTypes {
//
//     @Test
//     fun `non-nullable member type should have type of referenced member`() {
//     withCompilationUnitFromFile("types/memberTypes") {
//     findUniqueDeclarationOrFail<SdsFunction>("nonNullableMemberTypes")
// .descendants<SdsMemberType>().forEach {
//     it shouldHaveType it.member
// }
// }
// }
//
// @Test
// fun `nullable member type should have nullable type of referenced member`() {
//     withCompilationUnitFromFile("types/memberTypes") {
//         findUniqueDeclarationOrFail<SdsFunction>("nullableMemberTypes")
//             .descendants<SdsMemberType>().forEach {
//             it shouldHaveType it.member.type().setIsNullableOnCopy(isNullable = true)
//         }
//     }
// }
// }
//
// @Nested
// inner class NamedTypes {
//
//     @Test
//     fun `non-nullable named type should have type of referenced declaration`() {
//     withCompilationUnitFromFile("types/namedTypes") {
//     findUniqueDeclarationOrFail<SdsFunction>("nonNullableNamedTypes")
// .descendants<SdsNamedType>().forEach {
//     it shouldHaveType it.declaration
// }
// }
// }
//
// @Test
// fun `nullable named type should have nullable type of referenced declaration`() {
//     withCompilationUnitFromFile("types/namedTypes") {
//         findUniqueDeclarationOrFail<SdsFunction>("nullableNamedTypes")
//             .descendants<SdsNamedType>().forEach {
//             it shouldHaveType it.declaration.type().setIsNullableOnCopy(isNullable = true)
//         }
//     }
// }
// }

// @Nested
// inner class UnionTypes {
//
//     @Test
//     fun `union type should have union type over its type arguments`() {
//     withCompilationUnitFromFile("types/unionTypes") {
//     descendants<SdsUnionType>().forEach { unionType ->
//     unionType shouldHaveType UnionType(
//         unionType.typeArgumentsOrEmpty().map { it.type() }.toSet(),
// )
// }
// }
// }
// }
//
// // *****************************************************************************************************************
// // Helpers
// // ****************************************************************************************************************/
//
// infix fun SdsAbstractObject.shouldHaveType(expectedType: Type) {
//     this.type().shouldBe(expectedType)
// }
//
// infix fun SdsAbstractObject.shouldHaveType(expected: SdsAbstractObject) {
//     this.type().shouldBe(expected.type())
// }
//
// private fun SdsPlaceholder.assignedValueOrFail(): SdsAbstractObject {
//     return this.assignedOrNull()
//         ?: throw IllegalArgumentException("No value is assigned to placeholder with name '$name'.")
// }
//
// private fun SdsCompilationUnit.placeholderWithName(name: String): SdsPlaceholder {
//     val candidates = this.eAllContents().asSequence()
//         .filterIsInstance<SdsPlaceholder>()
//         .filter { it.name == name }
// .toList()
//
//     when (candidates.size) {
//         1 -> return candidates.first()
//     else -> throw IllegalArgumentException("File contains ${candidates.size} placeholders with name '$name'.")
//     }
// }
//
// private fun withCompilationUnitFromFile(file: String, lambda: SdsCompilationUnit.() -> Unit) {
//     val program = Files.readString(Path.of(testRoot, "$file.${SdsFileExtension.Test}"))
//     val compilationUnit = parseHelper.parseProgramText(program)
//         ?: throw IllegalArgumentException("File is not a compilation unit.")
//     compilationUnit.apply(lambda)
// }
//
// private val SdsCompilationUnit.Any get() = stdlibType(this, StdlibClasses.Any)
// private val SdsCompilationUnit.AnyOrNull get() = stdlibType(this, StdlibClasses.Any, isNullable = true)
// private val SdsCompilationUnit.Boolean get() = stdlibType(this, StdlibClasses.Boolean)
// private val SdsCompilationUnit.Number get() = stdlibType(this, StdlibClasses.Number)
// private val SdsCompilationUnit.Float get() = stdlibType(this, StdlibClasses.Float)
// private val SdsCompilationUnit.Int get() = stdlibType(this, StdlibClasses.Int)
// private val SdsCompilationUnit.IntOrNull get() = stdlibType(this, StdlibClasses.Int, isNullable = true)
// private val SdsCompilationUnit.Nothing get() = stdlibType(this, StdlibClasses.Nothing)
// private val SdsCompilationUnit.NothingOrNull get() = stdlibType(this, StdlibClasses.Nothing, isNullable = true)
// private val SdsCompilationUnit.String get() = stdlibType(this, StdlibClasses.String)
// }

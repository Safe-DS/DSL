import { AstNode, AstNodeLocator, getDocument, WorkspaceCache } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsCoreClasses } from '../builtins/safe-ds-core-classes.js';
import {
    CallableType,
    ClassType,
    EnumType,
    EnumVariantType,
    NamedTupleType,
    NamedTupleEntry,
    NotImplementedType,
    Type,
    UnionType,
    UnknownType,
} from './model.js';
import {
    isSdsAnnotation,
    isSdsArgument,
    isSdsAssignee,
    isSdsAttribute,
    isSdsBoolean,
    isSdsCallableType,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsExpression,
    isSdsFloat,
    isSdsFunction,
    isSdsInfixOperation,
    isSdsInt,
    isSdsLiteralType,
    isSdsMemberAccess,
    isSdsMemberType,
    isSdsNamedType,
    isSdsNull,
    isSdsParameter,
    isSdsParenthesizedExpression,
    isSdsPipeline,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsResult,
    isSdsSegment,
    isSdsString,
    isSdsTemplateString,
    isSdsType,
    isSdsTypeProjection,
    isSdsUnionType,
    SdsAssignee,
    SdsCallableType,
    SdsClass,
    SdsDeclaration,
    SdsExpression,
    SdsFunction,
    SdsInfixOperation,
    SdsParameter,
    SdsPrefixOperation,
    SdsSegment,
    SdsType,
} from '../generated/ast.js';
import { parametersOrEmpty, resultsOrEmpty, typeArgumentsOrEmpty } from '../helpers/shortcuts.js';

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
            return UnknownType;
        }

        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        return this.typeCache.get(key, () => this.doComputeType(node));
    }

    // fun SdsAbstractObject.hasPrimitiveType(): Boolean {
    //     val type = type()
    //     if (type !is ClassType) {
    //         return false
    //     }
    //
    //     val qualifiedName = type.sdsClass.qualifiedNameOrNull()
    //     return qualifiedName in setOf(
    //         StdlibClasses.Boolean,
    //         StdlibClasses.Float,
    //         StdlibClasses.Int,
    //         StdlibClasses.String,
    //     )
    // }

    private doComputeType(node: AstNode): Type {
        if (isSdsAssignee(node)) {
            return this.computeTypeOfAssignee(node);
        } else if (isSdsDeclaration(node)) {
            return this.computeTypeOfDeclaration(node);
        } else if (isSdsExpression(node)) {
            return this.computeTypeOfExpression(node);
        } else if (isSdsType(node)) {
            return this.computeTypeOfType(node);
        } else if (isSdsTypeProjection(node)) {
            return this.computeTypeOfType(node.type);
        } else {
            return NotImplementedType;
        }
    }

    private computeTypeOfAssignee(_node: SdsAssignee): Type {
        return NotImplementedType;

        // return when {
        //     this.eIsProxy() -> UnresolvedType
        //     this is SdsBlockLambdaResult || this is SdsPlaceholder || this is SdsYield -> {
        //         val assigned = assignedOrNull() ?: return Nothing(context)
        //         assigned.inferType(context)
        //     }
        // else -> Any(context)
        // }
    }

    private computeTypeOfDeclaration(node: SdsDeclaration): Type {
        if (isSdsAnnotation(node)) {
            const parameterEntries = parametersOrEmpty(node.parameterList).map(
                (it) => new NamedTupleEntry(it.name, this.computeType(it.type)),
            );

            return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType([]));
        } else if (isSdsAttribute(node)) {
            return this.computeType(node.type);
        } else if (isSdsClass(node)) {
            return new ClassType(node, false);
        } else if (isSdsEnum(node)) {
            return new EnumType(node, false);
        } else if (isSdsEnumVariant(node)) {
            return new EnumVariantType(node, false);
        } else if (isSdsFunction(node)) {
            return this.computeTypeOfCallableWithManifestTypes(node);
        } else if (isSdsParameter(node)) {
            return this.computeTypeOfParameter(node);
        } else if (isSdsPipeline(node)) {
            return UnknownType;
        } else if (isSdsResult(node)) {
            return this.computeType(node.type);
        } else if (isSdsSegment(node)) {
            return this.computeTypeOfCallableWithManifestTypes(node);
        }

        /* c8 skip next */
        return UnknownType;
    }

    private computeTypeOfCallableWithManifestTypes(node: SdsFunction | SdsSegment | SdsCallableType): Type {
        const parameterEntries = parametersOrEmpty(node.parameterList).map(
            (it) => new NamedTupleEntry(it.name, this.computeType(it.type)),
        );
        const resultEntries = resultsOrEmpty(node.resultList).map(
            (it) => new NamedTupleEntry(it.name, this.computeType(it.type)),
        );

        return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
    }

    private computeTypeOfParameter(_node: SdsParameter): Type {
        return NotImplementedType;

        // // Declared parameter type
        // if (this.type != null) {
        //     val declaredParameterType = this.type.inferTypeForType(context)
        //     return when {
        //         this.isVariadic -> VariadicType(declaredParameterType)
        //     else -> declaredParameterType
        //     }
        // }
        //
        // // Inferred lambda parameter type
        // val callable = this.closestAncestorOrNull<SdsAbstractCallable>()
        // val thisIndex = callable.parametersOrEmpty().indexOf(this)
        // if (callable is SdsAbstractLambda) {
        //     val containerType = when (val container = callable.eContainer()) {
        //         is SdsArgument -> container.parameterOrNull()?.inferType(context)
        //         is SdsAssignment ->
        //             container
        //                 .yieldsOrEmpty()
        //                 .find { it.assignedOrNull() == callable }
        //     ?.result
        //             ?.inferType(context)
        //     else -> null
        //     }
        //
        //     return when (containerType) {
        //         is CallableType -> containerType.parameters.getOrElse(thisIndex) { Any(context) }
        //     else -> Any(context)
        //     }
        // }
        //
        // // We don't know better
        // return Any(context)
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
        else if (isSdsArgument(node)) {
            return this.computeType(node.value);
        } else if (isSdsInfixOperation(node)) {
            switch (node.operator) {
                // Boolean operators
                case 'or':
                case 'and':
                    return this.Boolean();

                // Equality operators
                case '==':
                case '!=':
                case '===':
                case '!==':
                    return this.Boolean();

                // Comparison operators
                case '<':
                case '<=':
                case '>=':
                case '>':
                    return this.Boolean();

                // Arithmetic operators
                case '+':
                case '-':
                case '*':
                case '/':
                    return this.computeTypeOfArithmeticInfixOperation(node);

                // Elvis operator
                case '?:':
                    return this.computeTypeOfElvisOperation(node);
            }
        } else if (isSdsMemberAccess(node)) {
            const memberType = this.computeType(node.member);
            return memberType.copyWithNullability(node.isNullSafe || memberType.isNullable);
        } else if (isSdsParenthesizedExpression(node)) {
            return this.computeType(node.expression);
        } else if (isSdsPrefixOperation(node)) {
            switch (node.operator) {
                case 'not':
                    return this.Boolean();
                case '-':
                    return this.computeTypeOfArithmeticPrefixOperation(node);
            }
        } else if (isSdsReference(node)) {
            return this.computeType(node.target.ref);
        }

        return NotImplementedType;

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
    }

    private computeTypeOfArithmeticInfixOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        const rightOperandType = this.computeType(node.rightOperand);

        if (leftOperandType === this.Int() && rightOperandType === this.Int()) {
            return this.Int();
        } else {
            return this.Float();
        }
    }

    private computeTypeOfElvisOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        if (leftOperandType.isNullable) {
            const rightOperandType = this.computeType(node.rightOperand);
            return this.lowestCommonSupertype(leftOperandType.copyWithNullability(false), rightOperandType);
        } else {
            return leftOperandType;
        }
    }

    private computeTypeOfArithmeticPrefixOperation(node: SdsPrefixOperation): Type {
        const leftOperandType = this.computeType(node.operand);

        if (leftOperandType === this.Int()) {
            return this.Int();
        } else {
            return this.Float();
        }
    }

    private computeTypeOfType(node: SdsType): Type {
        if (isSdsCallableType(node)) {
            return this.computeTypeOfCallableWithManifestTypes(node);
        } else if (isSdsLiteralType(node)) {
            return NotImplementedType;
        } else if (isSdsMemberType(node)) {
            return this.computeType(node.member);
        } else if (isSdsNamedType(node)) {
            return this.computeType(node.declaration.ref).copyWithNullability(node.isNullable);
        } else if (isSdsUnionType(node)) {
            const typeArguments = typeArgumentsOrEmpty(node.typeArgumentList);
            return new UnionType(typeArguments.map((typeArgument) => this.computeType(typeArgument.value)));
        }

        /* c8 skip next */
        return UnknownType;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------------------------------------------------

    private lowestCommonSupertype(..._types: Type[]): Type {
        return NotImplementedType;
    }

    // private fun lowestCommonSupertype(context: EObject, types: List<Type>): Type {
    //     if (types.isEmpty()) {
    //         return Nothing(context)
    //     }
    //
    //     val unwrappedTypes = unwrapUnionTypes(types)
    //     val isNullable = unwrappedTypes.any { it.isNullable }
    //     var candidate = unwrappedTypes.first().setIsNullableOnCopy(isNullable)
    //
    //     while (!isLowestCommonSupertype(candidate, unwrappedTypes)) {
    //         candidate = when (candidate) {
    //             is CallableType -> Any(context, candidate.isNullable)
    //             is ClassType -> {
    //                 val superClass = candidate.sdsClass.superClasses().firstOrNull()
    //                     ?: return Any(context, candidate.isNullable)
    //
    //                 ClassType(superClass, typeParametersTypes, candidate.isNullable)
    //             }
    //             is EnumType -> Any(context, candidate.isNullable)
    //             is EnumVariantType -> {
    //                 val containingEnum = candidate.sdsEnumVariant.containingEnumOrNull()
    //                     ?: return Any(context, candidate.isNullable)
    //                 EnumType(containingEnum, candidate.isNullable)
    //             }
    //             is RecordType -> Any(context, candidate.isNullable)
    //             // TODO: Correct ?
    //             is UnionType -> throw AssertionError("Union types should have been unwrapped.")
    //             UnresolvedType -> Any(context, candidate.isNullable)
    //             is VariadicType -> Any(context, candidate.isNullable)
    //         }
    //     }
    //
    //     return candidate
    // }
    //
    // private fun unwrapUnionTypes(types: List<Type>): List<Type> {
    //     return types.flatMap {
    //         when (it) {
    //             is UnionType -> it.possibleTypes
    //         else -> listOf(it)
    //         }
    //     }
    // }
    //
    // private fun isLowestCommonSupertype(candidate: Type, otherTypes: List<Type>): Boolean {
    //     if (candidate is ClassType && candidate.sdsClass.qualifiedNameOrNull() == StdlibClasses.Any) {
    //         return true
    //     }
    //
    //     return otherTypes.all { it.isSubstitutableFor(candidate) }
    // }

    // -----------------------------------------------------------------------------------------------------------------
    // Builtin types
    // -----------------------------------------------------------------------------------------------------------------

    private cachedAny: Type = UnknownType;

    private Any(): Type {
        if (this.cachedAny === UnknownType) {
            this.cachedAny = this.createCoreType(this.coreClasses.Any);
        }
        return this.cachedAny;
    }

    private cachedBoolean: Type = UnknownType;

    private Boolean(): Type {
        if (this.cachedBoolean === UnknownType) {
            this.cachedBoolean = this.createCoreType(this.coreClasses.Boolean);
        }
        return this.cachedBoolean;
    }

    private cachedFloat: Type = UnknownType;

    private Float(): Type {
        if (this.cachedFloat === UnknownType) {
            this.cachedFloat = this.createCoreType(this.coreClasses.Float);
        }
        return this.cachedFloat;
    }

    private cachedInt: Type = UnknownType;

    private Int(): Type {
        if (this.cachedInt === UnknownType) {
            this.cachedInt = this.createCoreType(this.coreClasses.Int);
        }
        return this.cachedInt;
    }

    private cachedNothingOrNull: Type = UnknownType;
    private cachedNothing: Type = UnknownType;

    private Nothing(isNullable: boolean): Type {
        if (isNullable) {
            if (this.cachedNothingOrNull === UnknownType) {
                this.cachedNothingOrNull = this.createCoreType(this.coreClasses.Nothing, true);
            }
            return this.cachedNothingOrNull;
        } else {
            if (this.cachedNothing === UnknownType) {
                this.cachedNothing = this.createCoreType(this.coreClasses.Nothing);
            }
            return this.cachedNothing;
        }
    }

    private cachedString: Type = UnknownType;

    private String(): Type {
        if (this.cachedString === UnknownType) {
            this.cachedString = this.createCoreType(this.coreClasses.String);
        }
        return this.cachedString;
    }

    private createCoreType(coreClass: SdsClass | undefined, isNullable: boolean = false): Type {
        if (coreClass) {
            return new ClassType(coreClass, isNullable);
        } else {
            return UnknownType;
        }
    }
}

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

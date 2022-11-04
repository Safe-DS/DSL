package com.larsreimann.safeds.staticAnalysis.schema

import com.larsreimann.safeds.constant.SdsSchemaEffect
import com.larsreimann.safeds.constant.hasSchemaKind
import com.larsreimann.safeds.constant.nameToSchemaEffect
import com.larsreimann.safeds.emf.argumentsOrEmpty
import com.larsreimann.safeds.emf.containingClassOrNull
import com.larsreimann.safeds.emf.typeArgumentsOrEmpty
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractLiteral
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsSchemaPlaceholder
import com.larsreimann.safeds.safeDS.SdsSchemaReference
import com.larsreimann.safeds.safeDS.SdsSchemaType
import com.larsreimann.safeds.safeDS.SdsString
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsTypeProjection
import com.larsreimann.safeds.staticAnalysis.assignedOrNull
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.naming.QualifiedName
import java.nio.file.Path

@OptIn(ExperimentalSdsApi::class)
internal fun inferSchema(
    predicate: SdsPredicate,
    predicateCall: SdsCall,
    workflowContext: Map<SchemaOwner, SchemaResult>,
    localContext: Map<SdsAbstractAssignee, SchemaResult>,
    parmArgPairs: List<ParmArgPairs>,
): SchemaResult {
    val argumentValueResults =
        predicateCall.argumentsOrEmpty().map {
            getArgumentValueResult(it, workflowContext, localContext, parmArgPairs)
        } +
            predicateCall.typeArgumentsOrEmpty().map {
                getTypeArgumentValueResult(it, parmArgPairs)
            }

    try {
        return when (predicate.nameToSchemaEffect()) {
            SdsSchemaEffect.NoSchemaEffect -> SchemaResult.UnComputable
            SdsSchemaEffect.ReadSchemaEffect -> readSchemaEffect(predicateCall, argumentValueResults)
            SdsSchemaEffect.CheckColumnEffect -> checkColumn(argumentValueResults)
            SdsSchemaEffect.RemoveColumnEffect -> removeColumn(argumentValueResults)
            SdsSchemaEffect.KeepColumnEffect -> keepColumn(argumentValueResults)
            SdsSchemaEffect.RenameColumnEffect -> renameColumn(argumentValueResults)
            SdsSchemaEffect.AddColumnEffect -> addColumn(argumentValueResults)
            SdsSchemaEffect.ChangeColumnTypeEffect -> changeColumnType(argumentValueResults)
        }
    } catch (e: ClassCastException) {
        return SchemaResult.UnComputable
    }
}

private fun readSchemaEffect(
    predicateCall: SdsCall,
    argumentValueResults: List<ArgResult>,
): SchemaResult {
    val pathArg = argValue<Pair<String, SdsArgument>>(
        argumentValueResults.firstOrNull(),
    ) ?: return SchemaResult.UnComputable

    // TODO: Read schema from file first
    val schemaRead = inferInitialSchema(predicateCall, Path.of(pathArg.first))
        ?: return SchemaResult.PredicateResult(
            SchemaResult.Error(
                "Dataset could not be read.",
                pathArg.second,
                ErrorCode.DatasetCouldNotBeRead,
            ),
        )

    val schema = sdsSchemaToSchemaDF(schemaRead)
    val schemaResult = SchemaResult.Schema(schema)
    return SchemaResult.PredicateResult(schemaResult)
}

private fun checkColumn(
    argumentValueResults: List<ArgResult>,
): SchemaResult {
    val schemaResult = argValue<SchemaResult>(
        argumentValueResults.firstOrNull(),
    ) ?: return SchemaResult.UnComputable

    val colNamesArg = variadicArgValue<Pair<String, SdsArgument>>(
        argumentValueResults.lastOrNull(),
    ) ?: return SchemaResult.UnComputable

    if (schemaResult !is SchemaResult.Schema) {
        return SchemaResult.PredicateResult(schemaResult)
    }

    for (columnNameArg in colNamesArg) {
        if (!schemaResult.schema.containsKey(columnNameArg.first)) {
            return SchemaResult.PredicateResult(
                SchemaResult.Error(
                    "Dataset does not have column named '${columnNameArg.first}'.",
                    columnNameArg.second,
                    ErrorCode.DatasetDoesNotHaveAColumn,
                ),
            )
        }
    }

    return SchemaResult.PredicateResult(schemaResult)
}

private fun removeColumn(
    argumentValueResults: List<ArgResult>,
): SchemaResult {
    val schemaResult = argValue<SchemaResult>(
        argumentValueResults.firstOrNull(),
    ) ?: return SchemaResult.UnComputable
    val colNamesArg = variadicArgValue<Pair<String, SdsArgument>>(
        argumentValueResults.lastOrNull(),
    ) ?: return SchemaResult.UnComputable

    if (schemaResult !is SchemaResult.Schema) {
        return SchemaResult.PredicateResult(schemaResult)
    }

    val newSchema = schemaResult.schema.mapNotNull {
        for (columnNamePair in colNamesArg) {
            if (columnNamePair.first == it.key) {
                return@mapNotNull null
            }
        }
        it.key to it.value
    }.toMap()

    val newSchemaResult = SchemaResult.Schema(newSchema)
    return SchemaResult.PredicateResult(newSchemaResult)
}

private fun keepColumn(
    argumentValueResults: List<ArgResult>,
): SchemaResult {
    val schemaResult = argValue<SchemaResult>(
        argumentValueResults.firstOrNull(),
    ) ?: return SchemaResult.UnComputable
    val colNamesArg = variadicArgValue<Pair<String, SdsArgument>>(
        argumentValueResults.lastOrNull(),
    ) ?: return SchemaResult.UnComputable

    if (schemaResult !is SchemaResult.Schema) {
        return SchemaResult.PredicateResult(schemaResult)
    }

    val newSchema = schemaResult.schema.mapNotNull {
        for (columnName in colNamesArg) {
            if (columnName.first == it.key) {
                return@mapNotNull it.key to it.value
            }
        }
        null
    }.toMap()

    val newSchemaResult = SchemaResult.Schema(newSchema)
    return SchemaResult.PredicateResult(newSchemaResult)
}

private fun renameColumn(
    argumentValueResults: List<ArgResult>,
): SchemaResult {
    val schemaResult = argValue<SchemaResult>(
        argumentValueResults.firstOrNull(),
    ) ?: return SchemaResult.UnComputable

    val currentColNameArg = argValue<Pair<String, SdsArgument>>(
        argumentValueResults.get(1),
    ) ?: return SchemaResult.UnComputable

    val newColNameArg = argValue<Pair<String, SdsArgument>>(
        argumentValueResults.lastOrNull(),
    ) ?: return SchemaResult.UnComputable

    if (schemaResult !is SchemaResult.Schema) {
        return SchemaResult.PredicateResult(schemaResult)
    }

    if (schemaResult.schema.containsKey(newColNameArg.first)) {
        return SchemaResult.PredicateResult(
            SchemaResult.Error(
                "Dataset already has column named '${newColNameArg.first}'.",
                newColNameArg.second,
                ErrorCode.DatasetAlreadyHasAColumn,
            ),
        )
    }

    val newSchema = schemaResult.schema.map {
        if (currentColNameArg.first == it.key) {
            return@map newColNameArg.first to it.value
        }

        it.key to it.value
    }.toMap()

    val newSchemaResult = SchemaResult.Schema(newSchema)
    return SchemaResult.PredicateResult(newSchemaResult)
}

private fun addColumn(
    argumentValueResults: List<ArgResult>,
): SchemaResult {
    val schemaResult = argValue<SchemaResult>(
        argumentValueResults.firstOrNull(),
    ) ?: return SchemaResult.UnComputable

    val newColNameArg = argValue<Pair<String, SdsArgument>>(
        argumentValueResults.get(1),
    ) ?: return SchemaResult.UnComputable

    val newColDataTypeArg = argValue<Pair<QualifiedName, SdsArgument>>(
        argumentValueResults.lastOrNull(),
    ) ?: return SchemaResult.UnComputable

    if (schemaResult !is SchemaResult.Schema) {
        return SchemaResult.PredicateResult(schemaResult)
    }

    val newSchema = schemaResult.schema + Pair(newColNameArg.first, newColDataTypeArg.first)

    val newSchemaResult = SchemaResult.Schema(newSchema)
    return SchemaResult.PredicateResult(newSchemaResult)
}

private fun changeColumnType(
    argumentValueResults: List<ArgResult>,
): SchemaResult {
    val schemaResult = argValue<SchemaResult>(
        argumentValueResults.firstOrNull(),
    ) ?: return SchemaResult.UnComputable

    val currentColNameArg = argValue<Pair<String, SdsArgument>>(
        argumentValueResults.get(1),
    ) ?: return SchemaResult.UnComputable

    val newColDataTypeArg = argValue<Pair<QualifiedName, SdsArgument>>(
        argumentValueResults.lastOrNull(),
    ) ?: return SchemaResult.UnComputable

    if (schemaResult !is SchemaResult.Schema) {
        return SchemaResult.PredicateResult(schemaResult)
    }

    val newSchema = schemaResult.schema.map {
        if (currentColNameArg.first == it.key) {
            return@map it.key to newColDataTypeArg.first
        }

        it.key to it.value
    }.toMap()

    val newSchemaResult = SchemaResult.Schema(newSchema)
    return SchemaResult.PredicateResult(newSchemaResult)
}

sealed interface ParmArgPairs {
    class Parm_Arg_Pair(val parm_Arg: Pair<SdsParameter, SdsArgument>) : ParmArgPairs
    class TypeParm_TypeArg_Pair(val Typeparm_TypeArg: Pair<SdsTypeParameter, SdsTypeArgument>) : ParmArgPairs
}

sealed interface ArgResult {
    object UnResolved : ArgResult

    abstract class AbstractVariadicResult : ArgResult
    abstract class AbstractSimpleResult : ArgResult

    class StringValue(val stringArg: Pair<String, SdsArgument>) : AbstractSimpleResult()
    class StringListValue(val stringListArg: List<Pair<String, SdsArgument>>) : AbstractVariadicResult()

    class SchemaResultValue(val schemaResult: SchemaResult) : ArgResult

    class DataTypeValue(val qualifiedNameArg: Pair<QualifiedName, SdsTypeArgument>) : ArgResult
}

// Helper functions --------------------------------------------------------------------------------

private fun getArgumentValueResult(
    argument: SdsArgument,
    workflowContext: Map<SchemaOwner, SchemaResult>,
    localContext: Map<SdsAbstractAssignee, SchemaResult>,
    parmArgPairs: List<ParmArgPairs>,
): ArgResult {
    val schemaResult = when (val owner = predicateArgToSchemaOwner(argument)) {
        is SchemaOwner.Assignee -> localContext.get(owner.assignee)
        is SchemaOwner.CurrentCaller -> workflowContext.get(SchemaOwner.CurrentCaller)
        else -> null
    }

    if (schemaResult != null) {
        return ArgResult.SchemaResultValue(schemaResult)
    }

    // Try to resolve String(s)
    val referedParam = predicateArgToParamOrNull(argument)
        ?: return ArgResult.UnResolved
    val isVariadic = referedParam.isVariadic

    val strings = parmArgPairs.mapNotNull {
        val argPair = it as? ParmArgPairs.Parm_Arg_Pair
            ?: return@mapNotNull null

        val pram = argPair.parm_Arg.first
        val arg = argPair.parm_Arg.second

        if (pram != referedParam) {
            return@mapNotNull null
        }

        val literal = arg.literalOrNull()
        val string = (literal as? SdsString)?.value

        if (string == null) {
            return@mapNotNull null
        }

        Pair(string, arg)
    }

    if (!strings.isEmpty()) {
        if (isVariadic) {
            return ArgResult.StringListValue(strings)
        }
        if (!isVariadic && strings.count() == 1) {
            return ArgResult.StringValue(strings.first())
        }
    }

    return ArgResult.UnResolved // Could not resolve
}

private fun getTypeArgumentValueResult(
    typeArgument: SdsTypeArgument,
    parmArgPairs: List<ParmArgPairs>,
): ArgResult {
    // Try to resolve Datatype
    val referedTypeParam = predicateTypeArgToTypeParamOrNull(typeArgument)
        ?: return ArgResult.UnResolved

    val datatype = parmArgPairs.mapNotNull {
        val argPair = it as? ParmArgPairs.TypeParm_TypeArg_Pair
            ?: return@mapNotNull null

        val tPram = argPair.Typeparm_TypeArg.first
        val tArg = argPair.Typeparm_TypeArg.second

        if (tPram != referedTypeParam) {
            return@mapNotNull null
        }

        val dataTypeName = tArg.dataTypeNameOrNull()
            ?: return@mapNotNull null

        Pair(dataTypeName, tArg)
    }

    if (datatype.count() == 1) {
        return ArgResult.DataTypeValue(datatype.first())
    }

    return ArgResult.UnResolved // Could not resolve
}

fun SdsArgument.literalOrNull(): SdsAbstractLiteral? {
    var current: EObject? = this.value

    while (current != null) {
        current = when {
            current.eIsProxy() -> return null
            current is SdsReference -> current.declaration
            current is SdsPlaceholder -> current.assignedOrNull()
            current is SdsAbstractLiteral -> return current
            else -> return null
        }
    }
    return null
}

fun SdsTypeArgument.dataTypeNameOrNull(): QualifiedName? {
    var current: Any? = this.value

    while (current != null) {
        current = when {
            current is SdsTypeProjection -> current.type
            current is SdsNamedType -> current.declaration
            current is SdsClass -> current.type()
            current is ClassType -> return current.sdsClass.qualifiedNameOrNull()
            else -> return null
        }
    }
    return null
}

/*
 * Only used for Predicate's arguments
 */
private fun predicateArgToParamOrNull(sdsArgument: SdsArgument): SdsParameter? {
    var current: EObject? = sdsArgument.value
    while (current != null) {
        current = when {
            current.eIsProxy() -> return null
            current is SdsReference -> current.declaration
            current is SdsParameter -> return current
            else -> return null
        }
    }
    return null
}

/*
 * Only used for Predicate's arguments
 */
private fun predicateTypeArgToTypeParamOrNull(sdsTypeArgument: SdsTypeArgument): SdsTypeParameter? {
    var current: EObject? = sdsTypeArgument.value
    while (current != null) {
        current = when {
            current.eIsProxy() -> return null
            current is SdsTypeProjection -> current.type
            current is SdsNamedType -> current.declaration
            current is SdsTypeParameter -> return current
            else -> return null
        }
    }
    return null
}

/*
 * Only used for Predicate's arguments
 */
@OptIn(ExperimentalSdsApi::class)
private fun predicateArgToSchemaOwner(sdsArgument: SdsArgument): SchemaOwner? {
    var current: EObject? = sdsArgument.value
    while (current != null) {
        current = when {
            current.eIsProxy() -> return null
            current is SdsSchemaReference -> current.type
            current is SdsSchemaType -> current.declaration

            // Locally defined schema in function definition
            current is SdsSchemaPlaceholder -> return SchemaOwner.Assignee(current)

            // Refering to the caller's schema
            current is SdsTypeParameter && current.hasSchemaKind() -> current.containingClassOrNull()
            current is SdsClass -> return SchemaOwner.CurrentCaller

            else -> return null
        }
    }
    return null
}

private fun <ReturnType> variadicArgValue(
    lastArgumentValueResult: ArgResult?,
): List<ReturnType>? {
    return when (lastArgumentValueResult) {
        is ArgResult.AbstractVariadicResult -> argValue<List<ReturnType>>(lastArgumentValueResult)
        is ArgResult.AbstractSimpleResult -> listOfNotNull(argValue<ReturnType>(lastArgumentValueResult))
        else -> null
    }
}

@Suppress("UNCHECKED_CAST")
private fun <ReturnType> argValue(
    argumentValueResult: ArgResult?,
): ReturnType? {
    return when (argumentValueResult) {
        is ArgResult.SchemaResultValue -> argumentValueResult.schemaResult as? ReturnType
        is ArgResult.StringListValue -> argumentValueResult.stringListArg as? ReturnType
        is ArgResult.StringValue -> argumentValueResult.stringArg as? ReturnType
        is ArgResult.DataTypeValue -> argumentValueResult.qualifiedNameArg as? ReturnType
        else -> null
    }
}

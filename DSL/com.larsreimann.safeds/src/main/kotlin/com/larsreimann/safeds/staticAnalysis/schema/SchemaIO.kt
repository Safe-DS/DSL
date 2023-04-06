package com.larsreimann.safeds.staticAnalysis.schema

import com.larsreimann.safeds.emf.createSdsColumn
import com.larsreimann.safeds.emf.createSdsNamedType
import com.larsreimann.safeds.emf.createSdsSchema
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsSchema
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.stdlibAccess.getStdlibClassOrNull
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.naming.QualifiedName
import org.jetbrains.kotlinx.dataframe.DataFrame
import org.jetbrains.kotlinx.dataframe.io.readCSV
import org.jetbrains.kotlinx.dataframe.typeClass
import java.nio.file.Path
import kotlin.io.path.nameWithoutExtension

@OptIn(ExperimentalSdsApi::class)
internal fun inferInitialSchema(context: EObject, path: Path): SdsSchema? {
    try {
        val name = path.nameWithoutExtension

        val dataFrame = DataFrame.readCSV(path.toFile())
        val columns = dataFrame.columns().map {
            val colQualifiedName: QualifiedName = when (it.typeClass) {
                Double::class -> StdlibClasses.Float
                String::class -> StdlibClasses.String
                Int::class -> StdlibClasses.Int
                Boolean::class -> StdlibClasses.Boolean
                else -> StdlibClasses.Any
            }

            val stdlibClass = context.getStdlibClassOrNull(colQualifiedName) ?: return null

            createSdsColumn(
                columnName = it.name(),
                columnType = createSdsNamedType(stdlibClass, isNullable = true),
            )
        }

        return createSdsSchema(name, columns = columns)
    } catch (e: Exception) {
        return null
    }
}

internal fun sdsSchemaToSchemaDF(sdsSchema: SdsSchema): Map<String, QualifiedName> {
    return sdsSchema.columnList.columns.map {
        val columnName = it.columnName.value
        val classtype = it.columnType.type()

        if (classtype !is ClassType) {
            throw IllegalStateException("ColumnType should be a primitive ClassType")
        }

        val columnType = classtype.sdsClass.qualifiedNameOrNull()
            ?: throw IllegalStateException("Primitive Must Have QualifiedName")
        columnName to columnType
    }.toMap()
}

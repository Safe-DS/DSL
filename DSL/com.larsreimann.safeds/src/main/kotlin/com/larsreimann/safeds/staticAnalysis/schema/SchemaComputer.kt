package com.larsreimann.safeds.staticAnalysis.schema

import com.larsreimann.safeds.emf.createSdsColumn
import com.larsreimann.safeds.emf.createSdsNamedType
import com.larsreimann.safeds.emf.createSdsSchema
import com.larsreimann.safeds.emf.createSdsString
import com.larsreimann.safeds.safeDS.SdsSchema
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.stdlibAccess.getStdlibClassOrNull
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.naming.QualifiedName
import org.jetbrains.kotlinx.dataframe.DataFrame
import org.jetbrains.kotlinx.dataframe.io.readCSV
import org.jetbrains.kotlinx.dataframe.typeClass

fun inferInitialSchema(context: EObject, name: String, path: String): SdsSchema? {
    val dataFrame = DataFrame.readCSV(path)
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
            createSdsString(it.name()),
            createSdsNamedType(stdlibClass, isNullable = true),
        )
    }

    return createSdsSchema(name, columns = columns)
}

package com.larsreimann.safeds.staticAnalysis.schema

import com.larsreimann.safeds.emf.createSdsColumn
import com.larsreimann.safeds.emf.createSdsNamedType
import com.larsreimann.safeds.emf.createSdsSchema
import com.larsreimann.safeds.emf.createSdsString
import com.larsreimann.safeds.safeDS.SdsColumn
import com.larsreimann.safeds.safeDS.SdsSchema
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.stdlibAccess.getStdlibClassOrNull
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.naming.QualifiedName
import tech.tablesaw.api.Table

fun inferInitialSchema(context: EObject, name: String, path: String): SdsSchema? {
    try {
        var colList: List<SdsColumn> = emptyList()

        val table = Table.read().csv(path);

        for (row in table.structure()) {
            val colName = row.getString(1)
            val colType = row.getString(2)
            val colQualifiedName: QualifiedName = when (colType) {
                "DOUBLE" -> StdlibClasses.Float
                "STRING" -> StdlibClasses.String
                "INTEGER" -> StdlibClasses.Int
                "BOOLEAN" -> StdlibClasses.Boolean
                else -> StdlibClasses.Any
            }

            val stdlibClass = context.getStdlibClassOrNull(colQualifiedName) ?: return null

            colList+= createSdsColumn(
                createSdsString(colName),
                createSdsNamedType(stdlibClass, isNullable = true)
            )
        }

        return createSdsSchema(name, columns = colList)
    } catch (e : IllegalStateException){
        return null
    }
}

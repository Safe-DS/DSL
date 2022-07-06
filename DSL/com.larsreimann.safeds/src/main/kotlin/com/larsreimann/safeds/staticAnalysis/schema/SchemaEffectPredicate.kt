package com.larsreimann.safeds.staticAnalysis.schema

import com.larsreimann.safeds.constant.SdsSchemaEffect
import com.larsreimann.safeds.constant.effect
import com.larsreimann.safeds.emf.createSdsNamedType
import com.larsreimann.safeds.emf.createSdsParameter
import com.larsreimann.safeds.emf.createSdsSchemaEffectPredicate
import com.larsreimann.safeds.safeDS.SdsSchemaEffectPredicate
import com.larsreimann.safeds.safeDS.SdsSchemaEffectReference
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.stdlibAccess.getStdlibClassOrNull
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.naming.QualifiedName

@ExperimentalSdsApi
fun SdsSchemaEffectReference.schemaEffectPredicate(): SdsSchemaEffectPredicate? {
    val params = when (effect()) {
        SdsSchemaEffect.ReadSchemaEffect ->
            mapOf(
                "datasetName" to Pair(StdlibClasses.String, false),
                "datasetPath" to Pair(StdlibClasses.String, false),
            )
        else -> return null
    }
    return createSchemaEffectPredicate(this, effect, params)
}

@ExperimentalSdsApi
private fun createSchemaEffectPredicate(
    context: EObject,
    effect: String,
    parameterMap: Map<String, Pair<QualifiedName, Boolean>>,
): SdsSchemaEffectPredicate {
    val parametersList = parameterMap.mapNotNull { (name, props) ->
        val (typeName, isVariadic) = props
        val type = context.getStdlibClassOrNull(typeName)
        when {
            type != null -> createSdsParameter(
                name,
                type = createSdsNamedType(type),
                isVariadic = isVariadic,
            )
            else -> null
        }
    }

    return createSdsSchemaEffectPredicate(
        effect,
        parametersList,
    )
}

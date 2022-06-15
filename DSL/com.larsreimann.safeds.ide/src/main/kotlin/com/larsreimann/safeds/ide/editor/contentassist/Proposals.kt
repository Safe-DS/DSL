package com.larsreimann.safeds.ide.editor.contentassist

import com.larsreimann.safeds.emf.classMembersOrEmpty
import com.larsreimann.safeds.emf.containingClassOrNull
import com.larsreimann.safeds.emf.isClassMember
import com.larsreimann.safeds.emf.isGlobal
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.variantsOrEmpty
import com.larsreimann.safeds.scoping.allGlobalDeclarations
import com.larsreimann.safeds.safeDS.SdsAbstractCallable
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.staticAnalysis.typing.Type
import com.larsreimann.safeds.staticAnalysis.typing.hasPrimitiveType
import com.larsreimann.safeds.staticAnalysis.typing.isSubstitutableFor
import com.larsreimann.safeds.staticAnalysis.typing.type
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.EcoreUtil2

/**
 * Suggests callables that only require primitive values as arguments when called.
 *
 * @param context
 * Any EObject in the current file, e.g. the [SdsCompilationUnit]. This is used to determine which declarations are
 * visible from here.
 *
 * @return
 * A map of URIs to EObjects (SdsClass, SdsFunction, or SdsWorkflowStep).
 */
fun listCallablesWithOnlyPrimitiveParameters(context: EObject): Map<URI, SdsAbstractCallable> {
    return context.allCallables()
        .filterValues { obj ->
            when (obj) {
                is SdsClass -> {
                    obj.parameterList != null && obj.parametersOrEmpty().all {
                        it.hasPrimitiveType()
                    }
                }
                is SdsFunction -> {
                    obj.isGlobal() && obj.parametersOrEmpty().all {
                        it.hasPrimitiveType()
                    }
                }
                is SdsStep -> {
                    obj.parametersOrEmpty().all {
                        it.hasPrimitiveType()
                    }
                }
                else -> false
            }
        }
}

/**
 * Suggests callables that can accept all the given [declarations] as parameters. These callables can still have
 * additional parameters that are not yet assigned.
 *
 * @param context
 * Any EObject in the current file, e.g. the [SdsCompilationUnit]. This is used to determine which declarations are
 * visible from here.
 *
 * @param declarations
 * The declarations that correspond to the result port the user clicked on or null if a new initial call should
 * be added. They should be either SdsPlaceholders or SdsResults. If multiple declarations are specified, a callable
 * must have one matching input port for each.
 *
 * @return
 * A map of URIs to EObjects (SdsClass, SdsFunction, or SdsWorkflowStep).
 */
fun listCallablesWithMatchingParameters(
    context: EObject,
    declarations: List<SdsAbstractDeclaration>
): Map<URI, SdsAbstractCallable> {
    val requiredTypes = declarations.map { it.type() }

    return context.allCallables()
        .filterValues { obj ->
            val availableTypes = when (obj) {
                is SdsClass -> {
                    if (obj.parameterList == null) {
                        return@filterValues false
                    }

                    obj.parametersOrEmpty().map { it.type() }
                }
                is SdsEnumVariant -> {
                    obj.parametersOrEmpty().map { it.type() }
                }
                is SdsFunction -> {
                    val parameterTypes = obj.parametersOrEmpty().map { it.type() }
                    if (obj.isClassMember()) {
                        parameterTypes + obj.containingClassOrNull()!!.type()
                    } else {
                        parameterTypes
                    }
                }
                is SdsStep -> {
                    obj.parametersOrEmpty().map { it.type() }
                }
                else -> return@filterValues false
            }

            typesMatch(requiredTypes, availableTypes)
        }
}

private fun typesMatch(requiredTypes: List<Type>, availableTypes: List<Type>): Boolean {
    if (requiredTypes.isEmpty()) {
        return true
    }

    val requiredType = requiredTypes.first()

    val matchingAvailableTypes = availableTypes.filter { requiredType.isSubstitutableFor(it) }
    if (matchingAvailableTypes.isEmpty()) {
        return false
    }

    return matchingAvailableTypes.any {
        typesMatch(requiredTypes.drop(1), availableTypes - it)
    }
}

/**
 * Lists all [SdsAbstractCallable]s that can be called from the given context.
 */
private fun EObject.allCallables(): Map<URI, SdsAbstractCallable> {
    return allGlobalDeclarations()
        .flatMap {
            when (val obj = it.eObjectOrProxy) {
                is SdsClass -> obj.allNestedCallables().toList()
                is SdsEnum -> obj.variantsOrEmpty()
                is SdsFunction -> listOf(obj)
                is SdsStep -> listOf(obj)
                else -> emptyList()
            }
        }
        .associateBy { EcoreUtil2.getURI(it) }
}

/**
 * Lists all [SdsAbstractCallable]s nested in an [SdsClass].
 */
private fun SdsClass.allNestedCallables(): Sequence<SdsAbstractCallable> = sequence {
    if (parameterList != null) {
        yield(this@allNestedCallables)
    }

    classMembersOrEmpty().forEach {
        when (it) {
            is SdsClass -> yieldAll(it.allNestedCallables())
            is SdsEnum -> yieldAll(it.variantsOrEmpty())
            is SdsFunction -> yield(it)
        }
    }
}

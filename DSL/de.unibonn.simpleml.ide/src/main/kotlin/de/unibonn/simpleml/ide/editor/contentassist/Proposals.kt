package de.unibonn.simpleml.ide.editor.contentassist

import de.unibonn.simpleml.emf.classMembersOrEmpty
import de.unibonn.simpleml.emf.containingClassOrNull
import de.unibonn.simpleml.emf.isClassMember
import de.unibonn.simpleml.emf.isGlobal
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.variantsOrEmpty
import de.unibonn.simpleml.scoping.allGlobalDeclarations
import de.unibonn.simpleml.simpleML.SmlAbstractCallable
import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.staticAnalysis.typing.Type
import de.unibonn.simpleml.staticAnalysis.typing.hasPrimitiveType
import de.unibonn.simpleml.staticAnalysis.typing.isSubstitutableFor
import de.unibonn.simpleml.staticAnalysis.typing.type
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.EcoreUtil2

/**
 * Suggests callables that only require primitive values as arguments when called.
 *
 * @param context
 * Any EObject in the current file, e.g. the [SmlCompilationUnit]. This is used to determine which declarations are
 * visible from here.
 *
 * @return
 * A map of URIs to EObjects (SmlClass, SmlFunction, or SmlWorkflowStep).
 */
fun listCallablesWithOnlyPrimitiveParameters(context: EObject): Map<URI, SmlAbstractCallable> {
    return context.allCallables()
        .filterValues { obj ->
            when (obj) {
                is SmlClass -> {
                    obj.parameterList != null && obj.parametersOrEmpty().all {
                        it.hasPrimitiveType()
                    }
                }
                is SmlFunction -> {
                    obj.isGlobal() && obj.parametersOrEmpty().all {
                        it.hasPrimitiveType()
                    }
                }
                is SmlStep -> {
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
 * Any EObject in the current file, e.g. the [SmlCompilationUnit]. This is used to determine which declarations are
 * visible from here.
 *
 * @param declarations
 * The declarations that correspond to the result port the user clicked on or null if a new initial call should
 * be added. They should be either SmlPlaceholders or SmlResults. If multiple declarations are specified, a callable
 * must have one matching input port for each.
 *
 * @return
 * A map of URIs to EObjects (SmlClass, SmlFunction, or SmlWorkflowStep).
 */
fun listCallablesWithMatchingParameters(
    context: EObject,
    declarations: List<SmlAbstractDeclaration>
): Map<URI, SmlAbstractCallable> {
    val requiredTypes = declarations.map { it.type() }

    return context.allCallables()
        .filterValues { obj ->
            val availableTypes = when (obj) {
                is SmlClass -> {
                    if (obj.parameterList == null) {
                        return@filterValues false
                    }

                    obj.parametersOrEmpty().map { it.type() }
                }
                is SmlEnumVariant -> {
                    obj.parametersOrEmpty().map { it.type() }
                }
                is SmlFunction -> {
                    val parameterTypes = obj.parametersOrEmpty().map { it.type() }
                    if (obj.isClassMember()) {
                        parameterTypes + obj.containingClassOrNull()!!.type()
                    } else {
                        parameterTypes
                    }
                }
                is SmlStep -> {
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
 * Lists all [SmlAbstractCallable]s that can be called from the given context.
 */
private fun EObject.allCallables(): Map<URI, SmlAbstractCallable> {
    return allGlobalDeclarations()
        .flatMap {
            when (val obj = it.eObjectOrProxy) {
                is SmlClass -> obj.allNestedCallables().toList()
                is SmlEnum -> obj.variantsOrEmpty()
                is SmlFunction -> listOf(obj)
                is SmlStep -> listOf(obj)
                else -> emptyList()
            }
        }
        .associateBy { EcoreUtil2.getURI(it) }
}

/**
 * Lists all [SmlAbstractCallable]s nested in an [SmlClass].
 */
private fun SmlClass.allNestedCallables(): Sequence<SmlAbstractCallable> = sequence {
    if (parameterList != null) {
        yield(this@allNestedCallables)
    }

    classMembersOrEmpty().forEach {
        when (it) {
            is SmlClass -> yieldAll(it.allNestedCallables())
            is SmlEnum -> yieldAll(it.variantsOrEmpty())
            is SmlFunction -> yield(it)
        }
    }
}

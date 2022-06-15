package com.larsreimann.safeds.testing.assertions

import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import org.eclipse.emf.ecore.EObject

/**
 * Find a unique declaration among the descendants of the receiver with the given type and name.
 *
 * @receiver Root of the subtree within the EMF model that should be searched.
 * @param name The name the declaration needs to have.
 * @return The unique declaration if it exists.
 * @throws AssertionError If no unique declaration exists.
 */
inline fun <reified T : SdsAbstractDeclaration> EObject.findUniqueDeclarationOrFail(name: String): T {
    shouldHaveUniqueDeclaration<T>(name)
    return this.descendants<T>().find { it.name == name }!!
}

/**
 * Assert that a unique declaration exists among the descendants of the receiver with the given type and name.
 *
 * @receiver Root of the subtree within the EMF model that should be searched.
 * @param name The name the declaration needs to have.
 */
inline fun <reified T : SdsAbstractDeclaration> EObject.shouldHaveUniqueDeclaration(name: String) {
    val candidates = this.descendants<T>().filter { it.name == name }.toList()

    if (candidates.isEmpty()) {
        throw AssertionError("Expected a unique matching fact of type ${T::class.simpleName} but found none.")
    } else if (candidates.size > 1) {
        throw AssertionError("Expected a unique matching fact but found ${candidates.size}: $candidates")
    }
}

fun SdsAbstractDeclaration.shouldBeResolved() {
    if (this.eIsProxy()) {
        throw AssertionError("Expected cross-reference to be resolved but it wasn't.")
    }
}

fun SdsAbstractDeclaration.shouldNotBeResolved() {
    if (!this.eIsProxy()) {
        throw AssertionError("Expected cross-reference to be unresolved but it wasn't.")
    }
}

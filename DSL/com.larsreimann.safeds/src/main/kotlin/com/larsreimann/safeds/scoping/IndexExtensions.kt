package com.larsreimann.safeds.scoping

import com.google.inject.Inject
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.scoping.IndexExtensionsInjectionTarget.containerManager
import com.larsreimann.safeds.scoping.IndexExtensionsInjectionTarget.resourceDescriptionsProvider
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.resource.IContainer
import org.eclipse.xtext.resource.IEObjectDescription
import org.eclipse.xtext.resource.IResourceDescription
import org.eclipse.xtext.resource.IResourceDescriptions
import org.eclipse.xtext.resource.IResourceDescriptionsProvider

internal object IndexExtensionsInjectionTarget {

    @Inject
    lateinit var containerManager: IContainer.Manager

    @Inject
    lateinit var resourceDescriptionsProvider: IResourceDescriptionsProvider
}

/**
 * Returns all global declarations that are visible from this context. If this [EObject] is not in a [Resource] or the
 * [Resource] not in a [ResourceSet] an empty list is returned.
 */
fun EObject.allGlobalDeclarations(): List<IEObjectDescription> {
    return eResource()
        ?.visibleContainers()
        ?.asSequence()
        ?.map { it.exportedObjects }
        ?.flatten()
        ?.filter { it.isGlobalDeclaration() }
        ?.toList()
        .orEmpty()
}

/**
 * Returns all global declarations that are visible from this context and in the same [Resource]. If this [EObject] is
 * not in a [Resource] or the [Resource] not in a [ResourceSet] an empty list is returned.
 */
fun EObject.ownGlobalDeclarations(): List<IEObjectDescription> {
    return eResource()
        ?.resourceDescriptionOrNull()
        ?.exportedObjects
        ?.asSequence()
        ?.filter { it.isGlobalDeclaration() }
        ?.toList()
        .orEmpty()
}

/**
 * Returns all global declarations that are visible from this context but in another [Resource]. If this [EObject] is
 * not in a [Resource] or the [Resource] not in a [ResourceSet] and empty list is returned.
 */
fun EObject.externalGlobalDeclarations(): List<IEObjectDescription> {
    return allGlobalDeclarations() - ownGlobalDeclarations().toSet()
}

/**
 * Returns a list of [IContainer]s that are visible from this [Resource], including this [Resource]. If this [Resource]
 * is not in a [ResourceSet], an empty list is returned. An [IContainer] describes [Resource]s that should be treated
 * as visible on the same level during the scoping stage.
 */
private fun Resource.visibleContainers(): List<IContainer> {
    val resourceSet = this.resourceSet ?: return emptyList()

    return containerManager.getVisibleContainers(
        resourceDescriptionOrNull(),
        resourceSet.resourceDescriptions()
    )
}

/**
 * Returns information about this [Resource] or `null` if the [Resource] is not in a [ResourceSet].
 */
private fun Resource.resourceDescriptionOrNull(): IResourceDescription? {
    return resourceSet?.resourceDescriptions()?.getResourceDescription(uri)
}

/**
 * Returns the information about the [Resource]s in this [ResourceSet].
 */
private fun ResourceSet.resourceDescriptions(): IResourceDescriptions {
    return resourceDescriptionsProvider.getResourceDescriptions(this)
}

/**
 * Returns whether this [IEObjectDescription] should be available in other [Resource]s.
 */
private fun IEObjectDescription.isGlobalDeclaration(): Boolean {
    return this.eClass in setOf(
        Literals.SDS_ANNOTATION,
        Literals.SDS_CLASS,
        Literals.SDS_ENUM,
        Literals.SDS_FUNCTION,
        Literals.SDS_STEP
    )
}

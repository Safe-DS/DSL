package de.unibonn.simpleml.naming

import com.google.inject.Inject
import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import org.eclipse.xtext.naming.IQualifiedNameConverter
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.xtext.naming.QualifiedName

internal object QualifiedNameProviderInjectionTarget {

    @Inject
    lateinit var qualifiedNameConverter: IQualifiedNameConverter

    @Inject
    lateinit var qualifiedNameProvider: IQualifiedNameProvider
}

/**
 * Returns the qualified name of the declaration.
 */
fun SmlAbstractDeclaration.qualifiedNameOrNull(): QualifiedName? {
    return QualifiedNameProviderInjectionTarget.qualifiedNameProvider.getFullyQualifiedName(this)
}

/**
 * Converts a string to a qualified name.
 */
fun String.toQualifiedName(): QualifiedName {
    return QualifiedNameProviderInjectionTarget.qualifiedNameConverter.toQualifiedName(this)
}

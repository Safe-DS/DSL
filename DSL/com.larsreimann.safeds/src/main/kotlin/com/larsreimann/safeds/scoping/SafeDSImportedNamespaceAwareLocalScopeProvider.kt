package com.larsreimann.safeds.scoping

import com.larsreimann.safeds.emf.aliasNameOrNull
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.naming.QualifiedName
import org.eclipse.xtext.scoping.impl.ImportNormalizer
import org.eclipse.xtext.scoping.impl.ImportedNamespaceAwareLocalScopeProvider

class SafeDSImportedNamespaceAwareLocalScopeProvider : ImportedNamespaceAwareLocalScopeProvider() {

    /**
     * Import all declarations from the listed packages implicitly, such as "safeds.lang".
     */
    override fun getImplicitImports(ignoreCase: Boolean): List<ImportNormalizer> {
        return listOf(
            ImportNormalizer(QualifiedName.create("safeds", "lang"), true, ignoreCase)
        )
    }

    /**
     * Import all declarations in the same package implicitly.
     *
     * See Xtext book page 278 for more information.
     */
    override fun internalGetImportedNamespaceResolvers(
        context: EObject,
        ignoreCase: Boolean
    ): List<ImportNormalizer> {

        if (context !is SdsCompilationUnit) {
            return emptyList()
        }

        // Resolve imports - including aliases
        val resolvers = context.imports.mapNotNull {
            createImportedNamespaceResolver(it.importedNamespace, it.aliasNameOrNull(), ignoreCase)
        }.toMutableList()

        // Implicitly import declarations in same package
        context.qualifiedNameOrNull()?.let {
            resolvers += ImportNormalizer(
                it,
                true,
                ignoreCase
            )
        }

        return resolvers
    }

    private fun createImportedNamespaceResolver(
        namespace: String,
        alias: String?,
        ignoreCase: Boolean
    ): ImportNormalizer? {

        if (namespace.isEmpty()) {
            return null
        } else if (alias == null) {
            return createImportedNamespaceResolver(namespace, ignoreCase)
        }

        val importedNamespace = qualifiedNameConverter.toQualifiedName(namespace)
        if (importedNamespace == null || importedNamespace.isEmpty) {
            return null
        }

        return when {
            hasWildCard(importedNamespace, ignoreCase) -> null
            else -> ImportWithAliasNormalizer(importedNamespace, QualifiedName.create(alias), ignoreCase)
        }
    }

    private fun hasWildCard(importedNamespace: QualifiedName, ignoreCase: Boolean): Boolean {
        return when {
            ignoreCase -> importedNamespace.lastSegment.equals(wildCard, ignoreCase = true)
            else -> importedNamespace.lastSegment == wildCard
        }
    }
}

data class ImportWithAliasNormalizer(
    val importedNamespace: QualifiedName,
    val alias: QualifiedName,
    val ignoreCase: Boolean
) : ImportNormalizer(importedNamespace, false, ignoreCase) {

    init {
        require(!(importedNamespace.isEmpty)) { "Imported namespace must not be empty." }
        require(alias.segmentCount == 1) { "Alias must have exactly one segment." }
    }

    /**
     * Converts a fully qualified name to the simple alias that can be used to refer to a declaration. If this
     * normalizer is not responsible for the given fully qualified name, null is returned instead.
     */
    override fun deresolve(fullyQualifiedName: QualifiedName): QualifiedName? {
        return when {
            ignoreCase && fullyQualifiedName.equalsIgnoreCase(importedNamespacePrefix) -> alias
            !ignoreCase && fullyQualifiedName == importedNamespacePrefix -> alias
            else -> null
        }
    }

    /**
     * Converts a simple alias to the fully qualified name of the declaration. If this normalizer is not responsible for
     * the given alias, null is returned instead.
     */
    override fun resolve(relativeName: QualifiedName): QualifiedName? {
        if (relativeName.segmentCount != 1) {
            return null
        }

        return when {
            ignoreCase && relativeName.lastSegment.equals(alias.lastSegment, ignoreCase = true) -> {
                importedNamespacePrefix.skipLast(1).append(relativeName.lastSegment)
            }
            !ignoreCase && relativeName.lastSegment == alias.lastSegment -> {
                return importedNamespace
            }
            else -> null
        }
    }

    override fun toString(): String {
        return "import $importedNamespace as $alias"
    }
}

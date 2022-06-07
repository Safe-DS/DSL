package de.unibonn.simpleml.validation.declarations

import de.unibonn.simpleml.emf.aliasNameOrNull
import de.unibonn.simpleml.emf.isQualified
import de.unibonn.simpleml.emf.isWildcard
import de.unibonn.simpleml.scoping.allGlobalDeclarations
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlImport
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.naming.QualifiedName
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class ImportChecker : AbstractSimpleMLChecker() {

    @Check(CheckType.NORMAL)
    fun unresolvedNamespace(smlImport: SmlImport) {
        if (smlImport.isQualified()) {
            val importedNamespace = QualifiedName.create(
                smlImport.importedNamespace.split(".")
            )

            val isUnresolved = smlImport
                .allGlobalDeclarations()
                .none { it.qualifiedName == importedNamespace }

            if (isUnresolved) {
                error(
                    "No declaration with qualified name '$importedNamespace' exists.",
                    Literals.SML_IMPORT__IMPORTED_NAMESPACE,
                    ErrorCode.UNRESOLVED_IMPORTED_NAMESPACE
                )
            }
        } else {
            val importedNamespace = QualifiedName.create(
                smlImport.importedNamespace.removeSuffix(".*").split(".")
            )

            val isUnresolved = smlImport
                .allGlobalDeclarations()
                .none { it.qualifiedName.startsWith(importedNamespace) }

            if (isUnresolved) {
                error(
                    "No package with qualified name '$importedNamespace' exists.",
                    Literals.SML_IMPORT__IMPORTED_NAMESPACE,
                    ErrorCode.UNRESOLVED_IMPORTED_NAMESPACE
                )
            }
        }
    }

    @Check
    fun wildcardImportWithAlias(smlImport: SmlImport) {
        if (smlImport.isWildcard() && smlImport.aliasNameOrNull() != null) {
            error(
                "A wildcard import must not have an alias.",
                Literals.SML_IMPORT__ALIAS,
                ErrorCode.WILDCARD_IMPORT_WITH_ALIAS
            )
        }
    }
}

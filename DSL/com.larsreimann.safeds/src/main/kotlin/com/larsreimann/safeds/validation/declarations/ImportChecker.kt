package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.aliasNameOrNull
import com.larsreimann.safeds.emf.isQualified
import com.larsreimann.safeds.emf.isWildcard
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsImport
import com.larsreimann.safeds.scoping.allGlobalDeclarations
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.naming.QualifiedName
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class ImportChecker : AbstractSafeDSChecker() {

    @Check(CheckType.NORMAL)
    fun unresolvedNamespace(sdsImport: SdsImport) {
        if (sdsImport.isQualified()) {
            val importedNamespace = QualifiedName.create(
                sdsImport.importedNamespace.split(".")
            )

            val isUnresolved = sdsImport
                .allGlobalDeclarations()
                .none { it.qualifiedName == importedNamespace }

            if (isUnresolved) {
                error(
                    "No declaration with qualified name '$importedNamespace' exists.",
                    Literals.SDS_IMPORT__IMPORTED_NAMESPACE,
                    ErrorCode.UNRESOLVED_IMPORTED_NAMESPACE
                )
            }
        } else {
            val importedNamespace = QualifiedName.create(
                sdsImport.importedNamespace.removeSuffix(".*").split(".")
            )

            val isUnresolved = sdsImport
                .allGlobalDeclarations()
                .none { it.qualifiedName.startsWith(importedNamespace) }

            if (isUnresolved) {
                error(
                    "No package with qualified name '$importedNamespace' exists.",
                    Literals.SDS_IMPORT__IMPORTED_NAMESPACE,
                    ErrorCode.UNRESOLVED_IMPORTED_NAMESPACE
                )
            }
        }
    }

    @Check
    fun wildcardImportWithAlias(sdsImport: SdsImport) {
        if (sdsImport.isWildcard() && sdsImport.aliasNameOrNull() != null) {
            error(
                "A wildcard import must not have an alias.",
                Literals.SDS_IMPORT__ALIAS,
                ErrorCode.WILDCARD_IMPORT_WITH_ALIAS
            )
        }
    }
}

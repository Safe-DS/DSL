package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.constant.isInStubFile
import com.larsreimann.safeds.constant.isInTestFile
import com.larsreimann.safeds.emf.compilationUnitMembersOrEmpty
import com.larsreimann.safeds.emf.importedNameOrNull
import com.larsreimann.safeds.emf.isQualified
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.scoping.externalGlobalDeclarations
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsImport
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsWorkflow
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class CompilationUnitChecker : AbstractSafeDSChecker() {

    @Check
    fun members(smlCompilationUnit: SdsCompilationUnit) {
        if (smlCompilationUnit.isInStubFile()) {
            smlCompilationUnit.compilationUnitMembersOrEmpty()
                .filter { it is SdsWorkflow || it is SdsStep }
                .forEach {
                    error(
                        "A stub file must not declare workflows or steps.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.StubFileMustNotDeclareWorkflowsOrSteps
                    )
                }
        } else if (!smlCompilationUnit.isInTestFile()) {
            smlCompilationUnit.compilationUnitMembersOrEmpty()
                .filter { it !is SdsWorkflow && it !is SdsStep }
                .forEach {
                    error(
                        "A workflow file must only declare workflows and steps.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.WorkflowFileMustOnlyDeclareWorkflowsAndSteps
                    )
                }
        }
    }

    @Check
    fun uniquePackageDeclaration(smlCompilationUnit: SdsCompilationUnit) {
        if (smlCompilationUnit.isInTestFile()) {
            return
        }

        if (smlCompilationUnit.name == null) {
            smlCompilationUnit.compilationUnitMembersOrEmpty().firstOrNull()?.let {
                error(
                    "A file with declarations must declare its package.",
                    it,
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.FileMustDeclarePackage
                )
            }
        }
    }

    @Check
    fun uniqueNames(smlCompilationUnit: SdsCompilationUnit) {
        val namedEObjects = smlCompilationUnit.imports.filter { it.isQualified() } + smlCompilationUnit.members

        namedEObjects.duplicatesBy {
            when (it) {
                is SdsImport -> it.importedNameOrNull()
                is SdsAbstractDeclaration -> it.name
                else -> null
            }
        }.forEach {
            when {
                it is SdsImport && it.alias == null -> {
                    error(
                        "A declaration with name '${it.importedNameOrNull()}' exists already in this file.",
                        it,
                        Literals.SDS_IMPORT__IMPORTED_NAMESPACE,
                        ErrorCode.REDECLARATION
                    )
                }
                it is SdsImport && it.alias != null -> {
                    error(
                        "A declaration with name '${it.importedNameOrNull()}' exists already in this file.",
                        it.alias,
                        Literals.SDS_IMPORT_ALIAS__NAME,
                        ErrorCode.REDECLARATION
                    )
                }
                it is SdsAbstractDeclaration -> {
                    error(
                        "A declaration with name '${it.name}' exists already in this file.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.REDECLARATION
                    )
                }
            }
        }
    }

    @Check(CheckType.NORMAL)
    fun uniqueNamesAcrossFiles(smlCompilationUnit: SdsCompilationUnit) {

        // Since the stdlib is automatically loaded into a workspace, every declaration would be marked as a duplicate
        // when editing the stdlib
        if (smlCompilationUnit.isInStubFile() && smlCompilationUnit.name.startsWith("safeds")) {
            return
        }

        val externalGlobalDeclarations = smlCompilationUnit.externalGlobalDeclarations()
        smlCompilationUnit.compilationUnitMembersOrEmpty().forEach { member ->
            val qualifiedName = member.qualifiedNameOrNull()
            if (externalGlobalDeclarations.any { it.qualifiedName == qualifiedName }) {
                error(
                    "A declaration with qualified name '$qualifiedName' exists already.",
                    member,
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.REDECLARATION_IN_OTHER_FILE
                )
            }
        }
    }
}

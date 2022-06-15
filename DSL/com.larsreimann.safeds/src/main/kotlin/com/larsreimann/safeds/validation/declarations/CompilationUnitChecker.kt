package com.larsreimann.safeds.validation.declarations

import de.unibonn.simpleml.constant.isInStubFile
import de.unibonn.simpleml.constant.isInTestFile
import de.unibonn.simpleml.emf.compilationUnitMembersOrEmpty
import de.unibonn.simpleml.emf.importedNameOrNull
import de.unibonn.simpleml.emf.isQualified
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import de.unibonn.simpleml.scoping.externalGlobalDeclarations
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsImport
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsWorkflow
import de.unibonn.simpleml.utils.duplicatesBy
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class CompilationUnitChecker : AbstractSimpleMLChecker() {

    @Check
    fun members(smlCompilationUnit: SmlCompilationUnit) {
        if (smlCompilationUnit.isInStubFile()) {
            smlCompilationUnit.compilationUnitMembersOrEmpty()
                .filter { it is SmlWorkflow || it is SmlStep }
                .forEach {
                    error(
                        "A stub file must not declare workflows or steps.",
                        it,
                        Literals.SML_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.StubFileMustNotDeclareWorkflowsOrSteps
                    )
                }
        } else if (!smlCompilationUnit.isInTestFile()) {
            smlCompilationUnit.compilationUnitMembersOrEmpty()
                .filter { it !is SmlWorkflow && it !is SmlStep }
                .forEach {
                    error(
                        "A workflow file must only declare workflows and steps.",
                        it,
                        Literals.SML_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.WorkflowFileMustOnlyDeclareWorkflowsAndSteps
                    )
                }
        }
    }

    @Check
    fun uniquePackageDeclaration(smlCompilationUnit: SmlCompilationUnit) {
        if (smlCompilationUnit.isInTestFile()) {
            return
        }

        if (smlCompilationUnit.name == null) {
            smlCompilationUnit.compilationUnitMembersOrEmpty().firstOrNull()?.let {
                error(
                    "A file with declarations must declare its package.",
                    it,
                    Literals.SML_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.FileMustDeclarePackage
                )
            }
        }
    }

    @Check
    fun uniqueNames(smlCompilationUnit: SmlCompilationUnit) {
        val namedEObjects = smlCompilationUnit.imports.filter { it.isQualified() } + smlCompilationUnit.members

        namedEObjects.duplicatesBy {
            when (it) {
                is SmlImport -> it.importedNameOrNull()
                is SmlAbstractDeclaration -> it.name
                else -> null
            }
        }.forEach {
            when {
                it is SmlImport && it.alias == null -> {
                    error(
                        "A declaration with name '${it.importedNameOrNull()}' exists already in this file.",
                        it,
                        Literals.SML_IMPORT__IMPORTED_NAMESPACE,
                        ErrorCode.REDECLARATION
                    )
                }
                it is SmlImport && it.alias != null -> {
                    error(
                        "A declaration with name '${it.importedNameOrNull()}' exists already in this file.",
                        it.alias,
                        Literals.SML_IMPORT_ALIAS__NAME,
                        ErrorCode.REDECLARATION
                    )
                }
                it is SmlAbstractDeclaration -> {
                    error(
                        "A declaration with name '${it.name}' exists already in this file.",
                        it,
                        Literals.SML_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.REDECLARATION
                    )
                }
            }
        }
    }

    @Check(CheckType.NORMAL)
    fun uniqueNamesAcrossFiles(smlCompilationUnit: SmlCompilationUnit) {

        // Since the stdlib is automatically loaded into a workspace, every declaration would be marked as a duplicate
        // when editing the stdlib
        if (smlCompilationUnit.isInStubFile() && smlCompilationUnit.name.startsWith("simpleml")) {
            return
        }

        val externalGlobalDeclarations = smlCompilationUnit.externalGlobalDeclarations()
        smlCompilationUnit.compilationUnitMembersOrEmpty().forEach { member ->
            val qualifiedName = member.qualifiedNameOrNull()
            if (externalGlobalDeclarations.any { it.qualifiedName == qualifiedName }) {
                error(
                    "A declaration with qualified name '$qualifiedName' exists already.",
                    member,
                    Literals.SML_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.REDECLARATION_IN_OTHER_FILE
                )
            }
        }
    }
}

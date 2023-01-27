package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.constant.isInPipelineFile
import com.larsreimann.safeds.constant.isInSchemaFile
import com.larsreimann.safeds.constant.isInStubFile
import com.larsreimann.safeds.constant.isInTestFile
import com.larsreimann.safeds.emf.compilationUnitMembersOrEmpty
import com.larsreimann.safeds.emf.importedNameOrNull
import com.larsreimann.safeds.emf.isQualified
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsImport
import com.larsreimann.safeds.safeDS.SdsSchema
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsPipeline
import com.larsreimann.safeds.scoping.externalGlobalDeclarations
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class CompilationUnitChecker : AbstractSafeDSChecker() {

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun members(sdsCompilationUnit: SdsCompilationUnit) {
        if (sdsCompilationUnit.isInStubFile()) {
            sdsCompilationUnit.compilationUnitMembersOrEmpty()
                .filter { it is SdsPipeline || it is SdsStep || it is SdsSchema }
                .forEach {
                    error(
                        "A stub file must not declare workflows, schemas or steps.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.StubFileMustNotDeclareWorkflowsSchemasOrSteps,
                    )
                }
        } else if (sdsCompilationUnit.isInPipelineFile()) {
            sdsCompilationUnit.compilationUnitMembersOrEmpty()
                .filter { it !is SdsPipeline && it !is SdsStep }
                .forEach {
                    error(
                        "A workflow file must only declare workflows and steps.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.WorkflowFileMustOnlyDeclareWorkflowsAndSteps,
                    )
                }
        } else if (sdsCompilationUnit.isInSchemaFile()) {
            sdsCompilationUnit.compilationUnitMembersOrEmpty()
                .filter { it !is SdsSchema }
                .forEach {
                    error(
                        "A schema file must only declare schemas.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.SchemaFileMustOnlyDeclareSchemas,
                    )
                }
        }
    }

    @Check
    fun uniquePackageDeclaration(sdsCompilationUnit: SdsCompilationUnit) {
        if (sdsCompilationUnit.isInTestFile()) {
            return
        }

        if (sdsCompilationUnit.name == null) {
            sdsCompilationUnit.compilationUnitMembersOrEmpty().firstOrNull()?.let {
                error(
                    "A file with declarations must declare its package.",
                    it,
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.FileMustDeclarePackage,
                )
            }
        }
    }

    @Check
    fun uniqueNames(sdsCompilationUnit: SdsCompilationUnit) {
        val namedEObjects = sdsCompilationUnit.imports.filter { it.isQualified() } + sdsCompilationUnit.members

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
                        ErrorCode.REDECLARATION,
                    )
                }
                it is SdsImport && it.alias != null -> {
                    error(
                        "A declaration with name '${it.importedNameOrNull()}' exists already in this file.",
                        it.alias,
                        Literals.SDS_IMPORT_ALIAS__NAME,
                        ErrorCode.REDECLARATION,
                    )
                }
                it is SdsAbstractDeclaration -> {
                    error(
                        "A declaration with name '${it.name}' exists already in this file.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.REDECLARATION,
                    )
                }
            }
        }
    }

    @Check(CheckType.NORMAL)
    fun uniqueNamesAcrossFiles(sdsCompilationUnit: SdsCompilationUnit) {
        // Since the stdlib is automatically loaded into a workspace, every declaration would be marked as a duplicate
        // when editing the stdlib
        if (sdsCompilationUnit.isInStubFile() && sdsCompilationUnit.name.startsWith("safeds")) {
            return
        }

        val externalGlobalDeclarations = sdsCompilationUnit.externalGlobalDeclarations()
        sdsCompilationUnit.compilationUnitMembersOrEmpty().forEach { member ->
            val qualifiedName = member.qualifiedNameOrNull()
            if (externalGlobalDeclarations.any { it.qualifiedName == qualifiedName }) {
                error(
                    "A declaration with qualified name '$qualifiedName' exists already.",
                    member,
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.REDECLARATION_IN_OTHER_FILE,
                )
            }
        }
    }
}

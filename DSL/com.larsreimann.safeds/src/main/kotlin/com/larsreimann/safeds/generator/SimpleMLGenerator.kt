package com.larsreimann.safeds.generator

import de.unibonn.simpleml.constant.SmlInfixOperationOperator.And
import de.unibonn.simpleml.constant.SmlInfixOperationOperator.Elvis
import de.unibonn.simpleml.constant.SmlInfixOperationOperator.IdenticalTo
import de.unibonn.simpleml.constant.SmlInfixOperationOperator.NotIdenticalTo
import de.unibonn.simpleml.constant.SmlInfixOperationOperator.Or
import de.unibonn.simpleml.constant.SmlPrefixOperationOperator
import de.unibonn.simpleml.constant.isFlowFile
import de.unibonn.simpleml.constant.isInFlowFile
import de.unibonn.simpleml.constant.isInTestFile
import de.unibonn.simpleml.constant.isTestFile
import de.unibonn.simpleml.constant.operator
import de.unibonn.simpleml.emf.assigneesOrEmpty
import de.unibonn.simpleml.emf.blockLambdaResultsOrEmpty
import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.emf.compilationUnitOrNull
import de.unibonn.simpleml.emf.containingBlockLambdaOrNull
import de.unibonn.simpleml.emf.containingCompilationUnitOrNull
import de.unibonn.simpleml.emf.createSmlWildcard
import de.unibonn.simpleml.emf.descendants
import de.unibonn.simpleml.emf.isGlobal
import de.unibonn.simpleml.emf.isOptional
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.placeholdersOrEmpty
import de.unibonn.simpleml.emf.resultsOrEmpty
import de.unibonn.simpleml.emf.statementsOrEmpty
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractStatement
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsArgumentList
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionLambda
import com.larsreimann.safeds.safeDS.SdsExpressionStatement
import com.larsreimann.safeds.safeDS.SdsIndexedAccess
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParenthesizedExpression
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsPrefixOperation
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsResultList
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTemplateString
import com.larsreimann.safeds.safeDS.SdsTemplateStringEnd
import com.larsreimann.safeds.safeDS.SdsTemplateStringInner
import com.larsreimann.safeds.safeDS.SdsTemplateStringStart
import com.larsreimann.safeds.safeDS.SdsWildcard
import com.larsreimann.safeds.safeDS.SdsWorkflow
import com.larsreimann.safeds.safeDS.SdsYield
import de.unibonn.simpleml.staticAnalysis.linking.parameterOrNull
import de.unibonn.simpleml.staticAnalysis.linking.parametersOrNull
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantBoolean
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantEnumVariant
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantFloat
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantInt
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantNull
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantString
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import de.unibonn.simpleml.staticAnalysis.resultsOrNull
import de.unibonn.simpleml.staticAnalysis.statementHasNoSideEffects
import de.unibonn.simpleml.stdlibAccess.pythonModuleOrNull
import de.unibonn.simpleml.stdlibAccess.pythonNameOrNull
import de.unibonn.simpleml.utils.IdManager
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.generator.AbstractGenerator
import org.eclipse.xtext.generator.IFileSystemAccess2
import org.eclipse.xtext.generator.IGeneratorContext

/**
 * Generates code from your model files on save.
 *
 * See [Xtext Code Generation](https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#code-generation).
 */
class SafeSDGenerator : AbstractGenerator() {

    private val codegenPackage = "simpleml.codegen"
    private val runtimeBridgePackage = "runtimeBridge"
    private val indent = "    "

    /**
     * Creates Python workflow and declaration files if the [resource] is either a Simple-ML flow or test file.
     */
    override fun doGenerate(resource: Resource, fsa: IFileSystemAccess2, context: IGeneratorContext) {
        if (resource.isFlowFile() || resource.isTestFile()) {
            generateWorkflowFiles(resource, fsa, context)
            generateDeclarationFile(resource, fsa, context)
        }
    }

    /**
     * Creates one Python file for each workflow in the given resource that just contains a main block that calls the
     * workflow. This way we can run the Python interpreter with the created file to run the workflow.
     *
     * **Example:** Given the following situation
     *  * Simple-ML package: "com.example"
     *  * Simple-ML file:    "test.simpleml"
     *  * Workflow names:    "workflow1", "workflow2"
     *
     * we create two files in the folder "com/example" (determined by the Simple-ML package). The file for "workflow1"
     * is called "test_workflow1.py" and the file for "workflow2" is called "test_workflow2.py". The names are created
     * by taking the Simple-ML file name, removing the file extension, appending an underscore, and then the workflow
     * name.
     */
    private fun generateWorkflowFiles(resource: Resource, fsa: IFileSystemAccess2, context: IGeneratorContext) {
        resource.allContents.asSequence()
            .filterIsInstance<SmlWorkflow>()
            .forEach {
                if (context.cancelIndicator.isCanceled) {
                    return
                }

                val fileName = "${resource.baseGeneratedFilePathOrNull()}_${it.correspondingPythonName()}.py"
                val content = """
                        |from gen_${resource.baseFileNameOrNull()} import ${it.correspondingPythonName()}
                        |
                        |if __name__ == '__main__':
                        |$indent${it.correspondingPythonName()}()
                        |
                """.trimMargin()

                fsa.generateFile(fileName, content)
            }
    }

    private fun generateDeclarationFile(resource: Resource, fsa: IFileSystemAccess2, context: IGeneratorContext) {
        if (context.cancelIndicator.isCanceled) {
            return
        }

        val fileName = "${resource.baseGeneratedFilePathOrNull()}.py"
        val compilationUnit = resource.compilationUnitOrNull() ?: return
        val content = compile(compilationUnit)

        fsa.generateFile(fileName, content)
    }

    private fun compile(compilationUnit: SmlCompilationUnit): String {
        val imports = mutableSetOf<ImportData>()

        // Compile steps
        val stepString = compilationUnit
            .descendants<SmlStep>()
            .sortedBy { it.name }
            .joinToString("\n") {
                compileWorkflowSteps(it, imports)
            }

        // Compile workflows
        val workflowString = compilationUnit
            .descendants<SmlWorkflow>()
            .sortedBy { it.name }
            .joinToString("\n") {
                compileWorkflow(it, imports)
            }

        return buildString {

            // Imports
            val importsString = compileImports(imports)
            if (importsString.isNotBlank()) {
                appendLine("# Imports ----------------------------------------------------------------------\n")
                appendLine(importsString)
            }

            // Steps
            if (stepString.isNotBlank()) {
                appendLine("# Steps ------------------------------------------------------------------------\n")
                append(stepString)
            }

            // Workflows
            if (workflowString.isNotBlank()) {
                if (stepString.isNotBlank()) {
                    appendLine()
                }
                appendLine("# Workflows --------------------------------------------------------------------\n")
                append(workflowString)
            }
        }
    }

    private fun compileImports(imports: Set<ImportData>) = buildString {

        // Qualified imports
        imports
            .filter { it.declarationName == null }
            .sortedBy { it.importPath }
            .forEach {
                appendLine(it.toString())
            }

        // From-imports
        imports
            .filter { it.declarationName != null }
            .groupBy { it.importPath }
            .entries
            .sortedBy { it.key }
            .forEach { (key, value) ->
                val declarationNames = value
                    .sortedBy { it.declarationName }
                    .joinToString {
                        when (it.alias) {
                            null -> it.declarationName!!
                            else -> "${it.declarationName} as ${it.alias}"
                        }
                    }
                appendLine("from $key import $declarationNames")
            }
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun compileWorkflowSteps(step: SmlStep, imports: MutableSet<ImportData>) = buildString {
        val blockLambdaIdManager = IdManager<SmlBlockLambda>()

        append("def ${step.correspondingPythonName()}(")
        append(
            step.parametersOrEmpty().joinToString {
                compileParameter(CompileParameterFrame(it, imports, blockLambdaIdManager))
            }
        )
        appendLine("):")

        if (step.statementsOrEmpty().withEffect().isEmpty()) {
            appendLine("${indent}pass")
        } else {
            step.statementsOrEmpty().withEffect().forEach {
                val statement = compileStatement(
                    CompileStatementFrame(
                        it,
                        imports,
                        blockLambdaIdManager,
                        shouldSavePlaceholders = false
                    )
                ).prependIndent(indent)
                appendLine(statement)
            }

            if (step.resultsOrEmpty().isNotEmpty()) {
                appendLine("${indent}return ${step.resultsOrEmpty().joinToString { it.name }}")
            }
        }
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun compileWorkflow(workflow: SmlWorkflow, imports: MutableSet<ImportData>) = buildString {
        val blockLambdaIdManager = IdManager<SmlBlockLambda>()

        appendLine("def ${workflow.correspondingPythonName()}():")
        if (workflow.statementsOrEmpty().withEffect().isEmpty()) {
            appendLine("${indent}pass")
        } else {
            workflow.statementsOrEmpty().withEffect().forEach {
                appendLine(
                    compileStatement(
                        CompileStatementFrame(it, imports, blockLambdaIdManager, shouldSavePlaceholders = true)
                    ).prependIndent(indent)
                )
            }
        }
    }

    private data class CompileStatementFrame(
        val stmt: SmlAbstractStatement,
        val imports: MutableSet<ImportData>,
        val blockLambdaIdManager: IdManager<SmlBlockLambda>,
        val shouldSavePlaceholders: Boolean
    )

    @OptIn(ExperimentalStdlibApi::class)
    private val compileStatement: DeepRecursiveFunction<CompileStatementFrame, String> =
        DeepRecursiveFunction { (stmt, imports, blockLambdaIdManager, shouldSavePlaceholders) ->
            val stringBuilder = StringBuilder()
            when (stmt) {
                is SmlAssignment -> {
                    for (lambda in stmt.expression.descendants<SmlBlockLambda>()) {
                        stringBuilder.append(
                            compileBlockLambda.callRecursive(
                                CompileBlockLambdaFrame(
                                    lambda,
                                    imports,
                                    blockLambdaIdManager
                                )
                            )
                        )
                    }

                    if (stmt.assigneesOrEmpty().any { it !is SmlWildcard }) {
                        val assignees = stmt.paddedAssignees().joinToString {
                            when (it) {
                                is SmlBlockLambdaResult -> it.name
                                is SmlPlaceholder -> it.name
                                is SmlYield -> it.result.name
                                else -> "_"
                            }
                        }
                        stringBuilder.append("$assignees = ")
                    }
                    stringBuilder.append(
                        compileExpression.callRecursive(
                            CompileExpressionFrame(stmt.expression, imports, blockLambdaIdManager)
                        )
                    )

                    if (shouldSavePlaceholders) {
                        stmt.placeholdersOrEmpty().forEach {
                            imports += ImportData(runtimeBridgePackage)
                            stringBuilder.append("\n$runtimeBridgePackage.save_placeholder('${it.name}', ${it.name})")
                        }
                    }
                }
                is SmlExpressionStatement -> {
                    for (lambda in stmt.expression.descendants<SmlBlockLambda>()) {
                        stringBuilder.append(
                            compileBlockLambda.callRecursive(
                                CompileBlockLambdaFrame(
                                    lambda,
                                    imports,
                                    blockLambdaIdManager
                                )
                            )
                        )
                    }

                    stringBuilder.append(
                        compileExpression.callRecursive(
                            CompileExpressionFrame(stmt.expression, imports, blockLambdaIdManager)
                        )
                    )
                }
                else -> throw java.lang.IllegalStateException("Missing case to handle statement $stmt.")
            }

            stringBuilder.toString()
        }

    private data class CompileBlockLambdaFrame(
        val lambda: SmlBlockLambda,
        val imports: MutableSet<ImportData>,
        val blockLambdaIdManager: IdManager<SmlBlockLambda>
    )

    @OptIn(ExperimentalStdlibApi::class)
    private val compileBlockLambda: DeepRecursiveFunction<CompileBlockLambdaFrame, String> =
        DeepRecursiveFunction { (lambda, imports, blockLambdaIdManager) ->
            val stringBuilder = StringBuilder()

            // Header
            stringBuilder.append("def ${lambda.uniqueName(blockLambdaIdManager)}(")
            val parameters = mutableListOf<String>()
            for (parameter in lambda.parametersOrEmpty()) {
                parameters += compileParameter.callRecursive(
                    CompileParameterFrame(
                        parameter,
                        imports,
                        blockLambdaIdManager
                    )
                )
            }
            stringBuilder.append(parameters.joinToString())
            stringBuilder.appendLine("):")

            // Statements
            if (lambda.statementsOrEmpty().withEffect().isEmpty()) {
                stringBuilder.appendLine("${indent}pass")
            } else {
                for (stmt in lambda.statementsOrEmpty().withEffect()) {
                    stringBuilder.appendLine(
                        compileStatement.callRecursive(
                            CompileStatementFrame(
                                stmt,
                                imports,
                                blockLambdaIdManager,
                                shouldSavePlaceholders = false
                            )
                        ).prependIndent(indent)
                    )
                }

                if (lambda.blockLambdaResultsOrEmpty().isNotEmpty()) {
                    stringBuilder.appendLine(
                        "${indent}return ${
                        lambda.blockLambdaResultsOrEmpty().joinToString { it.name }
                        }"
                    )
                }
            }

            stringBuilder.toString()
        }

    private data class CompileParameterFrame(
        val parameter: SmlParameter,
        val imports: MutableSet<ImportData>,
        val blockLambdaIdManager: IdManager<SmlBlockLambda>
    )

    @OptIn(ExperimentalStdlibApi::class)
    private val compileParameter: DeepRecursiveFunction<CompileParameterFrame, String> =
        DeepRecursiveFunction { (parameter, imports, blockLambdaIdManager) ->
            when {
                parameter.isOptional() -> {
                    val defaultValue = compileExpression.callRecursive(
                        CompileExpressionFrame(parameter.defaultValue, imports, blockLambdaIdManager)
                    )
                    "${parameter.correspondingPythonName()}=$defaultValue"
                }
                parameter.isVariadic -> "*${parameter.correspondingPythonName()}"
                else -> parameter.correspondingPythonName()
            }
        }

    private data class CompileExpressionFrame(
        val expression: SmlAbstractExpression,
        val imports: MutableSet<ImportData>,
        val blockLambdaIdManager: IdManager<SmlBlockLambda>
    )

    @OptIn(ExperimentalStdlibApi::class)
    private val compileExpression: DeepRecursiveFunction<CompileExpressionFrame, String> =
        DeepRecursiveFunction { (expr, imports, blockLambdaIdManager) ->

            // Template string parts
            when (expr) {
                is SmlTemplateStringStart -> return@DeepRecursiveFunction "${expr.value.toSingleLine()}{ "
                is SmlTemplateStringInner -> return@DeepRecursiveFunction " }${expr.value.toSingleLine()}{ "
                is SmlTemplateStringEnd -> return@DeepRecursiveFunction " }${expr.value.toSingleLine()}"
            }

            // Constant expressions
            val constantExpr = expr.toConstantExpressionOrNull()
            if (constantExpr != null) {
                when (constantExpr) {
                    is SmlConstantBoolean -> return@DeepRecursiveFunction if (constantExpr.value) "True" else "False"
                    is SmlConstantEnumVariant -> {
                        /* let remaining code handle this */
                    }
                    is SmlConstantFloat -> return@DeepRecursiveFunction constantExpr.value.toString()
                    is SmlConstantInt -> return@DeepRecursiveFunction constantExpr.value.toString()
                    is SmlConstantNull -> return@DeepRecursiveFunction "None"
                    is SmlConstantString -> return@DeepRecursiveFunction "'${constantExpr.value.toSingleLine()}'"
                }
            }

            // Other
            return@DeepRecursiveFunction when (expr) {
                is SmlBlockLambda -> {
                    expr.uniqueName(blockLambdaIdManager)
                }
                is SmlCall -> {
                    val receiver = callRecursive(CompileExpressionFrame(expr.receiver, imports, blockLambdaIdManager))
                    val arguments = mutableListOf<String>()
                    for (argument in expr.argumentList.sortedByParameter()) {
                        val value = callRecursive(CompileExpressionFrame(argument.value, imports, blockLambdaIdManager))
                        arguments += if (argument.parameterOrNull()?.isOptional() == true) {
                            "${argument.parameterOrNull()?.correspondingPythonName()}=$value"
                        } else {
                            value
                        }
                    }

                    "$receiver(${arguments.joinToString()})"
                }
                is SmlExpressionLambda -> {
                    val parameters = mutableListOf<String>()
                    for (parameter in expr.parametersOrEmpty()) {
                        parameters += compileParameter.callRecursive(
                            CompileParameterFrame(
                                parameter,
                                imports,
                                blockLambdaIdManager
                            )
                        )
                    }
                    val result = callRecursive(CompileExpressionFrame(expr.result, imports, blockLambdaIdManager))

                    "lambda ${parameters.joinToString()}: $result"
                }
                is SmlInfixOperation -> {
                    val leftOperand =
                        callRecursive(CompileExpressionFrame(expr.leftOperand, imports, blockLambdaIdManager))
                    val rightOperand =
                        callRecursive(CompileExpressionFrame(expr.rightOperand, imports, blockLambdaIdManager))
                    when (expr.operator()) {
                        Or -> {
                            imports += ImportData(codegenPackage)
                            "$codegenPackage.eager_or($leftOperand, $rightOperand)"
                        }
                        And -> {
                            imports += ImportData(codegenPackage)
                            "$codegenPackage.eager_and($leftOperand, $rightOperand)"
                        }
                        IdenticalTo -> "($leftOperand) is ($rightOperand)"
                        NotIdenticalTo -> "($leftOperand) is not ($rightOperand)"
                        Elvis -> {
                            imports += ImportData(codegenPackage)
                            "$codegenPackage.eager_elvis($leftOperand, $rightOperand)"
                        }
                        else -> "($leftOperand) ${expr.operator} ($rightOperand)"
                    }
                }
                is SmlIndexedAccess -> {
                    val receiver = callRecursive(CompileExpressionFrame(expr.receiver, imports, blockLambdaIdManager))
                    val index = callRecursive(CompileExpressionFrame(expr.index, imports, blockLambdaIdManager))
                    "$receiver[$index]"
                }
                is SmlMemberAccess -> {
                    val receiver = callRecursive(CompileExpressionFrame(expr.receiver, imports, blockLambdaIdManager))
                    when (val memberDeclaration = expr.member.declaration) {
                        is SmlBlockLambdaResult -> {
                            val allResults = memberDeclaration.containingBlockLambdaOrNull()!!.blockLambdaResultsOrEmpty()
                            if (allResults.size == 1) {
                                receiver
                            } else {
                                val thisIndex = allResults.indexOf(memberDeclaration)
                                "$receiver[$thisIndex]"
                            }
                        }
                        is SmlEnumVariant -> {
                            val member =
                                callRecursive(CompileExpressionFrame(expr.member, imports, blockLambdaIdManager))

                            val suffix = when (expr.eContainer()) {
                                is SmlCall -> ""
                                else -> "()"
                            }

                            when {
                                expr.isNullSafe -> {
                                    imports += ImportData(codegenPackage)
                                    "$codegenPackage.safe_access($receiver, '$member')$suffix"
                                }
                                else -> "$receiver.$member$suffix"
                            }
                        }
                        is SmlResult -> {
                            val allResults = memberDeclaration.closestAncestorOrNull<SmlResultList>()!!.results
                            if (allResults.size == 1) {
                                receiver
                            } else {
                                val thisIndex = allResults.indexOf(memberDeclaration)
                                "$receiver[$thisIndex]"
                            }
                        }
                        else -> {
                            val member =
                                callRecursive(CompileExpressionFrame(expr.member, imports, blockLambdaIdManager))
                            when {
                                expr.isNullSafe -> {
                                    imports += ImportData(codegenPackage)
                                    "$codegenPackage.safe_access($receiver, '$member')"
                                }
                                else -> "$receiver.$member"
                            }
                        }
                    }
                }
                is SmlParenthesizedExpression -> {
                    callRecursive(CompileExpressionFrame(expr.expression, imports, blockLambdaIdManager))
                }
                is SmlPrefixOperation -> {
                    val operand = callRecursive(CompileExpressionFrame(expr.operand, imports, blockLambdaIdManager))
                    when (expr.operator()) {
                        SmlPrefixOperationOperator.Not -> "not ($operand)"
                        SmlPrefixOperationOperator.Minus -> "-($operand)"
                    }
                }
                is SmlReference -> {
                    val importAlias = expr.containingCompilationUnitOrNull()
                        ?.imports
                        ?.firstOrNull { it.importedNamespace == expr.declaration.qualifiedNameOrNull().toString() }
                        ?.alias
                        ?.name

                    // Add import as needed
                    val declaration = expr.declaration
                    if (declaration.isGlobal() && declaration.containingCompilationUnitOrNull() != expr.containingCompilationUnitOrNull()) {
                        val importPath = declaration
                            .containingCompilationUnitOrNull()
                            ?.correspondingPythonModule()
                            ?.split(".")
                            .orEmpty()
                            .toMutableList()

                        if (importPath.isNotEmpty()) {
                            if (declaration.isInFlowFile() || declaration.isInTestFile()) {
                                val fileName = declaration.eResource().baseFileNameOrNull()
                                importPath += "gen_$fileName"

                                if (fileName != null) {
                                    imports += ImportData(
                                        importPath.joinToString("."),
                                        declaration.correspondingPythonName(),
                                        importAlias
                                    )
                                }
                            } else {
                                imports += ImportData(
                                    importPath.joinToString("."),
                                    declaration.correspondingPythonName(),
                                    importAlias
                                )
                            }
                        }
                    }

                    importAlias ?: declaration.correspondingPythonName()
                }
                is SmlTemplateString -> {
                    val substrings = mutableListOf<String>()
                    for (expression in expr.expressions) {
                        substrings += callRecursive(CompileExpressionFrame(expression, imports, blockLambdaIdManager))
                    }
                    "f'${substrings.joinToString("")}'"
                }
                else -> throw java.lang.IllegalStateException("Missing case to handle expression $expr.")
            }
        }
}

/**
 * Returns the name of the Python declaration that corresponds to this [SmlAbstractDeclaration].
 */
private fun SmlAbstractDeclaration.correspondingPythonName(): String {
    return pythonNameOrNull() ?: name
}

/**
 * Returns the name of the Python module that corresponds to this [SmlCompilationUnit].
 */
private fun SmlCompilationUnit.correspondingPythonModule(): String {
    return pythonModuleOrNull() ?: name
}

/**
 * Adds wildcards at the end of the assignee list until every value of the right-hand side is captured.
 */
private fun SmlAssignment.paddedAssignees(): List<SmlAbstractAssignee> {
    val desiredNumberOfAssignees = when (val expression = this.expression) {
        is SmlCall -> expression.resultsOrNull()?.size ?: 0
        else -> 1
    }

    return buildList {
        addAll(assigneesOrEmpty())
        while (size < desiredNumberOfAssignees) {
            add(createSmlWildcard())
        }
    }
}

/**
 * Returns a unique but consistent name for this lambda.
 */
private fun SmlBlockLambda.uniqueName(blockLambdaIdManager: IdManager<SmlBlockLambda>): String {
    val id = blockLambdaIdManager.assignIdIfAbsent(this).value
    return "__block_lambda_$id"
}

/**
 * Returns a new list that only contains the [SmlAbstractStatement] that have some effect.
 */
private fun List<SmlAbstractStatement>.withEffect(): List<SmlAbstractStatement> {
    return this.filter { !it.statementHasNoSideEffects() }
}

/**
 * Returns a new list with the arguments in the same order as the corresponding parameters.
 */
private fun SmlArgumentList?.sortedByParameter(): List<SmlArgument> {
    val parameters = this?.parametersOrNull() ?: return emptyList()
    val arguments = this.arguments

    return buildList {
        parameters.forEach { parameter ->
            addAll(arguments.filter { it.parameterOrNull() == parameter })
        }
    }
}

/**
 * Escapes newlines.
 */
private fun String.toSingleLine(): String {
    return replace("\n", "\\n")
}

/**
 * Stores information about the imports that should be generated
 */
private data class ImportData(
    val importPath: String,
    val declarationName: String? = null,
    val alias: String? = null
) {
    override fun toString(): String {
        return when {
            declarationName == null && alias == null -> "import $importPath"
            declarationName == null && alias != null -> "import $importPath as $alias"
            declarationName != null && alias == null -> "from $importPath import $declarationName"
            else -> "from $importPath import $declarationName as $alias"
        }
    }
}

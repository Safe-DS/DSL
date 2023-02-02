package com.larsreimann.safeds.generator

import com.larsreimann.safeds.constant.SdsInfixOperationOperator.And
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Elvis
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.IdenticalTo
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.NotIdenticalTo
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Or
import com.larsreimann.safeds.constant.SdsPrefixOperationOperator
import com.larsreimann.safeds.constant.isInPipelineFile
import com.larsreimann.safeds.constant.isInTestFile
import com.larsreimann.safeds.constant.isPipelineFile
import com.larsreimann.safeds.constant.isTestFile
import com.larsreimann.safeds.constant.operator
import com.larsreimann.safeds.emf.assigneesOrEmpty
import com.larsreimann.safeds.emf.blockLambdaResultsOrEmpty
import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.compilationUnitOrNull
import com.larsreimann.safeds.emf.containingBlockLambdaOrNull
import com.larsreimann.safeds.emf.containingCompilationUnitOrNull
import com.larsreimann.safeds.emf.createSdsWildcard
import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.emf.isGlobal
import com.larsreimann.safeds.emf.isOptional
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.placeholdersOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.emf.statementsOrEmpty
import com.larsreimann.safeds.naming.qualifiedNameOrNull
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
import com.larsreimann.safeds.safeDS.SdsPipeline
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
import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.staticAnalysis.linking.parameterOrNull
import com.larsreimann.safeds.staticAnalysis.linking.parametersOrNull
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantBoolean
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantEnumVariant
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantFloat
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantInt
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantNull
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantString
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import com.larsreimann.safeds.staticAnalysis.resultsOrNull
import com.larsreimann.safeds.staticAnalysis.statementHasNoSideEffects
import com.larsreimann.safeds.stdlibAccess.pythonModuleOrNull
import com.larsreimann.safeds.stdlibAccess.pythonNameOrNull
import com.larsreimann.safeds.utils.IdManager
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.generator.AbstractGenerator
import org.eclipse.xtext.generator.IFileSystemAccess2
import org.eclipse.xtext.generator.IGeneratorContext

/**
 * Generates code from your model files on save.
 *
 * See [Xtext Code Generation](https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#code-generation).
 */
class SafeDSGenerator : AbstractGenerator() {

    private val codegenPackage = "safeds_runner.codegen"
    private val runtimeBridgePackage = "runtimeBridge"
    private val indent = "    "

    /**
     * Creates Python pipeline and declaration files if the [resource] is either a Safe-DS pipeline or test file.
     */
    override fun doGenerate(resource: Resource, fsa: IFileSystemAccess2, context: IGeneratorContext) {
        if (resource.isPipelineFile() || resource.isTestFile()) {
            generatePipelineFiles(resource, fsa, context)
            generateDeclarationFile(resource, fsa, context)
        }
    }

    /**
     * Creates one Python file for each pipeline in the given resource that just contains a main block that calls the
     * pipeline. This way we can run the Python interpreter with the created file to run the pipeline.
     *
     * **Example:** Given the following situation
     *  * Safe-DS package: "com.example"
     *  * Safe-DS file:    "test.safeds"
     *  * Pipeline names:    "pipeline1", "pipeline2"
     *
     * we create two files in the folder "com/example" (determined by the Safe-DS package). The file for "pipeline1"
     * is called "test_pipeline1.py" and the file for "pipeline2" is called "test_pipeline2.py". The names are created
     * by taking the Safe-DS file name, removing the file extension, appending an underscore, and then the pipeline
     * name.
     */
    private fun generatePipelineFiles(resource: Resource, fsa: IFileSystemAccess2, context: IGeneratorContext) {
        resource.allContents.asSequence()
            .filterIsInstance<SdsPipeline>()
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

    private fun compile(compilationUnit: SdsCompilationUnit): String {
        val imports = mutableSetOf<ImportData>()

        // Compile steps
        val stepString = compilationUnit
            .descendants<SdsStep>()
            .sortedBy { it.name }
            .joinToString("\n") {
                compileSteps(it, imports)
            }

        // Compile pipelines
        val pipelineString = compilationUnit
            .descendants<SdsPipeline>()
            .sortedBy { it.name }
            .joinToString("\n") {
                compilePipeline(it, imports)
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

            // Pipelines
            if (pipelineString.isNotBlank()) {
                if (stepString.isNotBlank()) {
                    appendLine()
                }
                appendLine("# Pipelines --------------------------------------------------------------------\n")
                append(pipelineString)
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
    private fun compileSteps(step: SdsStep, imports: MutableSet<ImportData>) = buildString {
        val blockLambdaIdManager = IdManager<SdsBlockLambda>()

        append("def ${step.correspondingPythonName()}(")
        append(
            step.parametersOrEmpty().joinToString {
                compileParameter(CompileParameterFrame(it, imports, blockLambdaIdManager))
            },
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
                        shouldSavePlaceholders = false,
                    ),
                ).prependIndent(indent)
                appendLine(statement)
            }

            if (step.resultsOrEmpty().isNotEmpty()) {
                appendLine("${indent}return ${step.resultsOrEmpty().joinToString { it.name }}")
            }
        }
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun compilePipeline(pipeline: SdsPipeline, imports: MutableSet<ImportData>) = buildString {
        val blockLambdaIdManager = IdManager<SdsBlockLambda>()

        appendLine("def ${pipeline.correspondingPythonName()}():")
        if (pipeline.statementsOrEmpty().withEffect().isEmpty()) {
            appendLine("${indent}pass")
        } else {
            pipeline.statementsOrEmpty().withEffect().forEach {
                appendLine(
                    compileStatement(
                        CompileStatementFrame(it, imports, blockLambdaIdManager, shouldSavePlaceholders = true),
                    ).prependIndent(indent),
                )
            }
        }
    }

    private data class CompileStatementFrame(
        val stmt: SdsAbstractStatement,
        val imports: MutableSet<ImportData>,
        val blockLambdaIdManager: IdManager<SdsBlockLambda>,
        val shouldSavePlaceholders: Boolean,
    )

    @OptIn(ExperimentalStdlibApi::class)
    private val compileStatement: DeepRecursiveFunction<CompileStatementFrame, String> =
        DeepRecursiveFunction { (stmt, imports, blockLambdaIdManager, shouldSavePlaceholders) ->
            val stringBuilder = StringBuilder()
            when (stmt) {
                is SdsAssignment -> {
                    for (lambda in stmt.expression.descendants<SdsBlockLambda>()) {
                        stringBuilder.append(
                            compileBlockLambda.callRecursive(
                                CompileBlockLambdaFrame(
                                    lambda,
                                    imports,
                                    blockLambdaIdManager,
                                ),
                            ),
                        )
                    }

                    if (stmt.assigneesOrEmpty().any { it !is SdsWildcard }) {
                        val assignees = stmt.paddedAssignees().joinToString {
                            when (it) {
                                is SdsBlockLambdaResult -> it.name
                                is SdsPlaceholder -> it.name
                                is SdsYield -> it.result.name
                                else -> "_"
                            }
                        }
                        stringBuilder.append("$assignees = ")
                    }
                    stringBuilder.append(
                        compileExpression.callRecursive(
                            CompileExpressionFrame(stmt.expression, imports, blockLambdaIdManager),
                        ),
                    )

                    if (shouldSavePlaceholders) {
                        stmt.placeholdersOrEmpty().forEach {
                            imports += ImportData(runtimeBridgePackage)
                            stringBuilder.append("\n$runtimeBridgePackage.save_placeholder('${it.name}', ${it.name})")
                        }
                    }
                }
                is SdsExpressionStatement -> {
                    for (lambda in stmt.expression.descendants<SdsBlockLambda>()) {
                        stringBuilder.append(
                            compileBlockLambda.callRecursive(
                                CompileBlockLambdaFrame(
                                    lambda,
                                    imports,
                                    blockLambdaIdManager,
                                ),
                            ),
                        )
                    }

                    stringBuilder.append(
                        compileExpression.callRecursive(
                            CompileExpressionFrame(stmt.expression, imports, blockLambdaIdManager),
                        ),
                    )
                }
                else -> throw java.lang.IllegalStateException("Missing case to handle statement $stmt.")
            }

            stringBuilder.toString()
        }

    private data class CompileBlockLambdaFrame(
        val lambda: SdsBlockLambda,
        val imports: MutableSet<ImportData>,
        val blockLambdaIdManager: IdManager<SdsBlockLambda>,
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
                        blockLambdaIdManager,
                    ),
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
                                shouldSavePlaceholders = false,
                            ),
                        ).prependIndent(indent),
                    )
                }

                if (lambda.blockLambdaResultsOrEmpty().isNotEmpty()) {
                    stringBuilder.appendLine(
                        "${indent}return ${
                            lambda.blockLambdaResultsOrEmpty().joinToString { it.name }
                        }",
                    )
                }
            }

            stringBuilder.toString()
        }

    private data class CompileParameterFrame(
        val parameter: SdsParameter,
        val imports: MutableSet<ImportData>,
        val blockLambdaIdManager: IdManager<SdsBlockLambda>,
    )

    @OptIn(ExperimentalStdlibApi::class)
    private val compileParameter: DeepRecursiveFunction<CompileParameterFrame, String> =
        DeepRecursiveFunction { (parameter, imports, blockLambdaIdManager) ->
            when {
                parameter.isOptional() -> {
                    val defaultValue = compileExpression.callRecursive(
                        CompileExpressionFrame(parameter.defaultValue, imports, blockLambdaIdManager),
                    )
                    "${parameter.correspondingPythonName()}=$defaultValue"
                }
                parameter.isVariadic -> "*${parameter.correspondingPythonName()}"
                else -> parameter.correspondingPythonName()
            }
        }

    private data class CompileExpressionFrame(
        val expression: SdsAbstractExpression,
        val imports: MutableSet<ImportData>,
        val blockLambdaIdManager: IdManager<SdsBlockLambda>,
    )

    @OptIn(ExperimentalStdlibApi::class)
    private val compileExpression: DeepRecursiveFunction<CompileExpressionFrame, String> =
        DeepRecursiveFunction { (expr, imports, blockLambdaIdManager) ->

            // Template string parts
            when (expr) {
                is SdsTemplateStringStart -> return@DeepRecursiveFunction "${expr.value.toSingleLine()}{ "
                is SdsTemplateStringInner -> return@DeepRecursiveFunction " }${expr.value.toSingleLine()}{ "
                is SdsTemplateStringEnd -> return@DeepRecursiveFunction " }${expr.value.toSingleLine()}"
            }

            // Constant expressions
            val constantExpr = expr.toConstantExpressionOrNull()
            if (constantExpr != null) {
                when (constantExpr) {
                    is SdsConstantBoolean -> return@DeepRecursiveFunction if (constantExpr.value) "True" else "False"
                    is SdsConstantEnumVariant -> {
                        /* let remaining code handle this */
                    }
                    is SdsConstantFloat -> return@DeepRecursiveFunction constantExpr.value.toString()
                    is SdsConstantInt -> return@DeepRecursiveFunction constantExpr.value.toString()
                    is SdsConstantNull -> return@DeepRecursiveFunction "None"
                    is SdsConstantString -> return@DeepRecursiveFunction "'${constantExpr.value.toSingleLine()}'"
                }
            }

            // Other
            return@DeepRecursiveFunction when (expr) {
                is SdsBlockLambda -> {
                    expr.uniqueName(blockLambdaIdManager)
                }
                is SdsCall -> {
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
                is SdsExpressionLambda -> {
                    val parameters = mutableListOf<String>()
                    for (parameter in expr.parametersOrEmpty()) {
                        parameters += compileParameter.callRecursive(
                            CompileParameterFrame(
                                parameter,
                                imports,
                                blockLambdaIdManager,
                            ),
                        )
                    }
                    val result = callRecursive(CompileExpressionFrame(expr.result, imports, blockLambdaIdManager))

                    "lambda ${parameters.joinToString()}: $result"
                }
                is SdsInfixOperation -> {
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
                is SdsIndexedAccess -> {
                    val receiver = callRecursive(CompileExpressionFrame(expr.receiver, imports, blockLambdaIdManager))
                    val index = callRecursive(CompileExpressionFrame(expr.index, imports, blockLambdaIdManager))
                    "$receiver[$index]"
                }
                is SdsMemberAccess -> {
                    val receiver = callRecursive(CompileExpressionFrame(expr.receiver, imports, blockLambdaIdManager))
                    when (val memberDeclaration = expr.member.declaration) {
                        is SdsBlockLambdaResult -> {
                            val allResults = memberDeclaration.containingBlockLambdaOrNull()!!.blockLambdaResultsOrEmpty()
                            if (allResults.size == 1) {
                                receiver
                            } else {
                                val thisIndex = allResults.indexOf(memberDeclaration)
                                "$receiver[$thisIndex]"
                            }
                        }
                        is SdsEnumVariant -> {
                            val member =
                                callRecursive(CompileExpressionFrame(expr.member, imports, blockLambdaIdManager))

                            val suffix = when (expr.eContainer()) {
                                is SdsCall -> ""
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
                        is SdsResult -> {
                            val allResults = memberDeclaration.closestAncestorOrNull<SdsResultList>()!!.results
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
                is SdsParenthesizedExpression -> {
                    callRecursive(CompileExpressionFrame(expr.expression, imports, blockLambdaIdManager))
                }
                is SdsPrefixOperation -> {
                    val operand = callRecursive(CompileExpressionFrame(expr.operand, imports, blockLambdaIdManager))
                    when (expr.operator()) {
                        SdsPrefixOperationOperator.Not -> "not ($operand)"
                        SdsPrefixOperationOperator.Minus -> "-($operand)"
                    }
                }
                is SdsReference -> {
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
                            if (declaration.isInPipelineFile() || declaration.isInTestFile()) {
                                val fileName = declaration.eResource().baseFileNameOrNull()
                                importPath += "gen_$fileName"

                                if (fileName != null) {
                                    imports += ImportData(
                                        importPath.joinToString("."),
                                        declaration.correspondingPythonName(),
                                        importAlias,
                                    )
                                }
                            } else {
                                imports += ImportData(
                                    importPath.joinToString("."),
                                    declaration.correspondingPythonName(),
                                    importAlias,
                                )
                            }
                        }
                    }

                    importAlias ?: declaration.correspondingPythonName()
                }
                is SdsTemplateString -> {
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
 * Returns the name of the Python declaration that corresponds to this [SdsAbstractDeclaration].
 */
private fun SdsAbstractDeclaration.correspondingPythonName(): String {
    return pythonNameOrNull() ?: name
}

/**
 * Returns the name of the Python module that corresponds to this [SdsCompilationUnit].
 */
private fun SdsCompilationUnit.correspondingPythonModule(): String {
    return pythonModuleOrNull() ?: name
}

/**
 * Adds wildcards at the end of the assignee list until every value of the right-hand side is captured.
 */
private fun SdsAssignment.paddedAssignees(): List<SdsAbstractAssignee> {
    val desiredNumberOfAssignees = when (val expression = this.expression) {
        is SdsCall -> expression.resultsOrNull()?.size ?: 0
        else -> 1
    }

    return buildList {
        addAll(assigneesOrEmpty())
        while (size < desiredNumberOfAssignees) {
            add(createSdsWildcard())
        }
    }
}

/**
 * Returns a unique but consistent name for this lambda.
 */
private fun SdsBlockLambda.uniqueName(blockLambdaIdManager: IdManager<SdsBlockLambda>): String {
    val id = blockLambdaIdManager.assignIdIfAbsent(this).value
    return "__block_lambda_$id"
}

/**
 * Returns a new list that only contains the [SdsAbstractStatement] that have some effect.
 */
private fun List<SdsAbstractStatement>.withEffect(): List<SdsAbstractStatement> {
    return this.filter { !it.statementHasNoSideEffects() }
}

/**
 * Returns a new list with the arguments in the same order as the corresponding parameters.
 */
private fun SdsArgumentList?.sortedByParameter(): List<SdsArgument> {
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
    val alias: String? = null,
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

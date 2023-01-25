// The duplication gives us the flexibility to change parts of the generated Markdown individually
@file:Suppress("DuplicatedCode")

package com.larsreimann.safeds.stdlibDocumentation

import com.larsreimann.safeds.emf.classMembersOrEmpty
import com.larsreimann.safeds.emf.containingCompilationUnitOrNull
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.emf.variantsOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.scoping.allGlobalDeclarations
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString
import com.larsreimann.safeds.stdlibAccess.descriptionOrNull
import com.larsreimann.safeds.stdlibAccess.validTargets
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.EcoreUtil2
import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.writeText

private val horizontalRule = "-".repeat(10)

private val autogenWarning = """
    |$horizontalRule
    |
    |**This file was created automatically. Do not change it manually!**
""".trimMargin()

/**
 * Generates documentation for all declarations that are visible from the given context.
 *
 * @receiver The context.
 * @param outputDirectory Where to place the created files.
 */
fun EObject.generateDocumentation(outputDirectory: Path) {
    outputDirectory.toFile().deleteRecursively()
    outputDirectory.createDirectories()

    val packagesToDeclarations: Map<String, List<EObject>> = allGlobalDeclarations()
        .map { it.eObjectOrProxy }
        .filter { it.containingCompilationUnitOrNull()?.name != null }
        .groupBy { it.containingCompilationUnitOrNull()!!.name }

    createReadme(outputDirectory, packagesToDeclarations)
    createPackageFiles(outputDirectory, packagesToDeclarations)
}

private fun createReadme(outputDirectory: Path, packagesToDeclarations: Map<String, List<EObject>>) {
    val packagesDocumentation = packagesToDeclarations.keys
        .sorted()
        .joinToString(separator = "\n") { packageName ->
            "* [$packageName](./${packageName.replace(".", "_")}.md)"
        }

    outputDirectory.resolve("README.md").writeText(
        """
            |# Safe-DS API Documentation
            |
            |## Packages
            |
            |$packagesDocumentation
            |
            |$autogenWarning
            |
        """.trimMargin()
    )
}

private fun createPackageFiles(outputDirectory: Path, packagesToDeclarations: Map<String, List<EObject>>) {
    packagesToDeclarations.forEach { (packageName, globalDeclarations) ->
        createPackageFile(outputDirectory, packageName, globalDeclarations)
    }
}

private fun createPackageFile(outputDirectory: Path, packageName: String, globalDeclarations: List<EObject>) {
    outputDirectory
        .resolve("${packageName.replace(".", "_")}.md")
        .writeText(createPackageDocumentation(packageName, globalDeclarations))
}

private fun createPackageDocumentation(
    packageName: String,
    globalDeclarations: List<EObject>
) = buildString {
    val classes = globalDeclarations.filterIsInstance<SdsClass>().sortedBy { it.name }
    val globalFunctions = globalDeclarations.filterIsInstance<SdsFunction>().sortedBy { it.name }
    val enums = globalDeclarations.filterIsInstance<SdsEnum>().sortedBy { it.name }
    val annotations = globalDeclarations.filterIsInstance<SdsAnnotation>().sortedBy { it.name }

    appendLine("# Package `$packageName`")

    if (annotations.isNotEmpty() || classes.isNotEmpty() || enums.isNotEmpty() || globalFunctions.isNotEmpty()) {
        appendLine()
    }

    // Classes
    classes.forEach {
        appendLine(createClassDocumentation(it, nestingLevel = 2))
        if (it != classes.last()) {
            appendLine("$horizontalRule\n")
        }
    }

    // Global functions
    if (globalFunctions.isNotEmpty()) {
        appendLine("## Global Functions\n")
        globalFunctions.forEach {
            appendLine(createFunctionDocumentation(it, nestingLevel = 3, isGlobalFunction = true))
        }
    }

    // Enums
    enums.forEach {
        appendLine(createEnumDocumentation(it, nestingLevel = 2))
    }

    // Annotations
    annotations.forEach {
        appendLine(createAnnotationDocumentation(it))
    }

    appendLine(autogenWarning)
}

private fun createAnnotationDocumentation(annotation: SdsAnnotation) = buildString {

    // Heading
    appendLine("## <a name=\"annotation-${annotation.name}\"></a>Annotation `${annotation.name}`")

    // Description
    appendLine(annotation.descriptionOrAltText())

    // Parameters
    if (annotation.parametersOrEmpty().isNotEmpty()) {
        append("\n" + createParametersDocumentation(annotation.parametersOrEmpty()))
    }

    // Targets
    appendLine("\n**Valid targets:**\n")
    val validTargets = annotation
        .validTargets()
        .sortedBy { it.name }
        .joinToString(separator = "\n") {
            "* ${it.name}"
        }
    appendLine(validTargets)
}

private fun createAttributeDocumentation(attribute: SdsAttribute) = buildString {

    // Remember description before annotation calls are removed
    val description = attribute.descriptionOrAltText()

    // Remove annotation calls, so they don't show up in the serialized code
    attribute.annotationCalls
        .toList()
        .forEach { annotationCall ->
            EcoreUtil2.remove(annotationCall)
        }

    // Try to serialize the attribute
    val itemHeading = when (val serializationResult = attribute.serializeToFormattedString()) {
        is SerializationResult.Success -> "`${serializationResult.code}`"
        else -> attribute.name
    }

    // Heading
    append("* $itemHeading")

    // Description
    appendLine(" - $description")
}

private fun createClassDocumentation(`class`: SdsClass, nestingLevel: Int): String = buildString {
    val attributes = `class`.classMembersOrEmpty().filterIsInstance<SdsAttribute>().sortedBy { it.name }
    val methods = `class`.classMembersOrEmpty().filterIsInstance<SdsFunction>().sortedBy { it.name }
    val classes = `class`.classMembersOrEmpty().filterIsInstance<SdsClass>().sortedBy { it.name }
    val enums = `class`.classMembersOrEmpty().filterIsInstance<SdsEnum>().sortedBy { it.name }

    // Heading
    if (isGlobal(nestingLevel)) {
        appendLine("## <a name=\"class-${`class`.name}\"></a>Class `${`class`.name}`")
    } else {
        appendLine("${heading(nestingLevel)} Nested Class `${`class`.name}")
    }

    // Description
    appendLine(`class`.descriptionOrAltText())

    // Constructor
    appendLine("\n" + createConstructorDocumentation(`class`))

    // Attributes
    if (attributes.isNotEmpty()) {
        appendLine("**Attributes:**\n")
        attributes.forEach {
            append(createAttributeDocumentation(it))
        }
        appendLine()
    }

    // Methods
    methods.forEach {
        appendLine(createFunctionDocumentation(it, nestingLevel + 1, isGlobalFunction = false))
    }

    // Classes
    classes.forEach {
        appendLine(createClassDocumentation(it, nestingLevel + 1))
    }

    // Enums
    enums.forEach {
        appendLine(createEnumDocumentation(it, nestingLevel + 1))
    }
}

private fun createConstructorDocumentation(`class`: SdsClass) = buildString {
    if (`class`.parameterList == null) {
        appendLine("**Constructor:** _Class has no constructor._")
    } else if (`class`.parametersOrEmpty().isEmpty()) {
        appendLine("**Constructor parameters:** _None expected._")
    } else {
        appendLine("**Constructor parameters:**\n")
        `class`.parametersOrEmpty().forEach {
            appendLine(createParameterDocumentation(it))
        }
    }
}

private fun createEnumDocumentation(enum: SdsEnum, nestingLevel: Int) = buildString {
    val variants = enum.variantsOrEmpty().sortedBy { it.name }

    // Heading
    if (isGlobal(nestingLevel)) {
        appendLine("## <a name=\"enum-${enum.name}\"></a>Enum `${enum.name}`")
    } else {
        appendLine("${heading(nestingLevel)} Nested Enum `${enum.name}")
    }

    // Description
    appendLine(enum.descriptionOrAltText())

    // Variants
    variants.forEach {
        appendLine(createEnumVariantDocumentation(it, nestingLevel + 1))
    }
}

private fun createEnumVariantDocumentation(enumVariant: SdsEnumVariant, nestingLevel: Int) = buildString {

    // Heading
    appendLine("${heading(nestingLevel)} Enum Variant `${enumVariant.name}`")

    // Description
    appendLine(enumVariant.descriptionOrAltText())

    // Parameters
    appendLine("\n" + createParametersDocumentation(enumVariant.parametersOrEmpty()))
}

private fun SdsAbstractDeclaration.descriptionOrAltText(): String {
    return descriptionOrNull() ?: "_No description available._"
}

private fun createFunctionDocumentation(function: SdsFunction, nestingLevel: Int, isGlobalFunction: Boolean) = buildString {

    // Heading
    if (isGlobalFunction) {
        appendLine("## <a name=\"global-function-${function.name}\"></a>Global Function `${function.name}`")
    } else if (function.isStatic) {
        appendLine("${heading(nestingLevel)} `${function.name}` (Static Method)")
    } else {
        appendLine("${heading(nestingLevel)} `${function.name}` (Instance Method )")
    }

    // Description
    appendLine(function.descriptionOrAltText())

    // Parameters
    appendLine("\n" + createParametersDocumentation(function.parametersOrEmpty()))

    // Results
    append(createResultsDocumentation(function.resultsOrEmpty()))
}

private fun createParametersDocumentation(parameters: List<SdsParameter>) = buildString {
    if (parameters.isEmpty()) {
        appendLine("**Parameters:** _None expected._")
    } else {
        appendLine("**Parameters:**\n")
        parameters.forEach {
            appendLine(createParameterDocumentation(it))
        }
    }
}

private fun createParameterDocumentation(parameter: SdsParameter) = buildString {

    // Remember description before annotation calls are removed
    val description = parameter.descriptionOrAltText()

    // Remove annotation calls, so they don't show up in the serialized code
    parameter.annotationCalls
        .toList()
        .forEach { annotationCall ->
            EcoreUtil2.remove(annotationCall)
        }

    // Try to serialize the parameter
    val itemHeading = when (val serializationResult = parameter.serializeToFormattedString()) {
        is SerializationResult.Success -> "`${serializationResult.code}`"
        else -> parameter.name
    }

    // Heading
    append("* $itemHeading")

    // Description
    append(" - $description")
}

private fun createResultsDocumentation(result: List<SdsResult>) = buildString {
    if (result.isEmpty()) {
        appendLine("**Results:** _None returned._")
    } else {
        appendLine("**Results:**\n")
        result.forEach {
            appendLine(createResultDocumentation(it))
        }
    }
}

private fun createResultDocumentation(result: SdsResult) = buildString {

    // Remember description before annotation calls are removed
    val description = result.descriptionOrAltText()

    // Remove annotation calls, so they don't show up in the serialized code
    result.annotationCalls
        .toList()
        .forEach { annotationCall ->
            EcoreUtil2.remove(annotationCall)
        }

    // Try to serialize the result
    val itemHeading = when (val serializationResult = result.serializeToFormattedString()) {
        is SerializationResult.Success -> "`${serializationResult.code}`"
        else -> result.name
    }

    // Heading
    append("* $itemHeading")

    // Description
    append(" - $description")
}

/**
 * Creates the appropriate Markdown keyword for a heading with this [nestingLevel]. Markdown allows up to six levels of
 * headings.
 */
private fun heading(nestingLevel: Int): String {
    return "#".repeat(minOf(nestingLevel, 6))
}

private fun isGlobal(nestingLevel: Int) = nestingLevel == 2

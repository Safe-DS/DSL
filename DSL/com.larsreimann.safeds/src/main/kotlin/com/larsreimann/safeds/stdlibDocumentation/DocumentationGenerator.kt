// The duplication gives us the flexibility to change parts of the generated Markdown individually
@file:Suppress("DuplicatedCode")

package com.larsreimann.safeds.stdlibDocumentation

import de.unibonn.simpleml.emf.classMembersOrEmpty
import de.unibonn.simpleml.emf.containingCompilationUnitOrNull
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.resultsOrEmpty
import de.unibonn.simpleml.emf.variantsOrEmpty
import de.unibonn.simpleml.scoping.allGlobalDeclarations
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsResult
import de.unibonn.simpleml.stdlibAccess.descriptionOrNull
import de.unibonn.simpleml.stdlibAccess.validTargets
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
            |# Simple-ML API Documentation
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
    val classes = globalDeclarations.filterIsInstance<SmlClass>().sortedBy { it.name }
    val globalFunctions = globalDeclarations.filterIsInstance<SmlFunction>().sortedBy { it.name }
    val enums = globalDeclarations.filterIsInstance<SmlEnum>().sortedBy { it.name }
    val annotations = globalDeclarations.filterIsInstance<SmlAnnotation>().sortedBy { it.name }

    appendLine("# Package `$packageName`")

    // Table of contents
    if (annotations.isNotEmpty() || classes.isNotEmpty() || enums.isNotEmpty() || globalFunctions.isNotEmpty()) {
        appendLine("\n## Table of Contents\n")

        if (classes.isNotEmpty()) {
            appendLine("* Classes")
            classes.forEach {
                appendLine("  * [`${it.name}`](#class-${it.name})")
            }
        }

        if (globalFunctions.isNotEmpty()) {
            appendLine("* Global functions")
            globalFunctions.forEach {
                appendLine("  * [`${it.name}`](#global-function-${it.name})")
            }
        }

        if (enums.isNotEmpty()) {
            appendLine("* Enums")
            enums.forEach {
                appendLine("  * [`${it.name}`](#enum-${it.name})")
            }
        }

        if (enums.isNotEmpty()) {
            appendLine("* Annotations")
            annotations.forEach {
                appendLine("  * [`${it.name}`](#annotation-${it.name})")
            }
        }

        appendLine("\n$horizontalRule\n")
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

private fun createAnnotationDocumentation(annotation: SmlAnnotation) = buildString {

    // Heading
    appendLine("## <a name=\"annotation-${annotation.name}\"></a>Annotation `${annotation.name}`")

    // Description
    appendLine(annotation.descriptionOrAltText())

    // Parameters
    if (annotation.parametersOrEmpty().isNotEmpty()) {
        append("\n" + createParametersDocumentation(annotation.parametersOrEmpty()))
    }

    // Targets
    appendLine("\n**Valid targets:**")
    val validTargets = annotation
        .validTargets()
        .sortedBy { it.name }
        .joinToString(separator = "\n") {
            "* ${it.name}"
        }
    appendLine(validTargets)
}

private fun createAttributeDocumentation(attribute: SmlAttribute) = buildString {

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

private fun createClassDocumentation(`class`: SmlClass, nestingLevel: Int): String = buildString {
    val attributes = `class`.classMembersOrEmpty().filterIsInstance<SmlAttribute>().sortedBy { it.name }
    val methods = `class`.classMembersOrEmpty().filterIsInstance<SmlFunction>().sortedBy { it.name }
    val classes = `class`.classMembersOrEmpty().filterIsInstance<SmlClass>().sortedBy { it.name }
    val enums = `class`.classMembersOrEmpty().filterIsInstance<SmlEnum>().sortedBy { it.name }

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
        appendLine("**Attributes:**")
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

private fun createConstructorDocumentation(`class`: SmlClass) = buildString {
    if (`class`.parameterList == null) {
        appendLine("**Constructor:** _Class has no constructor._")
    } else if (`class`.parametersOrEmpty().isEmpty()) {
        appendLine("**Constructor parameters:** _None expected._")
    } else {
        appendLine("**Constructor parameters:**")
        `class`.parametersOrEmpty().forEach {
            appendLine(createParameterDocumentation(it))
        }
    }
}

private fun createEnumDocumentation(enum: SmlEnum, nestingLevel: Int) = buildString {
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

private fun createEnumVariantDocumentation(enumVariant: SmlEnumVariant, nestingLevel: Int) = buildString {

    // Heading
    appendLine("${heading(nestingLevel)} Enum Variant `${enumVariant.name}`")

    // Description
    appendLine(enumVariant.descriptionOrAltText())

    // Parameters
    appendLine("\n" + createParametersDocumentation(enumVariant.parametersOrEmpty()))
}

private fun SmlAbstractDeclaration.descriptionOrAltText(): String {
    return descriptionOrNull() ?: "_No description available._"
}

private fun createFunctionDocumentation(function: SmlFunction, nestingLevel: Int, isGlobalFunction: Boolean) = buildString {

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

private fun createParametersDocumentation(parameters: List<SmlParameter>) = buildString {
    if (parameters.isEmpty()) {
        appendLine("**Parameters:** _None expected._")
    } else {
        appendLine("**Parameters:**")
        parameters.forEach {
            appendLine(createParameterDocumentation(it))
        }
    }
}

private fun createParameterDocumentation(parameter: SmlParameter) = buildString {

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

private fun createResultsDocumentation(result: List<SmlResult>) = buildString {
    if (result.isEmpty()) {
        appendLine("**Results:** _None returned._")
    } else {
        appendLine("**Results:**")
        result.forEach {
            appendLine(createResultDocumentation(it))
        }
    }
}

private fun createResultDocumentation(result: SmlResult) = buildString {

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

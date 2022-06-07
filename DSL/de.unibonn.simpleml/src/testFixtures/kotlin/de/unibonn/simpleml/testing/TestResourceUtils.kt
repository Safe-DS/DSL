package de.unibonn.simpleml.testing

import de.unibonn.simpleml.constant.SmlFileExtension
import org.eclipse.core.runtime.FileLocator
import org.eclipse.emf.common.util.URI
import org.junit.jupiter.api.DynamicContainer
import org.junit.jupiter.api.DynamicNode
import org.junit.jupiter.api.DynamicTest
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.stream.Stream
import kotlin.streams.asSequence

fun ClassLoader.getResourcePath(fileOrFolder: String): Path? {
    val resourceUrl = getResource(fileOrFolder) ?: return null
    val resourceFileUri = FileLocator.resolve(resourceUrl).toURI()
    return Paths.get(resourceFileUri)
}

fun ClassLoader.getResourceEmfUri(fileOrFolder: String): URI? {
    val resourceUrl = getResource(fileOrFolder) ?: return null
    val resourceFileUri = FileLocator.resolve(resourceUrl).toURI()
    return URI.createURI(resourceFileUri.toString(), false)
}

fun Path.createDynamicTestsFromResourceFolder(
    validator: (resourcePath: Path, filePath: Path, program: String) -> String?,
    categorizedTestCreator: (resourcePath: Path, filePath: Path, program: String) -> Sequence<CategorizedTest>
): Stream<out DynamicNode> {
    return Files.walk(this)
        .asSequence()
        .filter(::isTestFile)
        .flatMap { filePath -> createDynamicTestFromResource(this, filePath, validator, categorizedTestCreator) }
        .groupBy { it.category }
        .map { (category, tests) ->
            DynamicContainer.dynamicContainer(category, tests.map { it.test })
        }
        .stream()
}

private fun createDynamicTestFromResource(
    resourcePath: Path,
    filePath: Path,
    validator: (resourcePath: Path, filePath: Path, program: String) -> String?,
    categorizedTestCreator: (resourcePath: Path, filePath: Path, program: String) -> Sequence<CategorizedTest>
) = sequence {
    val program = Files.readString(filePath)

    val testFileError = validator(resourcePath, filePath, program)
    if (testFileError != null) {
        yield(
            CategorizedTest(
                "### BAD TEST FILE ###",
                DynamicTest.dynamicTest(testDisplayName(resourcePath, filePath), filePath.toUri()) {
                    throw IllegalArgumentException(testFileError)
                }
            )
        )
    } else {
        yieldAll(categorizedTestCreator(resourcePath, filePath, program))
    }
}

private fun isTestFile(filePath: Path): Boolean {
    return Files.isRegularFile(filePath) &&
        (
            filePath.fileName.toString().endsWith(".${SmlFileExtension.Flow}") ||
                filePath.fileName.toString().endsWith(".${SmlFileExtension.Stub}") ||
                filePath.fileName.toString().endsWith(".${SmlFileExtension.Test}")
            ) &&
        !filePath.fileName.toString().startsWith("_skip_")
}

fun testDisplayName(resourcePath: Path, filePath: Path, message: String = "") = buildString {
    append("[")
    val relativePath = resourcePath.relativize(filePath)
    append(relativePath.toString().replace("\\", "/"))
    append("]")

    if (message.isNotBlank()) {
        append(" \"$message\"")
    }
}

class CategorizedTest(val category: String, val test: DynamicNode)

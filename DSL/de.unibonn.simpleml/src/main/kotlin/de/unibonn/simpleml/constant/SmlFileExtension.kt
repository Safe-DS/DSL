package de.unibonn.simpleml.constant

import de.unibonn.simpleml.emf.OriginalFilePath
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource

/**
 * Different file extensions associated with Simple-ML programs. The dot that separates file name and file extension is
 * not included.
 */
enum class SmlFileExtension(val extension: String) {

    /**
     * Marks the file as a workflow file, which can be executed by our runtime component.
     *
     * @see isInFlowFile
     * @see isFlowFile
     */
    Flow("smlflow"),

    /**
     * Marks the file as a stub file, which describes an external API.
     *
     * @see isInStubFile
     * @see isStubFile
     */
    Stub("smlstub"),

    /**
     * Marks the file as a test file, which disables some checks to simplify its use as input of test cases. This file
     * type is only used by language developers.
     *
     * @see isInTestFile
     * @see isTestFile
     */
    Test("smltest");

    override fun toString(): String {
        return extension
    }
}

/**
 * Returns whether the object is contained in flow file.
 */
fun EObject.isInFlowFile() = this.eResource().isFlowFile()

/**
 * Returns whether the object is contained in stub file.
 */
fun EObject.isInStubFile() = this.eResource().isStubFile()

/**
 * Returns whether the object is contained in test file.
 */
fun EObject.isInTestFile() = this.eResource().isTestFile()

/**
 * Returns whether the resource represents a flow file.
 */
fun Resource.isFlowFile() = this.hasExtension(SmlFileExtension.Flow)

/**
 * Returns whether the resource represents a stub file.
 */
fun Resource.isStubFile() = this.hasExtension(SmlFileExtension.Stub)

/**
 * Returns whether the resource represents a test file.
 */
fun Resource.isTestFile() = this.hasExtension(SmlFileExtension.Test)

/**
 * Returns whether the resource represents a file with the given extension.
 */
private fun Resource.hasExtension(fileExtension: SmlFileExtension): Boolean {

    // The original file path is normally lost for dynamic tests, so it's attached as an EMF adapter
    this.eAdapters().filterIsInstance<OriginalFilePath>().firstOrNull()?.let {
        return it.path.endsWith(".$fileExtension")
    }

    return this.uri.toString().endsWith(".$fileExtension")
}

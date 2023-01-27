package com.larsreimann.safeds.constant

import com.larsreimann.safeds.emf.OriginalFilePath
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource

/**
 * Different file extensions associated with Safe-DS programs. The dot that separates file name and file extension is
 * not included.
 */
enum class SdsFileExtension(val extension: String) {

    /**
     * Marks the file as a pipeline file, which can be executed by our runtime component.
     *
     * @see isInPipelineFile
     * @see isPipelineFile
     */
    Pipeline("sdspipe"),

    /**
     * Marks the file as a schema file.
     *
     * @see isInSchemaFile
     * @see isSchemaFile
     */
    Schema("sdsschema"),

    /**
     * Marks the file as a stub file, which describes an external API.
     *
     * @see isInStubFile
     * @see isStubFile
     */
    Stub("sdsstub"),

    /**
     * Marks the file as a test file, which disables some checks to simplify its use as input of test cases. This file
     * type is only used by language developers.
     *
     * @see isInTestFile
     * @see isTestFile
     */
    Test("sdstest");

    override fun toString(): String {
        return extension
    }
}

/**
 * Returns whether the object is contained in a pipeline file.
 */
fun EObject.isInPipelineFile() = this.eResource().isPipelineFile()

/**
 * Returns whether the object is contained in a schema file.
 */
fun EObject.isInSchemaFile() = this.eResource().isSchemaFile()

/**
 * Returns whether the object is contained in a stub file.
 */
fun EObject.isInStubFile() = this.eResource().isStubFile()

/**
 * Returns whether the object is contained in a test file.
 */
fun EObject.isInTestFile() = this.eResource().isTestFile()

/**
 * Returns whether the resource represents a pipeline file.
 */
fun Resource.isPipelineFile() = this.hasExtension(SdsFileExtension.Pipeline)

/**
 * Returns whether the resource represents a schema file.
 */
fun Resource.isSchemaFile() = this.hasExtension(SdsFileExtension.Schema)

/**
 * Returns whether the resource represents a stub file.
 */
fun Resource.isStubFile() = this.hasExtension(SdsFileExtension.Stub)

/**
 * Returns whether the resource represents a test file.
 */
fun Resource.isTestFile() = this.hasExtension(SdsFileExtension.Test)

/**
 * Returns whether the resource represents a file with the given extension.
 */
private fun Resource.hasExtension(fileExtension: SdsFileExtension): Boolean {
    // The original file path is normally lost for dynamic tests, so it's attached as an EMF adapter
    this.eAdapters().filterIsInstance<OriginalFilePath>().firstOrNull()?.let {
        return it.path.endsWith(".$fileExtension")
    }

    return this.uri.toString().endsWith(".$fileExtension")
}

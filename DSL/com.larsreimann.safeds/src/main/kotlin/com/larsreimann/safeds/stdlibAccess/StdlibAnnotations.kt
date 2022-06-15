@file:Suppress("MemberVisibilityCanBePrivate")

package com.larsreimann.safeds.stdlibAccess

import de.unibonn.simpleml.emf.annotationCallsOrEmpty
import de.unibonn.simpleml.emf.argumentsOrEmpty
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import de.unibonn.simpleml.staticAnalysis.linking.parameterOrNull
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantEnumVariant
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantExpression
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantString
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import de.unibonn.simpleml.stdlibAccess.StdlibEnums.AnnotationTarget
import de.unibonn.simpleml.utils.uniqueOrNull
import org.eclipse.xtext.naming.QualifiedName

/**
 * Important annotations in the standard library.
 */
object StdlibAnnotations {

    /**
     * Values assigned to this parameter must be constant.
     *
     * @see isConstant
     */
    val Constant: QualifiedName = StdlibPackages.lang.append("Constant")

    /**
     * The declaration should no longer be used.
     *
     * @see isDeprecated
     */
    val Deprecated: QualifiedName = StdlibPackages.lang.append("Deprecated")

    /**
     * The purpose of a declaration.
     *
     * @see descriptionOrNull
     */
    val Description: QualifiedName = StdlibPackages.lang.append("Description")

    /**
     * This parameter should only be used by expert users.
     *
     * @see isExpert
     */
    val Expert: QualifiedName = StdlibPackages.lang.append("Expert")

    /**
     * The function has no side effects.
     *
     * @see hasNoSideEffects
     */
    val NoSideEffects: QualifiedName = StdlibPackages.lang.append("NoSideEffects")

    /**
     * The qualified name of the corresponding module in Python.
     *
     * @see pythonModuleOrNull
     */
    val PythonModule: QualifiedName = StdlibPackages.lang.append("PythonModule")

    /**
     * The name of the corresponding API element in Python.
     *
     * @see pythonNameOrNull
     */
    val PythonName: QualifiedName = StdlibPackages.lang.append("PythonName")

    /**
     * The function has no side effects and returns the same results for the same arguments.
     *
     * @see isPure
     */
    val Pure: QualifiedName = StdlibPackages.lang.append("Pure")

    /**
     * The annotation can be used multiple times for the same declaration.
     *
     * @see isRepeatable
     */
    val Repeatable: QualifiedName = StdlibPackages.lang.append("Repeatable")

    /**
     * The version in which a declaration was added.
     *
     * @see sinceVersionOrNull
     */
    val Since: QualifiedName = StdlibPackages.lang.append("Since")

    /**
     * The annotation can target only a subset of declaration types.
     *
     * @see validTargets
     */
    val Target: QualifiedName = StdlibPackages.lang.append("Target")
}

/**
 * Returns all calls of the annotation with the given qualified name.
 */
fun SmlAbstractDeclaration.annotationCallsOrEmpty(qualifiedName: QualifiedName): List<SmlAnnotationCall> {
    return this.annotationCallsOrEmpty().filter {
        it.annotation.qualifiedNameOrNull() == qualifiedName
    }
}

/**
 * Returns the unique use of the annotation with the given qualified name or `null` if none or multiple exist.
 */
fun SmlAbstractDeclaration.uniqueAnnotationCallOrNull(qualifiedName: QualifiedName): SmlAnnotationCall? {
    return this.annotationCallsOrEmpty(qualifiedName).uniqueOrNull()
}

/**
 * Returns the description attached to the declaration with a `simpleml.lang.Description` annotation.
 */
fun SmlAbstractDeclaration.descriptionOrNull(): String? {
    val value = annotationCallArgumentValueOrNull(StdlibAnnotations.Description, "description")
    return (value as? SmlConstantString)?.value
}

/**
 * Checks if the parameter is annotated with the `simpleml.lang.Constant` annotation.
 */
fun SmlParameter.isConstant(): Boolean {
    return hasAnnotationCallTo(StdlibAnnotations.Constant)
}

/**
 * Checks if the declaration is annotated with the `simpleml.lang.Deprecated` annotation.
 */
fun SmlAbstractDeclaration.isDeprecated(): Boolean {
    return hasAnnotationCallTo(StdlibAnnotations.Deprecated)
}

/**
 * Checks if the parameter is annotated with the `simpleml.lang.Expert` annotation.
 */
fun SmlParameter.isExpert(): Boolean {
    return hasAnnotationCallTo(StdlibAnnotations.Expert)
}

/**
 * Checks if the function is annotated with the `simpleml.lang.Pure` annotation.
 */
fun SmlFunction.isPure(): Boolean {
    return hasAnnotationCallTo(StdlibAnnotations.Pure)
}

/**
 * Checks if the annotation is annotated with the `simpleml.lang.Repeatable` annotation.
 */
fun SmlAnnotation.isRepeatable(): Boolean {
    return hasAnnotationCallTo(StdlibAnnotations.Repeatable)
}

/**
 * Checks if the function is annotated with the `simpleml.lang.Pure` or the `simpleml.lang.NoSideEffects`
 * annotation.
 */
fun SmlFunction.hasNoSideEffects(): Boolean {
    return isPure() || hasAnnotationCallTo(StdlibAnnotations.NoSideEffects)
}

/**
 * Returns the qualified name of the Python module that corresponds to this compilation unit. It is attached to the
 * compilation unit with a `simpleml.lang.PythonModule` annotation.
 */
fun SmlCompilationUnit.pythonModuleOrNull(): String? {
    val value = annotationCallArgumentValueOrNull(
        StdlibAnnotations.PythonModule,
        "qualifiedName"
    )
    return (value as? SmlConstantString)?.value
}

/**
 * Returns the name of the Python API element that corresponds to this declaration. It is attached to the declaration
 * with a `simpleml.lang.PythonName` annotation.
 */
fun SmlAbstractDeclaration.pythonNameOrNull(): String? {
    val value = annotationCallArgumentValueOrNull(StdlibAnnotations.PythonName, "name")
    return (value as? SmlConstantString)?.value
}

/**
 * Returns the version when the declaration was added. This is attached to the declaration with a `simpleml.lang.Since`
 * annotation.
 */
fun SmlAbstractDeclaration.sinceVersionOrNull(): String? {
    val value = annotationCallArgumentValueOrNull(StdlibAnnotations.Since, "version")
    return (value as? SmlConstantString)?.value
}

/**
 * Returns the possible targets of this annotation.
 */
fun SmlAnnotation.validTargets(): List<AnnotationTarget> {
    val targetAnnotationCall = uniqueAnnotationCallOrNull(StdlibAnnotations.Target)
        ?: return AnnotationTarget.values().toList()

    return targetAnnotationCall
        .argumentsOrEmpty()
        .asSequence()
        .mapNotNull { it.value.toConstantExpressionOrNull() }
        .filterIsInstance<SmlConstantEnumVariant>()
        .mapNotNull { it.value.qualifiedNameOrNull() }
        .filter { it.segmentCount == 4 && it.skipLast(1) == AnnotationTarget.enum }
        .mapNotNull { AnnotationTarget.valueOfOrNull(it.lastSegment) }
        .toList()
}

/**
 * Returns whether this [SmlAbstractDeclaration] has at least one annotation call to the annotation with the given
 * qualified name.
 */
private fun SmlAbstractDeclaration.hasAnnotationCallTo(qualifiedName: QualifiedName): Boolean {
    return annotationCallsOrEmpty().any {
        it.annotation.qualifiedNameOrNull() == qualifiedName
    }
}

/**
 * Finds the unique call to a declaration with the given qualified name and looks up the value assigned to the parameter
 * with the given name.
 */
private fun SmlAbstractDeclaration.annotationCallArgumentValueOrNull(
    qualifiedName: QualifiedName,
    parameterName: String
): SmlConstantExpression? {
    return uniqueAnnotationCallOrNull(qualifiedName)
        .argumentsOrEmpty()
        .uniqueOrNull { it.parameterOrNull()?.name == parameterName }
        ?.toConstantExpressionOrNull()
}

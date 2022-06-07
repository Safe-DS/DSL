package de.unibonn.simpleml.validation.declarations

import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import de.unibonn.simpleml.simpleML.SmlAnnotation
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlBlockLambdaResult
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlPlaceholder
import de.unibonn.simpleml.simpleML.SmlProtocolSubterm
import de.unibonn.simpleml.simpleML.SmlResult
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.simpleML.SmlTypeParameter
import de.unibonn.simpleml.simpleML.SmlWorkflow
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class NameConventionChecker : AbstractSimpleMLChecker() {

    @Check
    fun segmentsShouldBeLowercase(smlCompilationUnit: SmlCompilationUnit) {
        val hasInvalidSegments = smlCompilationUnit.name
            .split('.')
            .any { !it.isLowerCamelCase() }

        if (hasInvalidSegments) {
            warning(
                "All segments of the qualified name of a package should be lowerCamelCase.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                WarningCode.SegmentsShouldBeLowerCamelCase
            )
        }
    }

    @Check
    fun blockLambdaPrefix(smlDeclaration: SmlAbstractDeclaration) {
        if (smlDeclaration.name.startsWith("__block_lambda_")) {
            error(
                "Names of declarations must not start with '__block_lambda_'. This is reserved for code generation of block lambdas.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                ErrorCode.BlockLambdaPrefix
            )
        }
    }

    @Check
    fun annotationNamesShouldBeUpperCamelCase(smlAnnotation: SmlAnnotation) {
        smlAnnotation.nameShouldBeUpperCamelCase("annotations")
    }

    @Check
    fun attributeNamesShouldBeLowerCamelCase(smlAttribute: SmlAttribute) {
        smlAttribute.nameShouldBeLowerCamelCase("attributes")
    }

    @Check
    fun classNamesShouldBeUpperCamelCase(smlClass: SmlClass) {
        smlClass.nameShouldBeUpperCamelCase("classes")
    }

    @Check
    fun enumNamesShouldBeUpperCamelCase(smlEnum: SmlEnum) {
        smlEnum.nameShouldBeUpperCamelCase("enums")
    }

    @Check
    fun enumVariantNamesShouldBeUpperCamelCase(smlEnumVariant: SmlEnumVariant) {
        smlEnumVariant.nameShouldBeUpperCamelCase("enum variants")
    }

    @Check
    fun functionNamesShouldBeLowerCamelCase(smlFunction: SmlFunction) {
        smlFunction.nameShouldBeLowerCamelCase("functions")
    }

    @Check
    fun lambdaResultNamesShouldBeLowerCamelCase(smlBlockLambdaResult: SmlBlockLambdaResult) {
        smlBlockLambdaResult.nameShouldBeLowerCamelCase("lambda results")
    }

    @Check
    fun parameterNamesShouldBeLowerCamelCase(smlParameter: SmlParameter) {
        smlParameter.nameShouldBeLowerCamelCase("parameters")
    }

    @Check
    fun placeholderNamesShouldBeLowerCamelCase(smlPlaceholder: SmlPlaceholder) {
        smlPlaceholder.nameShouldBeLowerCamelCase("placeholders")
    }

    @Check
    fun protocolSubtermNamesShouldBeLowerCamelCase(smlProtocolSubterm: SmlProtocolSubterm) {
        smlProtocolSubterm.nameShouldBeLowerCamelCase("protocol subterms")
    }

    @Check
    fun resultNamesShouldBeLowerCamelCase(smlResult: SmlResult) {
        smlResult.nameShouldBeLowerCamelCase("results")
    }

    @Check
    fun stepNamesShouldBeLowerCamelCase(smlStep: SmlStep) {
        smlStep.nameShouldBeLowerCamelCase("steps")
    }

    @Check
    fun typeParameterNamesShouldBeUpperCamelCase(smlTypeParameter: SmlTypeParameter) {
        smlTypeParameter.nameShouldBeUpperCamelCase("type parameters")
    }

    @Check
    fun workflowNamesShouldBeLowerCamelCase(smlWorkflow: SmlWorkflow) {
        smlWorkflow.nameShouldBeLowerCamelCase("workflows")
    }

    private fun SmlAbstractDeclaration.nameShouldBeUpperCamelCase(declarationType: String) {
        if (this.name != null && !this.name.isUpperCamelCase()) {
            warning(
                "Names of $declarationType should be UpperCamelCase.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                WarningCode.NameShouldBeUpperCamelCase
            )
        }
    }

    private fun SmlAbstractDeclaration.nameShouldBeLowerCamelCase(declarationType: String) {
        if (this.name != null && !this.name.isLowerCamelCase()) {
            warning(
                "Names of $declarationType should be lowerCamelCase.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                WarningCode.NameShouldBeLowerCamelCase
            )
        }
    }

    private fun String.isUpperCamelCase(): Boolean {
        return Regex("^[A-Z][a-zA-Z0-9]*$").matches(this)
    }

    private fun String.isLowerCamelCase(): Boolean {
        return Regex("^[a-z][a-zA-Z0-9]*$").matches(this)
    }
}

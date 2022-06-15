package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsProtocolSubterm
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsWorkflow
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class NameConventionChecker : AbstractSafeDSChecker() {

    @Check
    fun segmentsShouldBeLowercase(smlCompilationUnit: SdsCompilationUnit) {
        val hasInvalidSegments = smlCompilationUnit.name
            .split('.')
            .any { !it.isLowerCamelCase() }

        if (hasInvalidSegments) {
            warning(
                "All segments of the qualified name of a package should be lowerCamelCase.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                WarningCode.SegmentsShouldBeLowerCamelCase
            )
        }
    }

    @Check
    fun blockLambdaPrefix(smlDeclaration: SdsAbstractDeclaration) {
        if (smlDeclaration.name.startsWith("__block_lambda_")) {
            error(
                "Names of declarations must not start with '__block_lambda_'. This is reserved for code generation of block lambdas.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.BlockLambdaPrefix
            )
        }
    }

    @Check
    fun annotationNamesShouldBeUpperCamelCase(smlAnnotation: SdsAnnotation) {
        smlAnnotation.nameShouldBeUpperCamelCase("annotations")
    }

    @Check
    fun attributeNamesShouldBeLowerCamelCase(smlAttribute: SdsAttribute) {
        smlAttribute.nameShouldBeLowerCamelCase("attributes")
    }

    @Check
    fun classNamesShouldBeUpperCamelCase(smlClass: SdsClass) {
        smlClass.nameShouldBeUpperCamelCase("classes")
    }

    @Check
    fun enumNamesShouldBeUpperCamelCase(smlEnum: SdsEnum) {
        smlEnum.nameShouldBeUpperCamelCase("enums")
    }

    @Check
    fun enumVariantNamesShouldBeUpperCamelCase(smlEnumVariant: SdsEnumVariant) {
        smlEnumVariant.nameShouldBeUpperCamelCase("enum variants")
    }

    @Check
    fun functionNamesShouldBeLowerCamelCase(smlFunction: SdsFunction) {
        smlFunction.nameShouldBeLowerCamelCase("functions")
    }

    @Check
    fun lambdaResultNamesShouldBeLowerCamelCase(smlBlockLambdaResult: SdsBlockLambdaResult) {
        smlBlockLambdaResult.nameShouldBeLowerCamelCase("lambda results")
    }

    @Check
    fun parameterNamesShouldBeLowerCamelCase(smlParameter: SdsParameter) {
        smlParameter.nameShouldBeLowerCamelCase("parameters")
    }

    @Check
    fun placeholderNamesShouldBeLowerCamelCase(smlPlaceholder: SdsPlaceholder) {
        smlPlaceholder.nameShouldBeLowerCamelCase("placeholders")
    }

    @Check
    fun protocolSubtermNamesShouldBeLowerCamelCase(smlProtocolSubterm: SdsProtocolSubterm) {
        smlProtocolSubterm.nameShouldBeLowerCamelCase("protocol subterms")
    }

    @Check
    fun resultNamesShouldBeLowerCamelCase(smlResult: SdsResult) {
        smlResult.nameShouldBeLowerCamelCase("results")
    }

    @Check
    fun stepNamesShouldBeLowerCamelCase(smlStep: SdsStep) {
        smlStep.nameShouldBeLowerCamelCase("steps")
    }

    @Check
    fun typeParameterNamesShouldBeUpperCamelCase(smlTypeParameter: SdsTypeParameter) {
        smlTypeParameter.nameShouldBeUpperCamelCase("type parameters")
    }

    @Check
    fun workflowNamesShouldBeLowerCamelCase(smlWorkflow: SdsWorkflow) {
        smlWorkflow.nameShouldBeLowerCamelCase("workflows")
    }

    private fun SdsAbstractDeclaration.nameShouldBeUpperCamelCase(declarationType: String) {
        if (this.name != null && !this.name.isUpperCamelCase()) {
            warning(
                "Names of $declarationType should be UpperCamelCase.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                WarningCode.NameShouldBeUpperCamelCase
            )
        }
    }

    private fun SdsAbstractDeclaration.nameShouldBeLowerCamelCase(declarationType: String) {
        if (this.name != null && !this.name.isLowerCamelCase()) {
            warning(
                "Names of $declarationType should be lowerCamelCase.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
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

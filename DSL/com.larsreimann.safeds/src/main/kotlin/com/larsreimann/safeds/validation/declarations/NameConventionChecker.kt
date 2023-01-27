package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.constant.SdsSchemaEffect
import com.larsreimann.safeds.constant.nameToSchemaEffect
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
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsProtocolSubterm
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsPipeline
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class NameConventionChecker : AbstractSafeDSChecker() {

    @Check
    fun segmentsShouldBeLowercase(sdsCompilationUnit: SdsCompilationUnit) {
        val hasInvalidSegments = sdsCompilationUnit.name
            .split('.')
            .any { !it.isLowerCamelCase() }

        if (hasInvalidSegments) {
            warning(
                "All segments of the qualified name of a package should be lowerCamelCase.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                WarningCode.SegmentsShouldBeLowerCamelCase,
            )
        }
    }

    @Check
    fun blockLambdaPrefix(sdsDeclaration: SdsAbstractDeclaration) {
        if (sdsDeclaration.name.startsWith("__block_lambda_")) {
            error(
                "Names of declarations must not start with '__block_lambda_'. This is reserved for code generation of block lambdas.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.BlockLambdaPrefix,
            )
        }
    }

    @Check
    fun annotationNamesShouldBeUpperCamelCase(sdsAnnotation: SdsAnnotation) {
        sdsAnnotation.nameShouldBeUpperCamelCase("annotations")
    }

    @Check
    fun attributeNamesShouldBeLowerCamelCase(sdsAttribute: SdsAttribute) {
        sdsAttribute.nameShouldBeLowerCamelCase("attributes")
    }

    @Check
    fun classNamesShouldBeUpperCamelCase(sdsClass: SdsClass) {
        sdsClass.nameShouldBeUpperCamelCase("classes")
    }

    @Check
    fun enumNamesShouldBeUpperCamelCase(sdsEnum: SdsEnum) {
        sdsEnum.nameShouldBeUpperCamelCase("enums")
    }

    @Check
    fun enumVariantNamesShouldBeUpperCamelCase(sdsEnumVariant: SdsEnumVariant) {
        sdsEnumVariant.nameShouldBeUpperCamelCase("enum variants")
    }

    @Check
    fun functionNamesShouldBeLowerCamelCase(sdsFunction: SdsFunction) {
        sdsFunction.nameShouldBeLowerCamelCase("functions")
    }

    @Check
    fun lambdaResultNamesShouldBeLowerCamelCase(sdsBlockLambdaResult: SdsBlockLambdaResult) {
        sdsBlockLambdaResult.nameShouldBeLowerCamelCase("lambda results")
    }

    @Check
    fun parameterNamesShouldBeLowerCamelCase(sdsParameter: SdsParameter) {
        sdsParameter.nameShouldBeLowerCamelCase("parameters")
    }

    @Check
    fun placeholderNamesShouldBeLowerCamelCase(sdsPlaceholder: SdsPlaceholder) {
        sdsPlaceholder.nameShouldBeLowerCamelCase("placeholders")
    }

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun predicateNamesShouldBeLowerCamelCase(sdsPredicate: SdsPredicate) {
        if (sdsPredicate.nameToSchemaEffect() != SdsSchemaEffect.NoSchemaEffect) {
            return
        }
        sdsPredicate.nameShouldBeLowerCamelCase("predicate")
    }

    @Check
    fun protocolSubtermNamesShouldBeLowerCamelCase(sdsProtocolSubterm: SdsProtocolSubterm) {
        sdsProtocolSubterm.nameShouldBeLowerCamelCase("protocol subterms")
    }

    @Check
    fun resultNamesShouldBeLowerCamelCase(sdsResult: SdsResult) {
        sdsResult.nameShouldBeLowerCamelCase("results")
    }

    @Check
    fun stepNamesShouldBeLowerCamelCase(sdsStep: SdsStep) {
        sdsStep.nameShouldBeLowerCamelCase("steps")
    }

    @Check
    fun typeParameterNamesShouldBeUpperCamelCase(sdsTypeParameter: SdsTypeParameter) {
        sdsTypeParameter.nameShouldBeUpperCamelCase("type parameters")
    }

    @Check
    fun pipelineNamesShouldBeLowerCamelCase(sdsPipeline: SdsPipeline) {
        sdsPipeline.nameShouldBeLowerCamelCase("pipelines")
    }

    private fun SdsAbstractDeclaration.nameShouldBeUpperCamelCase(declarationType: String) {
        if (this.name != null && !this.name.isUpperCamelCase()) {
            warning(
                "Names of $declarationType should be UpperCamelCase.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                WarningCode.NameShouldBeUpperCamelCase,
            )
        }
    }

    private fun SdsAbstractDeclaration.nameShouldBeLowerCamelCase(declarationType: String) {
        if (this.name != null && !this.name.isLowerCamelCase()) {
            warning(
                "Names of $declarationType should be lowerCamelCase.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                WarningCode.NameShouldBeLowerCamelCase,
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

import { ValidationChecks } from 'langium';
import { SafeDsAstType } from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import {
    annotationMustContainUniqueNames,
    blockLambdaMustContainUniqueNames,
    callableTypeMustContainUniqueNames,
    classMustContainUniqueNames,
    enumMustContainUniqueNames,
    enumVariantMustContainUniqueNames,
    expressionLambdaMustContainUniqueNames,
    functionMustContainUniqueNames,
    moduleMemberMustHaveNameThatIsUniqueInPackage,
    moduleMustContainUniqueNames,
    nameMustNotStartWithCodegenPrefix,
    nameShouldHaveCorrectCasing,
    pipelineMustContainUniqueNames,
    schemaMustContainUniqueNames,
    segmentMustContainUniqueNames,
} from './names.js';
import {
    annotationCallArgumentListShouldBeNeeded,
    annotationParameterListShouldNotBeEmpty,
    annotationParameterShouldNotHaveConstModifier,
    assignmentShouldHaveMoreThanWildcardsAsAssignees,
    callArgumentListShouldBeNeeded,
    classBodyShouldNotBeEmpty,
    constraintListShouldNotBeEmpty,
    elvisOperatorShouldBeNeeded,
    enumBodyShouldNotBeEmpty,
    enumVariantParameterListShouldNotBeEmpty,
    functionResultListShouldNotBeEmpty,
    importedDeclarationAliasShouldDifferFromDeclarationName,
    memberAccessNullSafetyShouldBeNeeded,
    namedTypeTypeArgumentListShouldBeNeeded,
    segmentResultListShouldNotBeEmpty,
    typeParameterListShouldNotBeEmpty,
    unionTypeShouldNotHaveASingularTypeArgument,
} from './style.js';
import { templateStringMustHaveExpressionBetweenTwoStringParts } from './other/expressions/templateStrings.js';
import {
    assignmentAssigneeMustGetValue,
    assignmentShouldNotImplicitlyIgnoreResult,
    yieldMustNotBeUsedInPipeline,
} from './other/statements/assignments.js';
import {
    attributeMustHaveTypeHint,
    callReceiverMustBeCallable,
    namedTypeMustSetAllTypeParameters,
    parameterMustHaveTypeHint,
    resultMustHaveTypeHint,
} from './types.js';
import {
    moduleDeclarationsMustMatchFileKind,
    moduleWithDeclarationsMustStatePackage,
    pipelineFileMustNotBeInSafedsPackage,
} from './other/modules.js';
import { typeParameterConstraintLeftOperandMustBeOwnTypeParameter } from './other/declarations/typeParameterConstraints.js';
import { parameterListMustNotHaveRequiredParametersAfterOptionalParameters } from './other/declarations/parameterLists.js';
import {
    unionTypeMustBeUsedInCorrectContext,
    unionTypeMustHaveTypes,
    unionTypeShouldNotHaveDuplicateTypes,
} from './other/types/unionTypes.js';
import {
    callableTypeMustNotHaveOptionalParameters,
    callableTypeParameterMustNotHaveConstModifier,
} from './other/types/callableTypes.js';
import {
    argumentListMustNotHavePositionalArgumentsAfterNamedArguments,
    argumentListMustNotHaveTooManyArguments,
    argumentListMustNotSetParameterMultipleTimes,
    argumentListMustSetAllRequiredParameters,
} from './other/argumentLists.js';
import {
    referenceMustNotBeFunctionPointer,
    referenceMustNotBeStaticClassOrEnumReference,
    referenceTargetMustNotBeAnnotationPipelineOrSchema,
} from './other/expressions/references.js';
import {
    annotationCallAnnotationShouldNotBeDeprecated,
    argumentCorrespondingParameterShouldNotBeDeprecated,
    assigneeAssignedResultShouldNotBeDeprecated,
    namedTypeDeclarationShouldNotBeDeprecated,
    referenceTargetShouldNotBeDeprecated,
    requiredParameterMustNotBeDeprecated,
} from './builtins/deprecated.js';
import {
    annotationCallAnnotationShouldNotBeExperimental,
    argumentCorrespondingParameterShouldNotBeExperimental,
    assigneeAssignedResultShouldNotBeExperimental,
    namedTypeDeclarationShouldNotBeExperimental,
    referenceTargetShouldNotExperimental,
} from './builtins/experimental.js';
import { placeholderShouldBeUsed, placeholdersMustNotBeAnAlias } from './other/declarations/placeholders.js';
import { segmentParameterShouldBeUsed, segmentResultMustBeAssignedExactlyOnce } from './other/declarations/segments.js';
import {
    lambdaMustBeAssignedToTypedParameter,
    lambdaParameterMustNotHaveConstModifier,
} from './other/expressions/lambdas.js';
import {
    indexedAccessesShouldBeUsedWithCaution,
    literalTypesShouldBeUsedWithCaution,
    mapsShouldBeUsedWithCaution,
    unionTypesShouldBeUsedWithCaution,
} from './experimentalLanguageFeatures.js';
import { requiredParameterMustNotBeExpert } from './builtins/expert.js';
import {
    annotationCallArgumentsMustBeConstant,
    annotationCallMustNotLackArgumentList,
    callableTypeParametersMustNotBeAnnotated,
    callableTypeResultsMustNotBeAnnotated,
    lambdaParametersMustNotBeAnnotated,
} from './other/declarations/annotationCalls.js';
import {
    memberAccessMustBeNullSafeIfReceiverIsNullable,
    memberAccessOfEnumVariantMustNotLackInstantiation,
} from './other/expressions/memberAccesses.js';
import { importPackageMustExist, importPackageShouldNotBeEmpty } from './other/imports.js';
import { singleUseAnnotationsMustNotBeRepeated } from './builtins/repeatable.js';
import {
    namedTypeMustNotHaveTooManyTypeArguments,
    namedTypeMustNotSetTypeParameterMultipleTimes,
    namedTypeTypeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments,
} from './other/types/namedTypes.js';
import { classMustNotInheritItself, classMustOnlyInheritASingleClass } from './inheritance.js';
import {
    pythonNameMustNotBeSetIfPythonCallIsSet,
    pythonNameShouldDifferFromSafeDsName,
} from './builtins/pythonName.js';
import { pythonModuleShouldDifferFromSafeDsPackage } from './builtins/pythonModule.js';
import { divisionDivisorMustNotBeZero } from './other/expressions/infixOperations.js';
import { constantParameterMustHaveConstantDefaultValue } from './other/declarations/parameters.js';
import { callArgumentsMustBeConstantIfParameterIsConstant } from './other/expressions/calls.js';
import {
    literalTypeMustHaveLiterals,
    literalTypeMustNotContainListLiteral,
    literalTypeMustNotContainMapLiteral,
    literalTypeShouldNotHaveDuplicateLiteral,
} from './other/types/literalTypes.js';
import { annotationCallMustHaveCorrectTarget, targetShouldNotHaveDuplicateEntries } from './builtins/target.js';
import { pythonCallMustOnlyContainValidTemplateExpressions } from './builtins/pythonCall.js';

/**
 * Register custom validation checks.
 */
export const registerValidationChecks = function (services: SafeDsServices) {
    const registry = services.validation.ValidationRegistry;
    const checks: ValidationChecks<SafeDsAstType> = {
        SdsAssignee: [
            assigneeAssignedResultShouldNotBeDeprecated(services),
            assigneeAssignedResultShouldNotBeExperimental(services),
        ],
        SdsAssignment: [
            assignmentAssigneeMustGetValue(services),
            assignmentShouldNotImplicitlyIgnoreResult(services),
            assignmentShouldHaveMoreThanWildcardsAsAssignees,
        ],
        SdsAbstractCall: [
            argumentListMustNotHaveTooManyArguments(services),
            argumentListMustSetAllRequiredParameters(services),
        ],
        SdsAnnotation: [
            annotationMustContainUniqueNames,
            annotationParameterListShouldNotBeEmpty,
            annotationParameterShouldNotHaveConstModifier,
            targetShouldNotHaveDuplicateEntries(services),
        ],
        SdsAnnotationCall: [
            annotationCallAnnotationShouldNotBeDeprecated(services),
            annotationCallAnnotationShouldNotBeExperimental(services),
            annotationCallArgumentListShouldBeNeeded,
            annotationCallArgumentsMustBeConstant(services),
            annotationCallMustHaveCorrectTarget(services),
            annotationCallMustNotLackArgumentList,
        ],
        SdsArgument: [
            argumentCorrespondingParameterShouldNotBeDeprecated(services),
            argumentCorrespondingParameterShouldNotBeExperimental(services),
        ],
        SdsArgumentList: [
            argumentListMustNotHavePositionalArgumentsAfterNamedArguments,
            argumentListMustNotSetParameterMultipleTimes(services),
        ],
        SdsAttribute: [attributeMustHaveTypeHint],
        SdsBlockLambda: [blockLambdaMustContainUniqueNames],
        SdsCall: [
            callArgumentListShouldBeNeeded(services),
            callArgumentsMustBeConstantIfParameterIsConstant(services),
            callReceiverMustBeCallable(services),
        ],
        SdsCallableType: [
            callableTypeMustContainUniqueNames,
            callableTypeMustNotHaveOptionalParameters,
            callableTypeParametersMustNotBeAnnotated,
            callableTypeParameterMustNotHaveConstModifier,
            callableTypeResultsMustNotBeAnnotated,
        ],
        SdsClass: [
            classMustContainUniqueNames,
            classMustOnlyInheritASingleClass(services),
            classMustNotInheritItself(services),
        ],
        SdsClassBody: [classBodyShouldNotBeEmpty],
        SdsConstraintList: [constraintListShouldNotBeEmpty],
        SdsDeclaration: [
            nameMustNotStartWithCodegenPrefix,
            nameShouldHaveCorrectCasing,
            pythonNameShouldDifferFromSafeDsName(services),
            singleUseAnnotationsMustNotBeRepeated(services),
        ],
        SdsEnum: [enumMustContainUniqueNames],
        SdsEnumBody: [enumBodyShouldNotBeEmpty],
        SdsEnumVariant: [enumVariantMustContainUniqueNames, enumVariantParameterListShouldNotBeEmpty],
        SdsExpressionLambda: [expressionLambdaMustContainUniqueNames],
        SdsFunction: [
            functionMustContainUniqueNames,
            functionResultListShouldNotBeEmpty,
            pythonCallMustOnlyContainValidTemplateExpressions(services),
            pythonNameMustNotBeSetIfPythonCallIsSet(services),
        ],
        SdsImport: [importPackageMustExist(services), importPackageShouldNotBeEmpty(services)],
        SdsImportedDeclaration: [importedDeclarationAliasShouldDifferFromDeclarationName],
        SdsIndexedAccess: [indexedAccessesShouldBeUsedWithCaution],
        SdsInfixOperation: [divisionDivisorMustNotBeZero(services), elvisOperatorShouldBeNeeded(services)],
        SdsLambda: [
            lambdaMustBeAssignedToTypedParameter(services),
            lambdaParametersMustNotBeAnnotated,
            lambdaParameterMustNotHaveConstModifier,
        ],
        SdsLiteralType: [
            literalTypeMustHaveLiterals,
            literalTypeMustNotContainListLiteral,
            literalTypeMustNotContainMapLiteral,
            literalTypesShouldBeUsedWithCaution,
            literalTypeShouldNotHaveDuplicateLiteral(services),
        ],
        SdsMap: [mapsShouldBeUsedWithCaution],
        SdsMemberAccess: [
            memberAccessMustBeNullSafeIfReceiverIsNullable(services),
            memberAccessNullSafetyShouldBeNeeded(services),
            memberAccessOfEnumVariantMustNotLackInstantiation,
        ],
        SdsModule: [
            moduleDeclarationsMustMatchFileKind,
            moduleMemberMustHaveNameThatIsUniqueInPackage(services),
            moduleMustContainUniqueNames,
            moduleWithDeclarationsMustStatePackage,
            pipelineFileMustNotBeInSafedsPackage,
            pythonModuleShouldDifferFromSafeDsPackage(services),
        ],
        SdsNamedType: [
            namedTypeDeclarationShouldNotBeDeprecated(services),
            namedTypeDeclarationShouldNotBeExperimental(services),
            namedTypeMustNotHaveTooManyTypeArguments,
            namedTypeMustNotSetTypeParameterMultipleTimes(services),
            namedTypeMustSetAllTypeParameters(services),
            namedTypeTypeArgumentListShouldBeNeeded,
            namedTypeTypeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments,
        ],
        SdsParameter: [
            constantParameterMustHaveConstantDefaultValue(services),
            parameterMustHaveTypeHint,
            requiredParameterMustNotBeDeprecated(services),
            requiredParameterMustNotBeExpert(services),
        ],
        SdsParameterList: [parameterListMustNotHaveRequiredParametersAfterOptionalParameters],
        SdsPipeline: [pipelineMustContainUniqueNames],
        SdsPlaceholder: [placeholdersMustNotBeAnAlias, placeholderShouldBeUsed(services)],
        SdsReference: [
            referenceMustNotBeFunctionPointer,
            referenceMustNotBeStaticClassOrEnumReference,
            referenceTargetMustNotBeAnnotationPipelineOrSchema,
            referenceTargetShouldNotBeDeprecated(services),
            referenceTargetShouldNotExperimental(services),
        ],
        SdsResult: [resultMustHaveTypeHint],
        SdsSchema: [schemaMustContainUniqueNames],
        SdsSegment: [
            segmentMustContainUniqueNames,
            segmentParameterShouldBeUsed(services),
            segmentResultMustBeAssignedExactlyOnce(services),
            segmentResultListShouldNotBeEmpty,
        ],
        SdsTemplateString: [templateStringMustHaveExpressionBetweenTwoStringParts],
        SdsTypeParameterConstraint: [typeParameterConstraintLeftOperandMustBeOwnTypeParameter],
        SdsTypeParameterList: [typeParameterListShouldNotBeEmpty],
        SdsUnionType: [
            unionTypeMustBeUsedInCorrectContext,
            unionTypeMustHaveTypes,
            unionTypesShouldBeUsedWithCaution,
            unionTypeShouldNotHaveDuplicateTypes(services),
            unionTypeShouldNotHaveASingularTypeArgument,
        ],
        SdsYield: [yieldMustNotBeUsedInPipeline],
    };
    registry.register(checks);
};

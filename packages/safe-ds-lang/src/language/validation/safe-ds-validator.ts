import { ValidationChecks } from 'langium';
import { SafeDsAstType } from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
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
import { requiredParameterMustNotBeExpert } from './builtins/expert.js';
import { pythonCallMustOnlyContainValidTemplateExpressions } from './builtins/pythonCall.js';
import { pythonModuleShouldDifferFromSafeDsPackage } from './builtins/pythonModule.js';
import {
    pythonNameMustNotBeSetIfPythonCallIsSet,
    pythonNameShouldDifferFromSafeDsName,
} from './builtins/pythonName.js';
import { singleUseAnnotationsMustNotBeRepeated } from './builtins/repeatable.js';
import { annotationCallMustHaveCorrectTarget, targetShouldNotHaveDuplicateEntries } from './builtins/target.js';
import {
    constraintListsShouldBeUsedWithCaution,
    literalTypesShouldBeUsedWithCaution,
    mapsShouldBeUsedWithCaution,
    unionTypesShouldBeUsedWithCaution,
} from './experimentalLanguageFeatures.js';
import {
    classMemberMustMatchOverriddenMemberAndShouldBeNeeded,
    classMustNotInheritItself,
    classMustOnlyInheritASingleClass,
} from './inheritance.js';
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
    nameMustNotOccurOnCoreDeclaration,
    nameMustNotStartWithCodegenPrefix,
    nameShouldHaveCorrectCasing,
    pipelineMustContainUniqueNames,
    schemaMustContainUniqueNames,
    segmentMustContainUniqueNames,
} from './names.js';
import {
    argumentListMustNotHavePositionalArgumentsAfterNamedArguments,
    argumentListMustNotHaveTooManyArguments,
    argumentListMustNotSetParameterMultipleTimes,
    argumentListMustSetAllRequiredParameters,
} from './other/argumentLists.js';
import {
    annotationCallArgumentsMustBeConstant,
    annotationCallMustNotLackArgumentList,
    callableTypeParametersMustNotBeAnnotated,
    callableTypeResultsMustNotBeAnnotated,
    lambdaParametersMustNotBeAnnotated,
} from './other/declarations/annotationCalls.js';
import { parameterListMustNotHaveRequiredParametersAfterOptionalParameters } from './other/declarations/parameterLists.js';
import {
    constantParameterMustHaveConstantDefaultValue,
    constantParameterMustHaveTypeThatCanBeEvaluatedToConstant,
} from './other/declarations/parameters.js';
import { placeholderShouldBeUsed, placeholdersMustNotBeAnAlias } from './other/declarations/placeholders.js';
import {
    segmentParameterShouldBeUsed,
    segmentResultMustBeAssignedExactlyOnce,
    segmentShouldBeUsed,
} from './other/declarations/segments.js';
import { typeParameterBoundLeftOperandMustBeOwnTypeParameter } from './other/declarations/typeParameterBounds.js';
import {
    typeParameterMustBeUsedInCorrectPosition,
    typeParameterMustHaveSufficientContext,
    typeParameterMustNotHaveMultipleBounds,
    typeParameterMustOnlyBeVariantOnClass,
} from './other/declarations/typeParameters.js';
import { callArgumentMustBeConstantIfParameterIsConstant, callMustNotBeRecursive } from './other/expressions/calls.js';
import { divisionDivisorMustNotBeZero } from './other/expressions/infixOperations.js';
import {
    lambdaMustBeAssignedToTypedParameter,
    lambdaParameterMustNotHaveConstModifier,
} from './other/expressions/lambdas.js';
import {
    memberAccessMustBeNullSafeIfReceiverIsNullable,
    memberAccessOfEnumVariantMustNotLackInstantiation,
} from './other/expressions/memberAccesses.js';
import {
    referenceMustNotBeFunctionPointer,
    referenceMustNotBeStaticClassOrEnumReference,
    referenceTargetMustNotBeAnnotationPipelineOrSchema,
} from './other/expressions/references.js';
import { templateStringMustHaveExpressionBetweenTwoStringParts } from './other/expressions/templateStrings.js';
import { importPackageMustExist, importPackageShouldNotBeEmpty } from './other/imports.js';
import {
    moduleDeclarationsMustMatchFileKind,
    moduleWithDeclarationsMustStatePackage,
    pipelineFileMustNotBeInBuiltinPackage,
} from './other/modules.js';
import {
    assignmentAssigneeMustGetValue,
    assignmentShouldNotImplicitlyIgnoreResult,
    yieldMustNotBeUsedInPipeline,
} from './other/statements/assignments.js';
import {
    callableTypeMustBeUsedInCorrectContext,
    callableTypeMustNotHaveOptionalParameters,
    callableTypeParameterMustNotHaveConstModifier,
} from './other/types/callableTypes.js';
import {
    literalTypeMustHaveLiterals,
    literalTypeMustNotContainListLiteral,
    literalTypeMustNotContainMapLiteral,
    literalTypeShouldNotHaveDuplicateLiteral,
} from './other/types/literalTypes.js';
import {
    namedTypeMustNotHaveTooManyTypeArguments,
    namedTypeMustNotSetTypeParameterMultipleTimes,
    namedTypeTypeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments,
} from './other/types/namedTypes.js';
import {
    unionTypeMustBeUsedInCorrectContext,
    unionTypeMustHaveTypes,
    unionTypeShouldNotHaveDuplicateTypes,
} from './other/types/unionTypes.js';
import {
    callArgumentAssignedToPureParameterMustBePure,
    functionPurityMustBeSpecified,
    impurityReasonParameterNameMustBelongToParameterOfCorrectType,
    impurityReasonShouldNotBeSetMultipleTimes,
    impurityReasonsOfOverridingMethodMustBeSubsetOfOverriddenMethod,
    pureParameterDefaultValueMustBePure,
} from './purity.js';
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
import {
    argumentTypeMustMatchParameterType,
    attributeMustHaveTypeHint,
    callReceiverMustBeCallable,
    indexedAccessIndexMustHaveCorrectType,
    indexedAccessReceiverMustBeListOrMap,
    infixOperationOperandsMustHaveCorrectType,
    listMustNotContainNamedTuples,
    mapMustNotContainNamedTuples,
    namedTypeMustSetAllTypeParameters,
    parameterDefaultValueTypeMustMatchParameterType,
    parameterMustHaveTypeHint,
    prefixOperationOperandMustHaveCorrectType,
    resultMustHaveTypeHint,
    typeCastExpressionMustHaveUnknownType,
    yieldTypeMustMatchResultType,
} from './types.js';
import { statementMustDoSomething } from './other/statements/statements.js';
import { indexedAccessIndexMustBeValid } from './other/expressions/indexedAccess.js';
import { typeParameterListMustNotHaveRequiredTypeParametersAfterOptionalTypeParameters } from './other/declarations/typeParameterLists.js';

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
            assignmentShouldHaveMoreThanWildcardsAsAssignees(services),
        ],
        SdsAbstractCall: [
            argumentListMustNotHaveTooManyArguments(services),
            argumentListMustSetAllRequiredParameters(services),
        ],
        SdsAnnotation: [
            annotationMustContainUniqueNames,
            annotationParameterListShouldNotBeEmpty(services),
            annotationParameterShouldNotHaveConstModifier(services),
            targetShouldNotHaveDuplicateEntries(services),
        ],
        SdsAnnotationCall: [
            annotationCallAnnotationShouldNotBeDeprecated(services),
            annotationCallAnnotationShouldNotBeExperimental(services),
            annotationCallArgumentListShouldBeNeeded(services),
            annotationCallArgumentsMustBeConstant(services),
            annotationCallMustHaveCorrectTarget(services),
            annotationCallMustNotLackArgumentList,
        ],
        SdsArgument: [
            argumentCorrespondingParameterShouldNotBeDeprecated(services),
            argumentCorrespondingParameterShouldNotBeExperimental(services),
            argumentTypeMustMatchParameterType(services),
        ],
        SdsArgumentList: [
            argumentListMustNotHavePositionalArgumentsAfterNamedArguments,
            argumentListMustNotSetParameterMultipleTimes(services),
        ],
        SdsAttribute: [attributeMustHaveTypeHint],
        SdsBlockLambda: [blockLambdaMustContainUniqueNames],
        SdsCall: [
            callArgumentListShouldBeNeeded(services),
            callArgumentAssignedToPureParameterMustBePure(services),
            callArgumentMustBeConstantIfParameterIsConstant(services),
            callMustNotBeRecursive(services),
            callReceiverMustBeCallable(services),
        ],
        SdsCallableType: [
            callableTypeMustBeUsedInCorrectContext,
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
        SdsClassBody: [classBodyShouldNotBeEmpty(services)],
        SdsClassMember: [classMemberMustMatchOverriddenMemberAndShouldBeNeeded(services)],
        SdsConstraintList: [constraintListsShouldBeUsedWithCaution(services), constraintListShouldNotBeEmpty(services)],
        SdsDeclaration: [
            nameMustNotOccurOnCoreDeclaration(services),
            nameMustNotStartWithCodegenPrefix,
            nameShouldHaveCorrectCasing(services),
            pythonNameShouldDifferFromSafeDsName(services),
            singleUseAnnotationsMustNotBeRepeated(services),
        ],
        SdsEnum: [enumMustContainUniqueNames],
        SdsEnumBody: [enumBodyShouldNotBeEmpty(services)],
        SdsEnumVariant: [enumVariantMustContainUniqueNames, enumVariantParameterListShouldNotBeEmpty(services)],
        SdsExpressionLambda: [expressionLambdaMustContainUniqueNames],
        SdsFunction: [
            functionMustContainUniqueNames,
            functionResultListShouldNotBeEmpty(services),
            functionPurityMustBeSpecified(services),
            impurityReasonsOfOverridingMethodMustBeSubsetOfOverriddenMethod(services),
            impurityReasonParameterNameMustBelongToParameterOfCorrectType(services),
            impurityReasonShouldNotBeSetMultipleTimes(services),
            pythonCallMustOnlyContainValidTemplateExpressions(services),
            pythonNameMustNotBeSetIfPythonCallIsSet(services),
        ],
        SdsImport: [importPackageMustExist(services), importPackageShouldNotBeEmpty(services)],
        SdsImportedDeclaration: [importedDeclarationAliasShouldDifferFromDeclarationName(services)],
        SdsIndexedAccess: [
            indexedAccessIndexMustBeValid(services),
            indexedAccessIndexMustHaveCorrectType(services),
            indexedAccessReceiverMustBeListOrMap(services),
        ],
        SdsInfixOperation: [
            divisionDivisorMustNotBeZero(services),
            elvisOperatorShouldBeNeeded(services),
            infixOperationOperandsMustHaveCorrectType(services),
        ],
        SdsLambda: [
            lambdaMustBeAssignedToTypedParameter(services),
            lambdaParametersMustNotBeAnnotated,
            lambdaParameterMustNotHaveConstModifier,
        ],
        SdsList: [listMustNotContainNamedTuples(services)],
        SdsLiteralType: [
            literalTypeMustHaveLiterals,
            literalTypeMustNotContainListLiteral,
            literalTypeMustNotContainMapLiteral,
            literalTypesShouldBeUsedWithCaution(services),
            literalTypeShouldNotHaveDuplicateLiteral(services),
        ],
        SdsMap: [mapMustNotContainNamedTuples(services), mapsShouldBeUsedWithCaution(services)],
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
            pipelineFileMustNotBeInBuiltinPackage,
            pythonModuleShouldDifferFromSafeDsPackage(services),
        ],
        SdsNamedType: [
            namedTypeDeclarationShouldNotBeDeprecated(services),
            namedTypeDeclarationShouldNotBeExperimental(services),
            namedTypeMustNotHaveTooManyTypeArguments,
            namedTypeMustNotSetTypeParameterMultipleTimes(services),
            namedTypeMustSetAllTypeParameters(services),
            namedTypeTypeArgumentListShouldBeNeeded(services),
            namedTypeTypeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments,
        ],
        SdsParameter: [
            constantParameterMustHaveConstantDefaultValue(services),
            constantParameterMustHaveTypeThatCanBeEvaluatedToConstant(services),
            parameterMustHaveTypeHint,
            parameterDefaultValueTypeMustMatchParameterType(services),
            pureParameterDefaultValueMustBePure(services),
            requiredParameterMustNotBeDeprecated(services),
            requiredParameterMustNotBeExpert(services),
        ],
        SdsParameterList: [parameterListMustNotHaveRequiredParametersAfterOptionalParameters],
        SdsPipeline: [pipelineMustContainUniqueNames],
        SdsPlaceholder: [placeholdersMustNotBeAnAlias, placeholderShouldBeUsed(services)],
        SdsPrefixOperation: [prefixOperationOperandMustHaveCorrectType(services)],
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
            segmentResultListShouldNotBeEmpty(services),
            segmentShouldBeUsed(services),
        ],
        SdsStatement: [statementMustDoSomething(services)],
        SdsTemplateString: [templateStringMustHaveExpressionBetweenTwoStringParts],
        SdsTypeCast: [typeCastExpressionMustHaveUnknownType(services)],
        SdsTypeParameter: [
            typeParameterMustHaveSufficientContext,
            typeParameterMustBeUsedInCorrectPosition(services),
            typeParameterMustNotHaveMultipleBounds,
            typeParameterMustOnlyBeVariantOnClass,
        ],
        SdsTypeParameterBound: [typeParameterBoundLeftOperandMustBeOwnTypeParameter],
        SdsTypeParameterList: [
            typeParameterListMustNotHaveRequiredTypeParametersAfterOptionalTypeParameters,
            typeParameterListShouldNotBeEmpty(services),
        ],
        SdsUnionType: [
            unionTypeMustBeUsedInCorrectContext,
            unionTypeMustHaveTypes,
            unionTypesShouldBeUsedWithCaution(services),
            unionTypeShouldNotHaveDuplicateTypes(services),
            unionTypeShouldNotHaveASingularTypeArgument(services),
        ],
        SdsYield: [yieldMustNotBeUsedInPipeline, yieldTypeMustMatchResultType(services)],
    };
    registry.register(checks);
};

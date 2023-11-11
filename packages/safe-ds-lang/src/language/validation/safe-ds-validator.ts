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
import { pureParameterMustHaveCallableType } from './builtins/pure.js';
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
    indexedAccessesShouldBeUsedWithCaution,
    literalTypesShouldBeUsedWithCaution,
    mapsShouldBeUsedWithCaution,
    typeArgumentListsShouldBeUsedWithCaution,
    typeParameterListsShouldBeUsedWithCaution,
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
import { constantParameterMustHaveConstantDefaultValue } from './other/declarations/parameters.js';
import { placeholderShouldBeUsed, placeholdersMustNotBeAnAlias } from './other/declarations/placeholders.js';
import {
    segmentParameterShouldBeUsed,
    segmentResultMustBeAssignedExactlyOnce,
    segmentShouldBeUsed,
} from './other/declarations/segments.js';
import { typeParameterConstraintLeftOperandMustBeOwnTypeParameter } from './other/declarations/typeParameterConstraints.js';
import {
    typeParameterMustHaveSufficientContext,
    typeParameterMustNotBeUsedInNestedNamedTypeDeclarations,
} from './other/declarations/typeParameters.js';
import { callArgumentsMustBeConstantIfParameterIsConstant } from './other/expressions/calls.js';
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
    yieldTypeMustMatchResultType,
} from './types.js';

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
        SdsClassMember: [classMemberMustMatchOverriddenMemberAndShouldBeNeeded(services)],
        SdsConstraintList: [constraintListsShouldBeUsedWithCaution, constraintListShouldNotBeEmpty],
        SdsDeclaration: [
            nameMustNotOccurOnCoreDeclaration(services),
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
        SdsIndexedAccess: [
            indexedAccessIndexMustHaveCorrectType(services),
            indexedAccessReceiverMustBeListOrMap(services),
            indexedAccessesShouldBeUsedWithCaution,
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
            literalTypesShouldBeUsedWithCaution,
            literalTypeShouldNotHaveDuplicateLiteral(services),
        ],
        SdsMap: [mapMustNotContainNamedTuples(services), mapsShouldBeUsedWithCaution],
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
            namedTypeTypeArgumentListShouldBeNeeded,
            namedTypeTypeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments,
        ],
        SdsParameter: [
            constantParameterMustHaveConstantDefaultValue(services),
            parameterMustHaveTypeHint,
            parameterDefaultValueTypeMustMatchParameterType(services),
            pureParameterMustHaveCallableType(services),
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
            segmentResultListShouldNotBeEmpty,
            segmentShouldBeUsed(services),
        ],
        SdsTemplateString: [templateStringMustHaveExpressionBetweenTwoStringParts],
        SdsTypeArgumentList: [typeArgumentListsShouldBeUsedWithCaution],
        SdsTypeParameter: [
            typeParameterMustHaveSufficientContext,
            typeParameterMustNotBeUsedInNestedNamedTypeDeclarations,
        ],
        SdsTypeParameterConstraint: [typeParameterConstraintLeftOperandMustBeOwnTypeParameter],
        SdsTypeParameterList: [typeParameterListsShouldBeUsedWithCaution, typeParameterListShouldNotBeEmpty],
        SdsUnionType: [
            unionTypeMustBeUsedInCorrectContext,
            unionTypeMustHaveTypes,
            unionTypesShouldBeUsedWithCaution,
            unionTypeShouldNotHaveDuplicateTypes(services),
            unionTypeShouldNotHaveASingularTypeArgument,
        ],
        SdsYield: [yieldMustNotBeUsedInPipeline, yieldTypeMustMatchResultType(services)],
    };
    registry.register(checks);
};

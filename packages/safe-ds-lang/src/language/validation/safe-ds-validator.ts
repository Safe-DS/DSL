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
    pythonNameMustNotBeSetIfPythonMacroIsSet,
    pythonNameShouldDifferFromSafeDsName,
} from './builtins/pythonName.js';
import { singleUseAnnotationsMustNotBeRepeated } from './builtins/repeatable.js';
import { annotationCallMustHaveCorrectTarget, targetsShouldNotHaveDuplicateEntries } from './builtins/targets.js';
import {
    constraintListsShouldBeUsedWithCaution,
    literalTypesShouldBeUsedWithCaution,
    unionTypesShouldBeUsedWithCaution,
} from './experimentalLanguageFeatures.js';
import {
    classMemberMustMatchOverriddenMemberAndShouldBeNeeded,
    classMustNotInheritItself,
    classMustOnlyInheritASingleClass,
    overridingAndOverriddenMethodsMustNotHavePythonMacro,
    overridingMemberPythonNameMustMatchOverriddenMember,
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
    segmentMustContainUniqueNames,
    staticClassMemberNamesMustNotCollideWithInheritedMembers,
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
import { segmentParameterShouldBeUsed, segmentResultMustBeAssignedExactlyOnce } from './other/declarations/segments.js';
import {
    typeParameterMustBeUsedInCorrectPosition,
    typeParameterMustHaveSufficientContext,
    typeParameterMustOnlyBeVariantOnClass,
    typeParameterUpperBoundMustNotBeUnknown,
} from './other/declarations/typeParameters.js';
import { callArgumentMustBeConstantIfParameterIsConstant, callMustNotBeRecursive } from './other/expressions/calls.js';
import { divisionDivisorMustNotBeZero } from './other/expressions/infixOperations.js';
import {
    lambdaMustBeAssignedToTypedParameter,
    lambdaParameterMustNotHaveConstModifier,
} from './other/expressions/lambdas.js';
import { memberAccessOfEnumVariantMustNotLackInstantiation } from './other/expressions/memberAccesses.js';
import {
    referenceMustNotBeFunctionPointer,
    referenceMustNotBeStaticClassOrEnumReference,
    referenceTargetMustNotBeAnnotationPipelineOrTypeAlias,
} from './other/expressions/references.js';
import { templateStringMustHaveExpressionBetweenTwoStringParts } from './other/expressions/templateStrings.js';
import { importPackageMustNotBeEmpty } from './other/imports.js';
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
import { unionTypeMustHaveTypes, unionTypeShouldNotHaveDuplicateTypes } from './other/types/unionTypes.js';
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
    chainedExpressionNullSafetyShouldBeNeeded,
    classBodyShouldNotBeEmpty,
    constraintListShouldNotBeEmpty,
    elvisOperatorShouldBeNeeded,
    enumBodyShouldNotBeEmpty,
    enumVariantParameterListShouldNotBeEmpty,
    functionResultListShouldNotBeEmpty,
    importedDeclarationAliasShouldDifferFromDeclarationName,
    namedTypeTypeArgumentListShouldBeNeeded,
    segmentResultListShouldNotBeEmpty,
    typeParameterListShouldNotBeEmpty,
    unionTypeShouldNotHaveASingularTypeArgument,
} from './style.js';
import {
    argumentTypesMustMatchParameterTypes,
    attributeMustHaveTypeHint,
    callReceiverMustBeCallable,
    indexedAccessIndexMustHaveCorrectType,
    indexedAccessReceiverMustHaveCorrectType,
    infixOperationOperandsMustHaveCorrectType,
    listMustNotContainNamedTuples,
    mapMustNotContainNamedTuples,
    namedTypeMustSetAllTypeParameters,
    namedTypeTypeArgumentsMustMatchBounds,
    parameterDefaultValueTypeMustMatchParameterType,
    parameterMustHaveTypeHint,
    prefixOperationOperandMustHaveCorrectType,
    resultMustHaveTypeHint,
    typeCastMustNotAlwaysFail,
    typeParameterDefaultValueMustMatchUpperBound,
    yieldTypeMustMatchResultType,
} from './types.js';
import { statementMustDoSomething } from './other/statements/statements.js';
import { indexedAccessIndexMustBeValid } from './other/expressions/indexedAccess.js';
import { typeParameterListMustNotHaveRequiredTypeParametersAfterOptionalTypeParameters } from './other/declarations/typeParameterLists.js';
import { chainedExpressionsMustBeNullSafeIfReceiverIsNullable } from './other/expressions/chainedExpressions.js';
import {
    callArgumentMustRespectParameterBounds,
    parameterBoundParameterMustBeConstFloatOrInt,
    parameterBoundRightOperandMustEvaluateToFloatConstantOrIntConstant,
    parameterDefaultValueMustRespectParameterBounds,
} from './other/declarations/parameterBounds.js';
import { unknownMustOnlyBeUsedAsDefaultValueOfStub } from './other/expressions/literals.js';
import { tagsShouldNotHaveDuplicateEntries } from './builtins/tags.js';
import { moduleMemberShouldBeUsed } from './other/declarations/moduleMembers.js';
import { pipelinesMustBePrivate } from './other/declarations/pipelines.js';
import { thisMustReferToClassInstance } from './other/expressions/this.js';
import {
    outputStatementMustHaveValue,
    outputStatementMustOnlyBeUsedInPipeline,
} from './other/statements/outputStatements.js';
import { messageOfConstraintsMustOnlyReferenceConstantParameters } from './other/declarations/constraints.js';
import { argumentMustBeNamedIfParameterIsOptional } from './other/expressions/arguments.js';
import { typeMustBeUsedInCorrectContext } from './other/types/types.js';

/**
 * Register custom validation checks.
 */
export const registerValidationChecks = function (services: SafeDsServices) {
    const registry = services.validation.ValidationRegistry;
    const checks: ValidationChecks<SafeDsAstType> = {
        SdsAbstractCall: [
            argumentListMustNotHaveTooManyArguments(services),
            argumentListMustSetAllRequiredParameters(services),
            argumentTypesMustMatchParameterTypes(services),
        ],
        SdsAnnotation: [
            annotationMustContainUniqueNames,
            annotationParameterListShouldNotBeEmpty(services),
            annotationParameterShouldNotHaveConstModifier(services),
            targetsShouldNotHaveDuplicateEntries(services),
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
        ],
        SdsArgumentList: [
            argumentListMustNotHavePositionalArgumentsAfterNamedArguments,
            argumentListMustNotSetParameterMultipleTimes(services),
            argumentMustBeNamedIfParameterIsOptional(services),
        ],
        SdsAssignee: [
            assigneeAssignedResultShouldNotBeDeprecated(services),
            assigneeAssignedResultShouldNotBeExperimental(services),
        ],
        SdsAssignment: [
            assignmentAssigneeMustGetValue(services),
            assignmentShouldNotImplicitlyIgnoreResult(services),
            assignmentShouldHaveMoreThanWildcardsAsAssignees(services),
        ],
        SdsAttribute: [attributeMustHaveTypeHint],
        SdsBlockLambda: [blockLambdaMustContainUniqueNames],
        SdsCall: [
            callArgumentListShouldBeNeeded(services),
            callArgumentAssignedToPureParameterMustBePure(services),
            callArgumentMustBeConstantIfParameterIsConstant(services),
            callArgumentMustRespectParameterBounds(services),
            callMustNotBeRecursive(services),
            callReceiverMustBeCallable(services),
        ],
        SdsCallableType: [
            callableTypeMustContainUniqueNames,
            callableTypeMustNotHaveOptionalParameters,
            callableTypeParametersMustNotBeAnnotated,
            callableTypeParameterMustNotHaveConstModifier,
            callableTypeResultsMustNotBeAnnotated,
        ],
        SdsChainedExpression: [
            chainedExpressionsMustBeNullSafeIfReceiverIsNullable(services),
            chainedExpressionNullSafetyShouldBeNeeded(services),
        ],
        SdsClass: [
            classMustContainUniqueNames,
            classMustOnlyInheritASingleClass(services),
            classMustNotInheritItself(services),
            staticClassMemberNamesMustNotCollideWithInheritedMembers(services),
        ],
        SdsClassBody: [classBodyShouldNotBeEmpty(services)],
        SdsClassMember: [
            classMemberMustMatchOverriddenMemberAndShouldBeNeeded(services),
            overridingMemberPythonNameMustMatchOverriddenMember(services),
        ],
        SdsConstraint: [messageOfConstraintsMustOnlyReferenceConstantParameters],
        SdsConstraintList: [constraintListsShouldBeUsedWithCaution(services), constraintListShouldNotBeEmpty(services)],
        SdsDeclaration: [
            nameMustNotOccurOnCoreDeclaration(services),
            nameMustNotStartWithCodegenPrefix,
            nameShouldHaveCorrectCasing(services),
            pythonNameShouldDifferFromSafeDsName(services),
            singleUseAnnotationsMustNotBeRepeated(services),
            tagsShouldNotHaveDuplicateEntries(services),
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
            pythonNameMustNotBeSetIfPythonMacroIsSet(services),
            overridingAndOverriddenMethodsMustNotHavePythonMacro(services),
        ],
        SdsImport: [importPackageMustNotBeEmpty(services)],
        SdsImportedDeclaration: [importedDeclarationAliasShouldDifferFromDeclarationName(services)],
        SdsIndexedAccess: [
            indexedAccessIndexMustBeValid(services),
            indexedAccessIndexMustHaveCorrectType(services),
            indexedAccessReceiverMustHaveCorrectType(services),
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
        SdsMap: [mapMustNotContainNamedTuples(services)],
        SdsMemberAccess: [memberAccessOfEnumVariantMustNotLackInstantiation],
        SdsModule: [
            moduleDeclarationsMustMatchFileKind,
            moduleMemberMustHaveNameThatIsUniqueInPackage(services),
            moduleMustContainUniqueNames,
            moduleWithDeclarationsMustStatePackage,
            pipelineFileMustNotBeInBuiltinPackage,
            pythonModuleShouldDifferFromSafeDsPackage(services),
        ],
        SdsModuleMember: [moduleMemberShouldBeUsed(services)],
        SdsNamedType: [
            namedTypeDeclarationShouldNotBeDeprecated(services),
            namedTypeDeclarationShouldNotBeExperimental(services),
            namedTypeMustNotHaveTooManyTypeArguments,
            namedTypeMustNotSetTypeParameterMultipleTimes(services),
            namedTypeMustSetAllTypeParameters(services),
            namedTypeTypeArgumentListShouldBeNeeded(services),
            namedTypeTypeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments,
            namedTypeTypeArgumentsMustMatchBounds(services),
        ],
        SdsOutputStatement: [outputStatementMustHaveValue(services), outputStatementMustOnlyBeUsedInPipeline],
        SdsParameter: [
            constantParameterMustHaveConstantDefaultValue(services),
            constantParameterMustHaveTypeThatCanBeEvaluatedToConstant(services),
            parameterMustHaveTypeHint,
            parameterDefaultValueMustRespectParameterBounds(services),
            parameterDefaultValueTypeMustMatchParameterType(services),
            pureParameterDefaultValueMustBePure(services),
            requiredParameterMustNotBeDeprecated(services),
            requiredParameterMustNotBeExpert(services),
        ],
        SdsParameterBound: [
            parameterBoundParameterMustBeConstFloatOrInt(services),
            parameterBoundRightOperandMustEvaluateToFloatConstantOrIntConstant(services),
        ],
        SdsParameterList: [parameterListMustNotHaveRequiredParametersAfterOptionalParameters],
        SdsPipeline: [pipelinesMustBePrivate, pipelineMustContainUniqueNames],
        SdsPlaceholder: [placeholdersMustNotBeAnAlias, placeholderShouldBeUsed(services)],
        SdsPrefixOperation: [prefixOperationOperandMustHaveCorrectType(services)],
        SdsReference: [
            referenceMustNotBeFunctionPointer,
            referenceMustNotBeStaticClassOrEnumReference,
            referenceTargetMustNotBeAnnotationPipelineOrTypeAlias,
            referenceTargetShouldNotBeDeprecated(services),
            referenceTargetShouldNotExperimental(services),
        ],
        SdsResult: [resultMustHaveTypeHint],
        SdsSegment: [
            segmentMustContainUniqueNames,
            segmentParameterShouldBeUsed(services),
            segmentResultMustBeAssignedExactlyOnce(services),
            segmentResultListShouldNotBeEmpty(services),
        ],
        SdsStatement: [statementMustDoSomething(services)],
        SdsTemplateString: [templateStringMustHaveExpressionBetweenTwoStringParts],
        SdsThis: [thisMustReferToClassInstance(services)],
        SdsType: [typeMustBeUsedInCorrectContext(services)],
        SdsTypeCast: [typeCastMustNotAlwaysFail(services)],
        SdsTypeParameter: [
            typeParameterDefaultValueMustMatchUpperBound(services),
            typeParameterMustBeUsedInCorrectPosition(services),
            typeParameterMustHaveSufficientContext,
            typeParameterMustOnlyBeVariantOnClass,
            typeParameterUpperBoundMustNotBeUnknown(services),
        ],
        SdsTypeParameterList: [
            typeParameterListMustNotHaveRequiredTypeParametersAfterOptionalTypeParameters,
            typeParameterListShouldNotBeEmpty(services),
        ],
        SdsUnionType: [
            unionTypeMustHaveTypes,
            unionTypesShouldBeUsedWithCaution(services),
            unionTypeShouldNotHaveDuplicateTypes(services),
            unionTypeShouldNotHaveASingularTypeArgument(services),
        ],
        SdsUnknown: [unknownMustOnlyBeUsedAsDefaultValueOfStub],
        SdsYield: [yieldMustNotBeUsedInPipeline, yieldTypeMustMatchResultType(services)],
    };
    registry.register(checks);
};

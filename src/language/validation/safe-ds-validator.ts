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
    nameMustNotStartWithBlockLambdaPrefix,
    nameShouldHaveCorrectCasing,
    pipelineMustContainUniqueNames,
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
    enumBodyShouldNotBeEmpty,
    enumVariantParameterListShouldNotBeEmpty,
    functionResultListShouldNotBeEmpty,
    memberAccessNullSafetyShouldBeNeeded,
    namedTypeTypeArgumentListShouldBeNeeded,
    segmentResultListShouldNotBeEmpty,
    typeParameterListShouldNotBeEmpty,
    unionTypeShouldNotHaveASingularTypeArgument,
} from './style.js';
import { templateStringMustHaveExpressionBetweenTwoStringParts } from './other/expressions/templateStrings.js';
import { yieldMustNotBeUsedInPipeline } from './other/statements/assignments.js';
import { attributeMustHaveTypeHint, parameterMustHaveTypeHint, resultMustHaveTypeHint } from './types.js';
import { moduleDeclarationsMustMatchFileKind, moduleWithDeclarationsMustStatePackage } from './other/modules.js';
import { typeParameterConstraintLeftOperandMustBeOwnTypeParameter } from './other/declarations/typeParameterConstraints.js';
import { parameterListMustNotHaveRequiredParametersAfterOptionalParameters } from './other/declarations/parameterLists.js';
import { unionTypeMustHaveTypeArguments } from './other/types/unionTypes.js';
import {
    callableTypeMustNotHaveOptionalParameters,
    callableTypeParameterMustNotHaveConstModifier,
} from './other/types/callableTypes.js';
import { typeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments } from './other/types/typeArgumentLists.js';
import { argumentListMustNotHavePositionalArgumentsAfterNamedArguments } from './other/argumentLists.js';
import { referenceTargetMustNotBeAnnotationPipelineOrSchema } from './other/expressions/references.js';
import {
    annotationCallAnnotationShouldNotBeDeprecated,
    argumentCorrespondingParameterShouldNotBeDeprecated,
    assigneeAssignedResultShouldNotBeDeprecated,
    namedTypeDeclarationShouldNotBeDeprecated,
    referenceTargetShouldNotBeDeprecated,
} from './builtins/deprecated.js';
import {
    annotationCallAnnotationShouldNotBeExperimental,
    argumentCorrespondingParameterShouldNotBeExperimental,
    assigneeAssignedResultShouldNotBeExperimental,
    namedTypeDeclarationShouldNotBeExperimental,
    referenceTargetShouldNotExperimental,
} from './builtins/experimental.js';
import { placeholderShouldBeUsed } from './other/declarations/placeholders.js';
import { segmentParameterShouldBeUsed, segmentResultMustBeAssignedExactlyOnce } from './other/declarations/segments.js';
import { lambdaParameterMustNotHaveConstModifier } from './other/expressions/lambdas.js';

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
        SdsAssignment: [assignmentShouldHaveMoreThanWildcardsAsAssignees],
        SdsAnnotation: [
            annotationMustContainUniqueNames,
            annotationParameterListShouldNotBeEmpty,
            annotationParameterShouldNotHaveConstModifier,
        ],
        SdsAnnotationCall: [
            annotationCallAnnotationShouldNotBeDeprecated(services),
            annotationCallAnnotationShouldNotBeExperimental(services),
            annotationCallArgumentListShouldBeNeeded,
        ],
        SdsArgument: [
            argumentCorrespondingParameterShouldNotBeDeprecated(services),
            argumentCorrespondingParameterShouldNotBeExperimental(services),
        ],
        SdsArgumentList: [argumentListMustNotHavePositionalArgumentsAfterNamedArguments],
        SdsAttribute: [attributeMustHaveTypeHint],
        SdsBlockLambda: [blockLambdaMustContainUniqueNames],
        SdsCall: [callArgumentListShouldBeNeeded(services)],
        SdsCallableType: [
            callableTypeMustContainUniqueNames,
            callableTypeMustNotHaveOptionalParameters,
            callableTypeParameterMustNotHaveConstModifier,
        ],
        SdsClass: [classMustContainUniqueNames],
        SdsClassBody: [classBodyShouldNotBeEmpty],
        SdsConstraintList: [constraintListShouldNotBeEmpty],
        SdsDeclaration: [nameMustNotStartWithBlockLambdaPrefix, nameShouldHaveCorrectCasing],
        SdsEnum: [enumMustContainUniqueNames],
        SdsEnumBody: [enumBodyShouldNotBeEmpty],
        SdsEnumVariant: [enumVariantMustContainUniqueNames, enumVariantParameterListShouldNotBeEmpty],
        SdsExpressionLambda: [expressionLambdaMustContainUniqueNames],
        SdsFunction: [functionMustContainUniqueNames, functionResultListShouldNotBeEmpty],
        SdsLambda: [lambdaParameterMustNotHaveConstModifier],
        SdsMemberAccess: [memberAccessNullSafetyShouldBeNeeded(services)],
        SdsModule: [moduleDeclarationsMustMatchFileKind, moduleWithDeclarationsMustStatePackage],
        SdsNamedType: [
            namedTypeDeclarationShouldNotBeDeprecated(services),
            namedTypeDeclarationShouldNotBeExperimental(services),
            namedTypeTypeArgumentListShouldBeNeeded,
        ],
        SdsParameter: [parameterMustHaveTypeHint],
        SdsParameterList: [parameterListMustNotHaveRequiredParametersAfterOptionalParameters],
        SdsPipeline: [pipelineMustContainUniqueNames],
        SdsPlaceholder: [placeholderShouldBeUsed(services)],
        SdsReference: [
            referenceTargetMustNotBeAnnotationPipelineOrSchema,
            referenceTargetShouldNotBeDeprecated(services),
            referenceTargetShouldNotExperimental(services),
        ],
        SdsResult: [resultMustHaveTypeHint],
        SdsSegment: [
            segmentMustContainUniqueNames,
            segmentParameterShouldBeUsed(services),
            segmentResultMustBeAssignedExactlyOnce(services),
            segmentResultListShouldNotBeEmpty,
        ],
        SdsTemplateString: [templateStringMustHaveExpressionBetweenTwoStringParts],
        SdsTypeArgumentList: [typeArgumentListMustNotHavePositionalArgumentsAfterNamedArguments],
        SdsTypeParameterConstraint: [typeParameterConstraintLeftOperandMustBeOwnTypeParameter],
        SdsTypeParameterList: [typeParameterListShouldNotBeEmpty],
        SdsUnionType: [unionTypeMustHaveTypeArguments, unionTypeShouldNotHaveASingularTypeArgument],
        SdsYield: [yieldMustNotBeUsedInPipeline],
    };
    registry.register(checks);
};

import { ValidationChecks } from 'langium';
import { SafeDsAstType } from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import {
    blockLambdaMustContainUniqueNames,
    enumMustContainUniqueNames,
    enumVariantMustContainUniqueNames, expressionLambdaMustContainUniqueNames,
    nameMustNotStartWithBlockLambdaPrefix,
    nameShouldHaveCorrectCasing, pipelineMustContainUniqueNames
} from './names.js';
import {
    annotationParameterListShouldNotBeEmpty,
    assignmentShouldHaveMoreThanWildcardsAsAssignees,
    classBodyShouldNotBeEmpty,
    constraintListShouldNotBeEmpty,
    enumBodyShouldNotBeEmpty,
    enumVariantParameterListShouldNotBeEmpty,
    functionResultListShouldNotBeEmpty,
    segmentResultListShouldNotBeEmpty,
    typeParameterListShouldNotBeEmpty,
    unionTypeShouldNotHaveASingularTypeArgument,
} from './style.js';
import { templateStringMustHaveExpressionBetweenTwoStringParts } from './other/expressions/templateStrings.js';
import { yieldMustNotBeUsedInPipeline } from './other/statements/assignments.js';
import { attributeMustHaveTypeHint, parameterMustHaveTypeHint, resultMustHaveTypeHint } from './types.js';
import { moduleDeclarationsMustMatchFileKind, moduleWithDeclarationsMustStatePackage } from './other/modules.js';
import { typeParameterConstraintLeftOperandMustBeOwnTypeParameter } from './other/declarations/typeParameterConstraints.js';
import {
    parameterListMustNotHaveOptionalAndVariadicParameters,
    parameterListMustNotHaveRequiredParametersAfterOptionalParameters,
    parameterListVariadicParameterMustBeLast,
} from './other/declarations/parameterLists.js';
import { importAliasMustNotBeUsedForWildcardImports } from './imports.js';

/**
 * Register custom validation checks.
 */
export const registerValidationChecks = function (services: SafeDsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SafeDsValidator;
    const checks: ValidationChecks<SafeDsAstType> = {
        SdsAssignment: [assignmentShouldHaveMoreThanWildcardsAsAssignees],
        SdsAnnotation: [annotationParameterListShouldNotBeEmpty],
        SdsAttribute: [attributeMustHaveTypeHint],
        SdsBlockLambda: [blockLambdaMustContainUniqueNames],
        SdsClassBody: [classBodyShouldNotBeEmpty],
        SdsConstraintList: [constraintListShouldNotBeEmpty],
        SdsDeclaration: [nameMustNotStartWithBlockLambdaPrefix, nameShouldHaveCorrectCasing],
        SdsEnum: [enumMustContainUniqueNames],
        SdsEnumBody: [enumBodyShouldNotBeEmpty],
        SdsEnumVariant: [enumVariantMustContainUniqueNames, enumVariantParameterListShouldNotBeEmpty],
        SdsExpressionLambda: [expressionLambdaMustContainUniqueNames],
        SdsFunction: [functionResultListShouldNotBeEmpty],
        SdsImportAlias: [importAliasMustNotBeUsedForWildcardImports],
        SdsModule: [moduleDeclarationsMustMatchFileKind, moduleWithDeclarationsMustStatePackage],
        SdsParameter: [parameterMustHaveTypeHint],
        SdsParameterList: [
            parameterListMustNotHaveOptionalAndVariadicParameters,
            parameterListMustNotHaveRequiredParametersAfterOptionalParameters,
            parameterListVariadicParameterMustBeLast,
        ],
        SdsPipeline: [pipelineMustContainUniqueNames],
        SdsResult: [resultMustHaveTypeHint],
        SdsSegment: [segmentResultListShouldNotBeEmpty],
        SdsTemplateString: [templateStringMustHaveExpressionBetweenTwoStringParts],
        SdsTypeParameterConstraint: [typeParameterConstraintLeftOperandMustBeOwnTypeParameter],
        SdsTypeParameterList: [typeParameterListShouldNotBeEmpty],
        SdsUnionType: [unionTypeShouldNotHaveASingularTypeArgument],
        SdsYield: [yieldMustNotBeUsedInPipeline],
    };
    registry.register(checks, validator);
};

/**
 * Implementation of custom validations.
 */
export class SafeDsValidator {}

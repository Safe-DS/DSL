import { ValidationChecks } from 'langium';
import { SafeDsAstType } from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { nameMustNotStartWithBlockLambdaPrefix, nameShouldHaveCorrectCasing } from './names.js';
import {
    annotationParameterListShouldNotBeEmpty,
    assignmentShouldHaveMoreThanWildcardsAsAssignees,
    classBodyShouldNotBeEmpty,
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
        SdsClassBody: [classBodyShouldNotBeEmpty],
        SdsDeclaration: [nameMustNotStartWithBlockLambdaPrefix, nameShouldHaveCorrectCasing],
        SdsEnumBody: [enumBodyShouldNotBeEmpty],
        SdsEnumVariant: [enumVariantParameterListShouldNotBeEmpty],
        SdsFunction: [functionResultListShouldNotBeEmpty],
        SdsModule: [moduleDeclarationsMustMatchFileKind, moduleWithDeclarationsMustStatePackage],
        SdsParameter: [parameterMustHaveTypeHint],
        SdsResult: [resultMustHaveTypeHint],
        SdsSegment: [segmentResultListShouldNotBeEmpty],
        SdsTemplateString: [templateStringMustHaveExpressionBetweenTwoStringParts],
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

import { ValidationChecks } from 'langium';
import { SafeDsAstType } from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { nameMustNotStartWithBlockLambdaPrefix, nameShouldHaveCorrectCasing } from './names.js';
import {
    annotationParameterListShouldNotBeEmpty,
    assignmentShouldHaveMoreThanWildcardsAsAssignees,
    classBodyShouldNotBeEmpty, classTypeParameterListShouldNotBeEmpty,
    enumBodyShouldNotBeEmpty,
    enumVariantParameterListShouldNotBeEmpty, enumVariantTypeParameterListShouldNotBeEmpty,
    functionResultListShouldNotBeEmpty, functionTypeParameterListShouldNotBeEmpty,
    segmentResultListShouldNotBeEmpty, unionTypeShouldNotHaveASingularTypeArgument,
} from './unnecessarySyntax.js';

/**
 * Register custom validation checks.
 */
export const registerValidationChecks = function (services: SafeDsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SafeDsValidator;
    const checks: ValidationChecks<SafeDsAstType> = {
        SdsAssignment: [assignmentShouldHaveMoreThanWildcardsAsAssignees],
        SdsAnnotation: [annotationParameterListShouldNotBeEmpty],
        SdsClass: [classBodyShouldNotBeEmpty, classTypeParameterListShouldNotBeEmpty],
        SdsDeclaration: [nameMustNotStartWithBlockLambdaPrefix, nameShouldHaveCorrectCasing],
        SdsEnum: [enumBodyShouldNotBeEmpty],
        SdsEnumVariant: [enumVariantParameterListShouldNotBeEmpty, enumVariantTypeParameterListShouldNotBeEmpty],
        SdsFunction: [functionResultListShouldNotBeEmpty, functionTypeParameterListShouldNotBeEmpty],
        SdsSegment: [segmentResultListShouldNotBeEmpty],
        SdsUnionType: [unionTypeShouldNotHaveASingularTypeArgument]
    };
    registry.register(checks, validator);
};

/**
 * Implementation of custom validations.
 */
export class SafeDsValidator {}

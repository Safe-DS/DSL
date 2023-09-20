import { ValidationChecks } from 'langium';
import { SafeDsAstType } from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { nameMustNotStartWithBlockLambdaPrefix, nameShouldHaveCorrectCasing } from './names.js';
import { assignmentShouldBeNecessary } from './unnecessarySyntax.js';

/**
 * Register custom validation checks.
 */
export const registerValidationChecks = function (services: SafeDsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SafeDsValidator;
    const checks: ValidationChecks<SafeDsAstType> = {
        SdsAssignment: [assignmentShouldBeNecessary],
        SdsDeclaration: [nameMustNotStartWithBlockLambdaPrefix, nameShouldHaveCorrectCasing],
    };
    registry.register(checks, validator);
};

/**
 * Implementation of custom validations.
 */
export class SafeDsValidator {}

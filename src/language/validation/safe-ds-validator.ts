import {ValidationChecks} from 'langium';
import {SafeDsAstType} from '../generated/ast.js';
import type {SafeDsServices} from '../safe-ds-module.js';
import {nameMustNotStartWithBlockLambdaPrefix} from "./nameConvention.js";

/**
 * Register custom validation checks.
 */
export const registerValidationChecks = function (services: SafeDsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SafeDsValidator;
    const checks: ValidationChecks<SafeDsAstType> = {
        SdsDeclaration: [nameMustNotStartWithBlockLambdaPrefix]
    };
    registry.register(checks, validator);
};

/**
 * Implementation of custom validations.
 */
export class SafeDsValidator {}

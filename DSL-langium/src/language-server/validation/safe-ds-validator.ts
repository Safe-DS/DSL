import { ValidationChecks } from 'langium';
import { SafeDsAstType } from '../generated/ast';
import type { SafeDsServices } from '../safe-ds-module';

/**
 * Register custom validation checks.
 */
export const registerValidationChecks = function (services: SafeDsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SafeDsValidator;
    const checks: ValidationChecks<SafeDsAstType> = {
        // Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
};

/**
 * Implementation of custom validations.
 */
export class SafeDsValidator {
    // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
    //     if (person.name) {
    //         const firstChar = person.name.substring(0, 1);
    //         if (firstChar.toUpperCase() !== firstChar) {
    //             accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
    //         }
    //     }
    // }
}

import { AstUtils, ValidationAcceptor } from 'langium';
import {
    isSdsMap,
    isSdsUnionType,
    type SdsConstraintList,
    type SdsLiteralType,
    type SdsMap,
    type SdsUnionType,
} from '../generated/ast.js';
import { SafeDsServices } from '../safe-ds-module.js';

export const CODE_EXPERIMENTAL_LANGUAGE_FEATURE = 'experimental/language-feature';

export const constraintListsShouldBeUsedWithCaution = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsConstraintList, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateExperimentalLanguageFeature())) {
            /* c8 ignore next 2 */
            return;
        }

        accept('warning', 'Constraint lists & constraints are experimental and may change without prior notice.', {
            node,
            keyword: 'where',
            code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
        });
    };
};

export const literalTypesShouldBeUsedWithCaution = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsLiteralType, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateExperimentalLanguageFeature())) {
            /* c8 ignore next 2 */
            return;
        }

        accept('warning', 'Literal types are experimental and may change without prior notice.', {
            node,
            keyword: 'literal',
            code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
        });
    };
};

export const mapsShouldBeUsedWithCaution = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsMap, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateExperimentalLanguageFeature())) {
            /* c8 ignore next 2 */
            return;
        }

        // There's already a warning on the container
        if (AstUtils.hasContainerOfType(node.$container, isSdsMap)) {
            return;
        }

        accept('warning', 'Map literals are experimental and may change without prior notice.', {
            node,
            code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
        });
    };
};

export const unionTypesShouldBeUsedWithCaution = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsUnionType, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateExperimentalLanguageFeature())) {
            /* c8 ignore next 2 */
            return;
        }

        // There's already a warning on the container
        if (AstUtils.hasContainerOfType(node.$container, isSdsUnionType)) {
            return;
        }

        accept('warning', 'Union types are experimental and may change without prior notice.', {
            node,
            keyword: 'union',
            code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
        });
    };
};

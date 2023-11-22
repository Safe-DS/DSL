import { hasContainerOfType, ValidationAcceptor } from 'langium';
import {
    isSdsIndexedAccess,
    isSdsMap,
    isSdsTypeArgumentList,
    isSdsUnionType,
    type SdsConstraintList,
    type SdsIndexedAccess,
    type SdsLiteralType,
    type SdsMap,
    type SdsTypeArgumentList,
    type SdsTypeParameterList,
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

export const indexedAccessesShouldBeUsedWithCaution = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsIndexedAccess, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateExperimentalLanguageFeature())) {
            /* c8 ignore next 2 */
            return;
        }

        // There's already a warning on the container
        if (hasContainerOfType(node.$container, isSdsIndexedAccess)) {
            return;
        }

        accept('warning', 'Indexed accesses are experimental and may change without prior notice.', {
            node,
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
        if (hasContainerOfType(node.$container, isSdsMap)) {
            return;
        }

        accept('warning', 'Map literals are experimental and may change without prior notice.', {
            node,
            code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
        });
    };
};

export const typeArgumentListsShouldBeUsedWithCaution = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsTypeArgumentList, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateExperimentalLanguageFeature())) {
            /* c8 ignore next 2 */
            return;
        }

        // There's already a warning on the container
        if (
            hasContainerOfType(node.$container, isSdsTypeArgumentList) ||
            hasContainerOfType(node.$container, isSdsUnionType)
        ) {
            return;
        }

        accept(
            'warning',
            'Type argument lists & type arguments are experimental and may change without prior notice.',
            {
                node,
                code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
            },
        );
    };
};

export const typeParameterListsShouldBeUsedWithCaution = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsTypeParameterList, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateExperimentalLanguageFeature())) {
            /* c8 ignore next 2 */
            return;
        }

        accept(
            'warning',
            'Type parameter lists & type parameters are experimental and may change without prior notice.',
            {
                node,
                code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
            },
        );
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
        if (hasContainerOfType(node.$container, isSdsUnionType)) {
            return;
        }

        accept('warning', 'Union types are experimental and may change without prior notice.', {
            node,
            keyword: 'union',
            code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
        });
    };
};

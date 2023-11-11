import { hasContainerOfType, ValidationAcceptor } from 'langium';
import {
    isSdsIndexedAccess,
    isSdsMap,
    isSdsTypeArgumentList,
    isSdsUnionType,
    SdsConstraintList,
    SdsIndexedAccess,
    SdsLiteralType,
    SdsMap,
    type SdsTypeArgumentList,
    type SdsTypeParameterList,
    SdsUnionType,
} from '../generated/ast.js';

export const CODE_EXPERIMENTAL_LANGUAGE_FEATURE = 'experimental/language-feature';

export const constraintListsShouldBeUsedWithCaution = (node: SdsConstraintList, accept: ValidationAcceptor): void => {
    accept('warning', 'Constraint lists & constraints are experimental and may change without prior notice.', {
        node,
        keyword: 'where',
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const indexedAccessesShouldBeUsedWithCaution = (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
    // There's already a warning on the container
    if (hasContainerOfType(node.$container, isSdsIndexedAccess)) {
        return;
    }

    accept('warning', 'Indexed accesses are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const literalTypesShouldBeUsedWithCaution = (node: SdsLiteralType, accept: ValidationAcceptor): void => {
    accept('warning', 'Literal types are experimental and may change without prior notice.', {
        node,
        keyword: 'literal',
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const mapsShouldBeUsedWithCaution = (node: SdsMap, accept: ValidationAcceptor): void => {
    // There's already a warning on the container
    if (hasContainerOfType(node.$container, isSdsMap)) {
        return;
    }

    accept('warning', 'Map literals are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const unionTypesShouldBeUsedWithCaution = (node: SdsUnionType, accept: ValidationAcceptor): void => {
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

export const typeArgumentListsShouldBeUsedWithCaution = (
    node: SdsTypeArgumentList,
    accept: ValidationAcceptor,
): void => {
    // There's already a warning on the container
    if (
        hasContainerOfType(node.$container, isSdsTypeArgumentList) ||
        hasContainerOfType(node.$container, isSdsUnionType)
    ) {
        return;
    }

    accept('warning', 'Type argument lists & type arguments are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const typeParameterListsShouldBeUsedWithCaution = (
    node: SdsTypeParameterList,
    accept: ValidationAcceptor,
): void => {
    accept('warning', 'Type parameter lists & type parameters are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

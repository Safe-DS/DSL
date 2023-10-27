import {
    isSdsIndexedAccess,
    isSdsMap,
    isSdsUnionType,
    SdsIndexedAccess,
    SdsLiteralType,
    SdsMap,
    SdsUnionType,
} from '../generated/ast.js';
import { hasContainerOfType, ValidationAcceptor } from 'langium';

export const CODE_EXPERIMENTAL_LANGUAGE_FEATURE = 'experimental/language-feature';

export const indexedAccessesShouldBeUsedWithCaution = (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
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
    if (hasContainerOfType(node.$container, isSdsMap)) {
        return;
    }

    accept('warning', 'Map literals are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const unionTypesShouldBeUsedWithCaution = (node: SdsUnionType, accept: ValidationAcceptor): void => {
    if (hasContainerOfType(node.$container, isSdsUnionType)) {
        return;
    }

    accept('warning', 'Union types are experimental and may change without prior notice.', {
        node,
        keyword: 'union',
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

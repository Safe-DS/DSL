import { SdsIndexedAccess, SdsLiteralType, SdsMap, SdsUnionType } from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';

export const CODE_EXPERIMENTAL_LANGUAGE_FEATURE = 'experimental/language-feature';

export const indexedAccessesShouldBeUsedWithCaution = (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
    accept('warning', 'Indexed accesses are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const literalTypesShouldBeUsedWithCaution = (node: SdsLiteralType, accept: ValidationAcceptor): void => {
    accept('warning', 'Literal types are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const mapsShouldBeUsedWithCaution = (node: SdsMap, accept: ValidationAcceptor): void => {
    accept('warning', 'Map literals are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

export const unionTypesShouldBeUsedWithCaution = (node: SdsUnionType, accept: ValidationAcceptor): void => {
    accept('warning', 'Union types are experimental and may change without prior notice.', {
        node,
        code: CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    });
};

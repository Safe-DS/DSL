import { SdsIndexedAccess, SdsMap } from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';

export const CODE_EXPERIMENTAL_LANGUAGE_FEATURE = 'experimental/language-feature';

export const indexedAccessesShouldBeUsedWithCaution = (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
    accept('warning', 'Indexed accesses are experimental and may change without prior notice.', {
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

import { type ValidationAcceptor } from 'langium';
import type { SdsFunction } from '../generated/ast.js';
import { findFirstAnnotationCallOf } from '../helpers/nodeProperties.js';
import type { SafeDsServices } from '../safe-ds-module.js';

const CODE_PURITY_IMPURE_AND_PURE = 'purity/impure-and-pure';
const CODE_PURITY_MUST_BE_SPECIFIED = 'purity/must-be-specified';

export const functionPurityMustBeSpecified = (services: SafeDsServices) => {
    const annotations = services.builtins.Annotations;

    return (node: SdsFunction, accept: ValidationAcceptor) => {
        if (annotations.isPure(node) && annotations.isImpure(node)) {
            return accept('error', "'@Impure' and '@Pure' are mutually exclusive.", {
                node,
                property: 'name',
                code: CODE_PURITY_IMPURE_AND_PURE,
            });
        } else if (!annotations.isImpure(node) && !annotations.isPure(node)) {
            return accept(
                'error',
                "The purity of a function must be specified. Call the annotation '@Pure' or '@Impure'.",
                {
                    node,
                    property: 'name',
                    code: CODE_PURITY_MUST_BE_SPECIFIED,
                },
            );
        }

        const impureAnnotationCall = findFirstAnnotationCallOf(node, annotations.Impure);
        if (impureAnnotationCall && annotations.streamImpurityReasons(node).isEmpty()) {
            accept('error', 'At least one impurity reason must be specified.', {
                node: impureAnnotationCall,
                property: 'annotation',
                code: CODE_PURITY_MUST_BE_SPECIFIED,
            });
        }
    };
};

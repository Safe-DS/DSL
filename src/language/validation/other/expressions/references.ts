import { isSdsAnnotation, isSdsPipeline, isSdsSchema, SdsReference } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';

export const CODE_REFERENCE_TARGET = 'reference/target';

export const referenceTargetMustNotBeAnnotationPipelineOrSchema = (
    node: SdsReference,
    accept: ValidationAcceptor,
): void => {
    const target = node.target?.ref;

    if (isSdsAnnotation(target)) {
        accept('error', 'An annotation must not be the target of a reference.', {
            node,
            code: CODE_REFERENCE_TARGET,
        });
    } else if (isSdsPipeline(target)) {
        accept('error', 'A pipeline must not be the target of a reference.', {
            node,
            code: CODE_REFERENCE_TARGET,
        });
    } else if (isSdsSchema(target)) {
        accept('error', 'A schema must not be the target of a reference.', {
            node,
            code: CODE_REFERENCE_TARGET,
        });
    }
};

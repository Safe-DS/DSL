import {
    isSdsAnnotation,
    isSdsCall,
    isSdsFunction, isSdsMemberAccess,
    isSdsPipeline,
    isSdsSchema, isSdsSegment,
    SdsReference,
} from '../../../generated/ast.js';
import { AstNode, ValidationAcceptor } from 'langium';

export const CODE_REFERENCE_FUNCTION_POINTER = 'reference/function-pointer';
export const CODE_REFERENCE_TARGET = 'reference/target';

export const referenceMustNotBeFunctionPointer = (node: SdsReference, accept: ValidationAcceptor): void => {
    const target = node.target?.ref;
    if (!isSdsFunction(target) && !isSdsSegment(target)) {
        return;
    }

    //
    let container: AstNode | undefined = node.$container;
    if (isSdsMemberAccess(container) && node.$containerProperty === 'member') {
        container = container.$container;
    }

    if (!isSdsCall(container)) {
        accept('error', 'Function pointers are not allowed to provide a cleaner graphical view. Use a lambda instead.', {
            node,
            code: CODE_REFERENCE_FUNCTION_POINTER,
        });
    }
};

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

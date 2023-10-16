import {
    isSdsAnnotation,
    isSdsCall,
    isSdsClass,
    isSdsEnum,
    isSdsFunction,
    isSdsMemberAccess,
    isSdsPipeline,
    isSdsSchema,
    isSdsSegment,
    SdsReference,
} from '../../../generated/ast.js';
import { AstNode, ValidationAcceptor } from 'langium';

export const CODE_REFERENCE_FUNCTION_POINTER = 'reference/function-pointer';
export const CODE_REFERENCE_STATIC_CLASS_REFERENCE = 'reference/static-class-reference';
export const CODE_REFERENCE_STATIC_ENUM_REFERENCE = 'reference/static-enum-reference';
export const CODE_REFERENCE_TARGET = 'reference/target';

export const referenceMustNotBeFunctionPointer = (node: SdsReference, accept: ValidationAcceptor): void => {
    const target = node.target.ref;
    if (!isSdsFunction(target) && !isSdsSegment(target)) {
        return;
    }

    // Get the containing member access if the node is on its right side
    let nodeOrContainer: AstNode | undefined = node;
    if (isSdsMemberAccess(node.$container) && node.$containerProperty === 'member') {
        nodeOrContainer = nodeOrContainer.$container;
    }

    if (!isSdsCall(nodeOrContainer?.$container)) {
        accept(
            'error',
            'Function pointers are not allowed to provide a cleaner graphical view. Use a lambda instead.',
            {
                node,
                code: CODE_REFERENCE_FUNCTION_POINTER,
            },
        );
    }
};

export const referenceMustNotBeStaticClassOrEnumReference = (node: SdsReference, accept: ValidationAcceptor) => {
    const target = node.target.ref;
    if (!isSdsClass(target) && !isSdsEnum(target)) {
        return;
    }

    // Get the containing member access if the node is on its right side
    let nodeOrContainer: AstNode | undefined = node;
    if (isSdsMemberAccess(node.$container) && node.$containerProperty === 'member') {
        nodeOrContainer = nodeOrContainer.$container;
    }

    // Access to a member of the class or enum
    if (isSdsMemberAccess(nodeOrContainer?.$container) && nodeOrContainer?.$containerProperty === 'receiver') {
        return;
    }

    // Call of the class or enum
    if (isSdsCall(nodeOrContainer?.$container)) {
        return;
    }

    // Static reference to the class or enum
    if (isSdsClass(target)) {
        accept(
            'error',
            "A class must not be statically referenced.",
            {
                node,
                code: CODE_REFERENCE_STATIC_CLASS_REFERENCE,
            },
        );
    } else if (isSdsEnum(target)) {
        accept(
            'error',
            "An enum must not be statically referenced.",
            {
                node,
                code: CODE_REFERENCE_STATIC_ENUM_REFERENCE,
            },
        );
    }
};

export const referenceTargetMustNotBeAnnotationPipelineOrSchema = (
    node: SdsReference,
    accept: ValidationAcceptor,
): void => {
    const target = node.target.ref;

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

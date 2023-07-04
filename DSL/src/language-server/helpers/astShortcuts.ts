// SdsAbstractDeclaration --------------------------------------------------------------------------
import * as ast from '../generated/ast';
import { SdsAnnotatedObject, SdsAnnotationCall, SdsClass, SdsObject } from '../generated/ast';

export const annotationCallsOrEmpty = function (node: SdsAnnotatedObject): SdsAnnotationCall[] {
    if (ast.isSdsDeclaration(node)) {
        return node?.annotationCallList?.annotationCalls ?? node?.annotationCalls ?? [];
    } else {
        return node?.annotationCalls ?? [];
    }
};

export const classMembersOrEmpty = function (node: SdsClass): SdsObject[] {
    return node.body?.members ?? [];
};

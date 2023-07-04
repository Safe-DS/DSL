// SdsAbstractDeclaration --------------------------------------------------------------------------
import {
    isSdsDeclaration,
    SdsAnnotatedObject,
    SdsAnnotationCall,
    SdsClass,
    SdsObject,
    SdsTypeArgument,
    SdsTypeArgumentList
} from '../generated/ast';

export const annotationCallsOrEmpty = function (node: SdsAnnotatedObject): SdsAnnotationCall[] {
    if (isSdsDeclaration(node)) {
        return node?.annotationCallList?.annotationCalls ?? node?.annotationCalls ?? [];
    } else {
        return node?.annotationCalls ?? [];
    }
};

export const classMembersOrEmpty = function (node: SdsClass): SdsObject[] {
    return node.body?.members ?? [];
};

export const typeArgumentsOrEmpty = function (node: SdsTypeArgumentList | undefined): SdsTypeArgument[] {
    return node?.typeArguments ?? [];
}

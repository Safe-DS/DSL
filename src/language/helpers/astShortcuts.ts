// SdsAbstractDeclaration --------------------------------------------------------------------------
import {
    isSdsDeclaration,
    SdsAnnotatedObject,
    SdsAnnotationCall,
    SdsLiteral,
    SdsLiteralType,
    SdsTypeArgument,
    SdsTypeArgumentList,
} from '../generated/ast.js';

export const annotationCallsOrEmpty = function (node: SdsAnnotatedObject): SdsAnnotationCall[] {
    if (isSdsDeclaration(node)) {
        return node?.annotationCallList?.annotationCalls ?? node?.annotationCalls ?? [];
    } else {
        return node?.annotationCalls ?? [];
    }
};

export const literalsOrEmpty = function (node: SdsLiteralType | undefined): SdsLiteral[] {
    return node?.literalList?.literals ?? [];
};

export const typeArgumentsOrEmpty = function (node: SdsTypeArgumentList | undefined): SdsTypeArgument[] {
    return node?.typeArguments ?? [];
};

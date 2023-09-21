// SdsAbstractDeclaration --------------------------------------------------------------------------
import {
    isSdsDeclaration,
    SdsAnnotatedObject,
    SdsAnnotationCall, SdsImport,
    SdsLiteral,
    SdsLiteralType, SdsResult, SdsResultList,
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

export const resultsOrEmpty = function (node: SdsResultList | undefined): SdsResult[] {
    return node?.results ?? [];
}

export const typeArgumentsOrEmpty = function (node: SdsTypeArgumentList | undefined): SdsTypeArgument[] {
    return node?.typeArguments ?? [];
};

export const isWildcardImport = function (node: SdsImport): boolean {
    const importedNamespace = node.importedNamespace ?? '';
    return importedNamespace.endsWith('*')
}

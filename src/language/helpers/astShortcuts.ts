import {
    isSdsDeclaration,
    SdsAnnotatedObject,
    SdsAnnotationCall, SdsEnum, SdsEnumVariant,
    SdsLiteral,
    SdsLiteralType,
    SdsResult,
    SdsResultList,
    SdsTypeArgument,
    SdsTypeArgumentList,
} from '../generated/ast.js';

export const annotationCallsOrEmpty = function (node: SdsAnnotatedObject | undefined): SdsAnnotationCall[] {
    if (!node) {
        return [];
    }

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
};

export const typeArgumentsOrEmpty = function (node: SdsTypeArgumentList | undefined): SdsTypeArgument[] {
    return node?.typeArguments ?? [];
};

export const variantsOrEmpty = function (node: SdsEnum | undefined): SdsEnumVariant[] {
    return node?.body?.variants ?? [];
}

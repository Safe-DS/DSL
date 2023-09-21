import {
    isSdsDeclaration,
    SdsAnnotatedObject,
    SdsAnnotationCall,
    SdsEnum,
    SdsEnumVariant,
    SdsLiteral,
    SdsLiteralType,
    SdsParameter,
    SdsParameterList,
    SdsResult,
    SdsResultList,
    SdsTypeArgument,
    SdsTypeArgumentList,
    SdsTypeParameter,
    SdsTypeParameterList,
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

export const parametersOrEmpty = function (node: SdsParameterList | undefined): SdsParameter[] {
    return node?.parameters ?? [];
};

export const resultsOrEmpty = function (node: SdsResultList | undefined): SdsResult[] {
    return node?.results ?? [];
};

export const typeArgumentsOrEmpty = function (node: SdsTypeArgumentList | undefined): SdsTypeArgument[] {
    return node?.typeArguments ?? [];
};

export const typeParametersOrEmpty = function (node: SdsTypeParameterList | undefined): SdsTypeParameter[] {
    return node?.typeParameters ?? [];
};

export const variantsOrEmpty = function (node: SdsEnum | undefined): SdsEnumVariant[] {
    return node?.body?.variants ?? [];
};

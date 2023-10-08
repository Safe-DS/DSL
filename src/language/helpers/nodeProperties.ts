import {
    isSdsAssignment,
    isSdsAttribute,
    isSdsBlockLambda,
    isSdsBlockLambdaResult,
    isSdsCallableType,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsModule,
    isSdsModuleMember,
    isSdsPlaceholder,
    isSdsSegment,
    isSdsTypeParameterList, isSdsYield,
    SdsAbstractCall,
    SdsAbstractResult,
    SdsAnnotatedObject,
    SdsAnnotationCall,
    SdsArgument,
    SdsAssignee,
    SdsAssignment,
    SdsBlock,
    SdsBlockLambda,
    SdsBlockLambdaResult,
    SdsCallable,
    SdsClass,
    SdsClassMember,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsImport,
    SdsImportedDeclaration,
    SdsLiteral,
    SdsLiteralType,
    SdsModule,
    SdsModuleMember,
    SdsNamedTypeDeclaration,
    SdsParameter,
    SdsPlaceholder,
    SdsQualifiedImport,
    SdsResult,
    SdsResultList,
    SdsStatement,
    SdsTypeArgument,
    SdsTypeArgumentList,
    SdsTypeParameter,
    SdsTypeParameterList, SdsYield,
} from '../generated/ast.js';
import { AstNode, getContainerOfType, stream } from 'langium';

// -------------------------------------------------------------------------------------------------
// Checks
// -------------------------------------------------------------------------------------------------

export const isInternal = (node: SdsDeclaration): boolean => {
    return isSdsSegment(node) && node.visibility === 'internal';
};

export const isNamedArgument = (node: SdsArgument): boolean => {
    return Boolean(node.parameter);
};

export const isNamedTypeArgument = (node: SdsTypeArgument): boolean => {
    return Boolean(node.typeParameter);
};

export const isRequiredParameter = (node: SdsParameter): boolean => {
    return !node.defaultValue && !node.isVariadic;
};

export const isStatic = (node: SdsClassMember): boolean => {
    if (isSdsClass(node) || isSdsEnum(node)) {
        return true;
    } else if (isSdsAttribute(node)) {
        return node.isStatic;
    } else if (isSdsFunction(node)) {
        return node.isStatic;
    } else {
        /* c8 ignore next 2 */
        return false;
    }
};

// -------------------------------------------------------------------------------------------------
// Accessors for list elements
// -------------------------------------------------------------------------------------------------

export const abstractResultsOrEmpty = (node: SdsCallable | undefined): SdsAbstractResult[] => {
    if (!node) {
        return [];
    }

    if (isSdsBlockLambda(node)) {
        return blockLambdaResultsOrEmpty(node);
    } else if (isSdsCallableType(node)) {
        return resultsOrEmpty(node.resultList);
    } else if (isSdsFunction(node)) {
        return resultsOrEmpty(node.resultList);
    } else if (isSdsSegment(node)) {
        return resultsOrEmpty(node.resultList);
    } /* c8 ignore start */ else {
        return [];
    } /* c8 ignore stop */
};

export const annotationCallsOrEmpty = (node: SdsAnnotatedObject | undefined): SdsAnnotationCall[] => {
    if (!node) {
        /* c8 ignore next 2 */
        return [];
    }

    if (isSdsDeclaration(node)) {
        return node?.annotationCallList?.annotationCalls ?? node?.annotationCalls ?? [];
    } else {
        /* c8 ignore next 2 */
        return node?.annotationCalls ?? [];
    }
};
export const argumentsOrEmpty = (node: SdsAbstractCall | undefined): SdsArgument[] => {
    return node?.argumentList?.arguments ?? [];
};
export const assigneesOrEmpty = (node: SdsAssignment | undefined): SdsAssignee[] => {
    return node?.assigneeList?.assignees ?? [];
};
export const blockLambdaResultsOrEmpty = (node: SdsBlockLambda | undefined): SdsBlockLambdaResult[] => {
    return stream(statementsOrEmpty(node?.body))
        .filter(isSdsAssignment)
        .flatMap(assigneesOrEmpty)
        .filter(isSdsBlockLambdaResult)
        .toArray();
};
export const importedDeclarationsOrEmpty = (node: SdsQualifiedImport | undefined): SdsImportedDeclaration[] => {
    return node?.importedDeclarationList?.importedDeclarations ?? [];
};

export const literalsOrEmpty = (node: SdsLiteralType | undefined): SdsLiteral[] => {
    return node?.literalList?.literals ?? [];
};
export const classMembersOrEmpty = (
    node: SdsClass | undefined,
    filterFunction: (member: SdsClassMember) => boolean = () => true,
): SdsClassMember[] => {
    return node?.body?.members?.filter(filterFunction) ?? [];
};

export const enumVariantsOrEmpty = (node: SdsEnum | undefined): SdsEnumVariant[] => {
    return node?.body?.variants ?? [];
};

export const importsOrEmpty = (node: SdsModule | undefined): SdsImport[] => {
    return node?.imports ?? [];
};

export const moduleMembersOrEmpty = (node: SdsModule | undefined): SdsModuleMember[] => {
    return node?.members?.filter(isSdsModuleMember) ?? [];
};

export const packageNameOrUndefined = (node: AstNode | undefined): string | undefined => {
    return getContainerOfType(node, isSdsModule)?.name;
};

export const parametersOrEmpty = (node: SdsCallable | undefined): SdsParameter[] => {
    return node?.parameterList?.parameters ?? [];
};

export const placeholdersOrEmpty = (node: SdsBlock | undefined): SdsPlaceholder[] => {
    return stream(statementsOrEmpty(node))
        .filter(isSdsAssignment)
        .flatMap(assigneesOrEmpty)
        .filter(isSdsPlaceholder)
        .toArray();
};

export const resultsOrEmpty = (node: SdsResultList | undefined): SdsResult[] => {
    return node?.results ?? [];
};

export const statementsOrEmpty = (node: SdsBlock | undefined): SdsStatement[] => {
    return node?.statements ?? [];
};

export const typeArgumentsOrEmpty = (node: SdsTypeArgumentList | undefined): SdsTypeArgument[] => {
    return node?.typeArguments ?? [];
};

export const typeParametersOrEmpty = (
    node: SdsTypeParameterList | SdsNamedTypeDeclaration | undefined,
): SdsTypeParameter[] => {
    if (!node) {
        return [];
    }

    if (isSdsTypeParameterList(node)) {
        return node.typeParameters;
    } else if (isSdsClass(node)) {
        return typeParametersOrEmpty(node.typeParameterList);
    } else if (isSdsEnumVariant(node)) {
        return typeParametersOrEmpty(node.typeParameterList);
    } /* c8 ignore start */ else {
        return [];
    } /* c8 ignore stop */
};

export const yieldsOrEmpty = (node: SdsBlock | undefined): SdsYield[] => {
    return stream(statementsOrEmpty(node))
        .filter(isSdsAssignment)
        .flatMap(assigneesOrEmpty)
        .filter(isSdsYield)
        .toArray();
};

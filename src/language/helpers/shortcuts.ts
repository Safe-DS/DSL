import {
    isSdsAssignment,
    isSdsBlockLambdaResult,
    isSdsDeclaration,
    isSdsPlaceholder,
    SdsAnnotatedObject,
    SdsAnnotationCall,
    SdsAssignee,
    SdsAssignment,
    SdsBlock,
    SdsBlockLambda,
    SdsBlockLambdaResult,
    SdsClass,
    SdsClassMember,
    SdsEnum,
    SdsEnumVariant,
    SdsLiteral,
    SdsLiteralType,
    SdsParameter,
    SdsParameterList,
    SdsPlaceholder,
    SdsResult,
    SdsResultList,
    SdsStatement,
    SdsTypeArgument,
    SdsTypeArgumentList,
    SdsTypeParameter,
    SdsTypeParameterList,
} from '../generated/ast.js';
import { stream } from 'langium';

export const annotationCallsOrEmpty = function (node: SdsAnnotatedObject | undefined): SdsAnnotationCall[] {
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

export const assigneesOrEmpty = function (node: SdsAssignment | undefined): SdsAssignee[] {
    return node?.assigneeList?.assignees ?? [];
};

export const blockLambdaResultsOrEmpty = function (node: SdsBlockLambda | undefined): SdsBlockLambdaResult[] {
    return stream(statementsOrEmpty(node?.body))
        .filter(isSdsAssignment)
        .flatMap(assigneesOrEmpty)
        .filter(isSdsBlockLambdaResult)
        .toArray();
};

export const literalsOrEmpty = function (node: SdsLiteralType | undefined): SdsLiteral[] {
    return node?.literalList?.literals ?? [];
};

export const classMembersOrEmpty = function (
    node: SdsClass | undefined,
    filterFunction: (member: SdsClassMember) => boolean = () => true,
): SdsClassMember[] {
    return node?.body?.members?.filter(filterFunction) ?? [];
};

export const enumVariantsOrEmpty = function (node: SdsEnum | undefined): SdsEnumVariant[] {
    return node?.body?.variants ?? [];
};

export const parametersOrEmpty = function (node: SdsParameterList | undefined): SdsParameter[] {
    return node?.parameters ?? [];
};

export const placeholdersOrEmpty = function (node: SdsBlock | undefined): SdsPlaceholder[] {
    return stream(statementsOrEmpty(node))
        .filter(isSdsAssignment)
        .flatMap(assigneesOrEmpty)
        .filter(isSdsPlaceholder)
        .toArray();
};

export const resultsOrEmpty = function (node: SdsResultList | undefined): SdsResult[] {
    return node?.results ?? [];
};

export const statementsOrEmpty = function (node: SdsBlock | undefined): SdsStatement[] {
    return node?.statements ?? [];
};

export const typeArgumentsOrEmpty = function (node: SdsTypeArgumentList | undefined): SdsTypeArgument[] {
    return node?.typeArguments ?? [];
};

export const typeParametersOrEmpty = function (node: SdsTypeParameterList | undefined): SdsTypeParameter[] {
    return node?.typeParameters ?? [];
};

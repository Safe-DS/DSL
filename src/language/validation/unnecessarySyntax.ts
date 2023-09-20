import {isSdsWildcard, SdsAnnotation, SdsAssignment, SdsClass, SdsEnum, SdsEnumVariant} from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import {isEmpty} from "radash";

export const CODE_STYLE_UNNECESSARY_ASSIGNMENT = 'style/unnecessary-assignment';
export const CODE_STYLE_UNNECESSARY_ARGUMENT_LIST = 'style/unnecessary-argument-list';
export const CODE_STYLE_UNNECESSARY_BODY = 'style/unnecessary-body';
export const CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR = 'style/unnecessary-elvis-operator';
export const CODE_STYLE_UNNECESSARY_SAFE_ACCESS = 'style/unnecessary-safe-access';
export const CODE_STYLE_UNNECESSARY_PARAMETER_LIST = 'style/unnecessary-parameter-list';
export const CODE_STYLE_UNNECESSARY_RESULT_LIST = 'style/unnecessary-result-list';
export const CODE_STYLE_UNNECESSARY_TYPE_ARGUMENT_LIST = 'style/unnecessary-type-argument-list';
export const CODE_STYLE_UNNECESSARY_TYPE_PARAMETER_LIST = 'style/unnecessary-type-parameter-list';
export const CODE_STYLE_UNNECESSARY_UNION_TYPE = 'style/unnecessary-union-type';

export const assignmentShouldHaveMoreThanWildcardsAsAssignees = (node: SdsAssignment, accept: ValidationAcceptor): void => {
    const assignees = node.assigneeList?.assignees ?? [];
    if (assignees.every(isSdsWildcard)) {
        accept(
            'info',
            'This assignment can be replaced by an expression statement.',
            {
                node,
                code: CODE_STYLE_UNNECESSARY_ASSIGNMENT,
            }
        );
    }
};

export const classBodyShouldNotBeEmpty = (node: SdsClass, accept: ValidationAcceptor) => {
    if (node.body !== null && isEmpty(node.body?.members)) {
        accept(
            'info',
            "This body can be removed.",
            {
                node,
                property: 'body',
                code: CODE_STYLE_UNNECESSARY_BODY,
            }
        )
    }
}

export const enumBodyShouldNotBeEmpty = (node: SdsEnum, accept: ValidationAcceptor) => {
    if (node.body !== null && isEmpty(node.body?.variants)) {
        accept(
            'info',
            "This body can be removed.",
            {
                node,
                property: 'body',
                code: CODE_STYLE_UNNECESSARY_BODY,
            }
        )
    }
}

export const annotationParameterListShouldNotBeEmpty = (node: SdsAnnotation, accept: ValidationAcceptor) => {
    if (node.parameterList !== null && isEmpty(node.parameterList?.parameters)) {
        accept(
            'info',
            "This parameter list can be removed.",
            {
                node,
                property: 'parameterList',
                code: CODE_STYLE_UNNECESSARY_PARAMETER_LIST,
            }
        )
    }
}

export const enumVariantParameterListShouldNotBeEmpty = (node: SdsEnumVariant, accept: ValidationAcceptor) => {
    if (node.parameterList !== null && isEmpty(node.parameterList?.parameters)) {
        accept(
            'info',
            "This parameter list can be removed.",
            {
                node,
                property: 'parameterList',
                code: CODE_STYLE_UNNECESSARY_PARAMETER_LIST,
            }
        )
    }
}

import {
    isSdsWildcard,
    SdsAnnotation,
    SdsAssignment,
    SdsClassBody,
    SdsConstraintList,
    SdsEnumBody,
    SdsEnumVariant,
    SdsFunction,
    SdsSegment,
    SdsTypeParameterList,
    SdsUnionType,
} from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { isEmpty } from 'radash';

export const CODE_STYLE_UNNECESSARY_ASSIGNMENT = 'style/unnecessary-assignment';
export const CODE_STYLE_UNNECESSARY_ARGUMENT_LIST = 'style/unnecessary-argument-list';
export const CODE_STYLE_UNNECESSARY_BODY = 'style/unnecessary-body';
export const CODE_STYLE_UNNECESSARY_CONSTRAINT_LIST = 'style/unnecessary-constraint-list';
export const CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR = 'style/unnecessary-elvis-operator';
export const CODE_STYLE_UNNECESSARY_SAFE_ACCESS = 'style/unnecessary-safe-access';
export const CODE_STYLE_UNNECESSARY_PARAMETER_LIST = 'style/unnecessary-parameter-list';
export const CODE_STYLE_UNNECESSARY_RESULT_LIST = 'style/unnecessary-result-list';
export const CODE_STYLE_UNNECESSARY_TYPE_ARGUMENT_LIST = 'style/unnecessary-type-argument-list';
export const CODE_STYLE_UNNECESSARY_TYPE_PARAMETER_LIST = 'style/unnecessary-type-parameter-list';
export const CODE_STYLE_UNNECESSARY_UNION_TYPE = 'style/unnecessary-union-type';

// -----------------------------------------------------------------------------
// Unnecessary assignment
// -----------------------------------------------------------------------------

export const assignmentShouldHaveMoreThanWildcardsAsAssignees = (
    node: SdsAssignment,
    accept: ValidationAcceptor,
): void => {
    const assignees = node.assigneeList?.assignees ?? [];
    if (assignees.every(isSdsWildcard)) {
        accept('info', 'This assignment can be replaced by an expression statement.', {
            node,
            code: CODE_STYLE_UNNECESSARY_ASSIGNMENT,
        });
    }
};

// -----------------------------------------------------------------------------
// Unnecessary bodies
// -----------------------------------------------------------------------------

export const classBodyShouldNotBeEmpty = (node: SdsClassBody, accept: ValidationAcceptor) => {
    if (isEmpty(node.members)) {
        accept('info', 'This body can be removed.', {
            node,
            code: CODE_STYLE_UNNECESSARY_BODY,
        });
    }
};

export const enumBodyShouldNotBeEmpty = (node: SdsEnumBody, accept: ValidationAcceptor) => {
    if (isEmpty(node.variants)) {
        accept('info', 'This body can be removed.', {
            node,
            code: CODE_STYLE_UNNECESSARY_BODY,
        });
    }
};

// -----------------------------------------------------------------------------
// Unnecessary constraint list
// -----------------------------------------------------------------------------

export const constraintListShouldNotBeEmpty = (node: SdsConstraintList, accept: ValidationAcceptor) => {
    if (isEmpty(node.constraints)) {
        accept('info', 'This constraint list can be removed.', {
            node,
            code: CODE_STYLE_UNNECESSARY_CONSTRAINT_LIST,
        });
    }
};

// -----------------------------------------------------------------------------
// Unnecessary parameter lists
// -----------------------------------------------------------------------------

export const annotationParameterListShouldNotBeEmpty = (node: SdsAnnotation, accept: ValidationAcceptor) => {
    if (node.parameterList && isEmpty(node.parameterList.parameters)) {
        accept('info', 'This parameter list can be removed.', {
            node,
            property: 'parameterList',
            code: CODE_STYLE_UNNECESSARY_PARAMETER_LIST,
        });
    }
};

export const enumVariantParameterListShouldNotBeEmpty = (node: SdsEnumVariant, accept: ValidationAcceptor) => {
    if (node.parameterList && isEmpty(node.parameterList.parameters)) {
        accept('info', 'This parameter list can be removed.', {
            node,
            property: 'parameterList',
            code: CODE_STYLE_UNNECESSARY_PARAMETER_LIST,
        });
    }
};

// -----------------------------------------------------------------------------
// Unnecessary result lists
// -----------------------------------------------------------------------------

export const functionResultListShouldNotBeEmpty = (node: SdsFunction, accept: ValidationAcceptor) => {
    if (node.resultList && isEmpty(node.resultList.results)) {
        accept('info', 'This result list can be removed.', {
            node,
            property: 'resultList',
            code: CODE_STYLE_UNNECESSARY_RESULT_LIST,
        });
    }
};

export const segmentResultListShouldNotBeEmpty = (node: SdsSegment, accept: ValidationAcceptor) => {
    if (node.resultList && isEmpty(node.resultList.results)) {
        accept('info', 'This result list can be removed.', {
            node,
            property: 'resultList',
            code: CODE_STYLE_UNNECESSARY_RESULT_LIST,
        });
    }
};

// -----------------------------------------------------------------------------
// Unnecessary type parameter lists
// -----------------------------------------------------------------------------

export const typeParameterListShouldNotBeEmpty = (node: SdsTypeParameterList, accept: ValidationAcceptor) => {
    if (isEmpty(node.typeParameters)) {
        accept('info', 'This type parameter list can be removed.', {
            node,
            code: CODE_STYLE_UNNECESSARY_TYPE_PARAMETER_LIST,
        });
    }
};

// -----------------------------------------------------------------------------
// Unnecessary type parameter lists
// -----------------------------------------------------------------------------

export const unionTypeShouldNotHaveASingularTypeArgument = (node: SdsUnionType, accept: ValidationAcceptor) => {
    const typeArguments = node.typeArgumentList?.typeArguments ?? [];
    if (typeArguments.length === 1) {
        accept('info', 'This can be replaced by the singular type argument of the union type.', {
            node,
            code: CODE_STYLE_UNNECESSARY_UNION_TYPE,
        });
    }
};

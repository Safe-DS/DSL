import { isSdsWildcard, SdsAssignment } from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';

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

export const assignmentShouldBeNecessary = (node: SdsAssignment, accept: ValidationAcceptor): void => {
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

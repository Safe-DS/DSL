import {
    isSdsEnumVariant,
    isSdsWildcard,
    SdsAnnotation,
    SdsAnnotationCall,
    SdsAssignment,
    SdsCall,
    SdsClassBody,
    SdsConstraintList,
    SdsEnumBody,
    SdsEnumVariant,
    SdsFunction,
    SdsImportedDeclaration,
    SdsInfixOperation,
    SdsMemberAccess,
    SdsNamedType,
    SdsSegment,
    SdsTypeParameterList,
    SdsUnionType,
} from '../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { isEmpty } from 'radash';
import { isRequiredParameter, parametersOrEmpty, typeParametersOrEmpty } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { UnknownType } from '../typing/model.js';
import { toConstantExpressionOrUndefined } from '../partialEvaluation/toConstantExpressionOrUndefined.js';
import { ConstantNull } from '../partialEvaluation/model.js';

export const CODE_STYLE_UNNECESSARY_ASSIGNMENT = 'style/unnecessary-assignment';
export const CODE_STYLE_UNNECESSARY_ARGUMENT_LIST = 'style/unnecessary-argument-list';
export const CODE_STYLE_UNNECESSARY_BODY = 'style/unnecessary-body';
export const CODE_STYLE_UNNECESSARY_CONST_MODIFIER = 'style/unnecessary-const-modifier';
export const CODE_STYLE_UNNECESSARY_CONSTRAINT_LIST = 'style/unnecessary-constraint-list';
export const CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR = 'style/unnecessary-elvis-operator';
export const CODE_STYLE_UNNECESSARY_IMPORT_ALIAS = 'style/unnecessary-import-alias';
export const CODE_STYLE_UNNECESSARY_PARAMETER_LIST = 'style/unnecessary-parameter-list';
export const CODE_STYLE_UNNECESSARY_RESULT_LIST = 'style/unnecessary-result-list';
export const CODE_STYLE_UNNECESSARY_SAFE_ACCESS = 'style/unnecessary-safe-access';
export const CODE_STYLE_UNNECESSARY_TYPE_ARGUMENT_LIST = 'style/unnecessary-type-argument-list';
export const CODE_STYLE_UNNECESSARY_TYPE_PARAMETER_LIST = 'style/unnecessary-type-parameter-list';
export const CODE_STYLE_UNNECESSARY_UNION_TYPE = 'style/unnecessary-union-type';

// -----------------------------------------------------------------------------
// Unnecessary argument lists
// -----------------------------------------------------------------------------

export const annotationCallArgumentListShouldBeNeeded = (node: SdsAnnotationCall, accept: ValidationAcceptor): void => {
    const argumentList = node.argumentList;
    if (!argumentList || !isEmpty(argumentList.arguments)) {
        // If there are arguments, they are either needed or erroneous (i.e. we already show an error)
        return;
    }

    const annotation = node.annotation?.ref;
    if (!annotation) {
        return;
    }

    const hasRequiredParameters = parametersOrEmpty(annotation).some(isRequiredParameter);
    if (!hasRequiredParameters) {
        accept('info', 'This argument list can be removed.', {
            node: argumentList,
            code: CODE_STYLE_UNNECESSARY_ARGUMENT_LIST,
        });
    }
};

export const callArgumentListShouldBeNeeded =
    (services: SafeDsServices) =>
    (node: SdsCall, accept: ValidationAcceptor): void => {
        const argumentList = node.argumentList;
        if (!argumentList || !isEmpty(argumentList.arguments)) {
            // If there are arguments, they are either needed or erroneous (i.e. we already show an error)
            return;
        }

        const callable = services.helpers.NodeMapper.callToCallableOrUndefined(node);
        if (!isSdsEnumVariant(callable)) {
            return;
        }

        if (isEmpty(parametersOrEmpty(callable))) {
            accept('info', 'This argument list can be removed.', {
                node: argumentList,
                code: CODE_STYLE_UNNECESSARY_ARGUMENT_LIST,
            });
        }
    };

// -----------------------------------------------------------------------------
// Unnecessary assignments
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
// Unnecessary const modifier
// -----------------------------------------------------------------------------

export const annotationParameterShouldNotHaveConstModifier = (node: SdsAnnotation, accept: ValidationAcceptor) => {
    for (const parameter of parametersOrEmpty(node)) {
        if (parameter.isConstant) {
            accept('info', 'Annotation parameters are always const, so this modifier can be removed.', {
                node: parameter,
                property: 'isConstant',
                code: CODE_STYLE_UNNECESSARY_CONST_MODIFIER,
            });
        }
    }
};

// -----------------------------------------------------------------------------
// Unnecessary constraint lists
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
// Unnecessary elvis operator
// -----------------------------------------------------------------------------

export const elvisOperatorShouldBeNeeded = (services: SafeDsServices) => {
    const typeComputer = services.types.TypeComputer;

    return (node: SdsInfixOperation, accept: ValidationAcceptor): void => {
        if (node.operator !== '?:') return;

        const leftType = typeComputer.computeType(node.leftOperand);
        if (!leftType.isNullable) {
            accept(
                'info',
                'The left operand is never null, so the elvis operator is unnecessary (keep the left operand).',
                {
                    node,
                    code: CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR,
                },
            );
        }

        const leftValue = toConstantExpressionOrUndefined(node.leftOperand);
        const rightValue = toConstantExpressionOrUndefined(node.rightOperand);
        if (leftValue === ConstantNull && rightValue === ConstantNull) {
            accept('info', 'Both operands are always null, so the elvis operator is unnecessary (replace it with null).', {
                node,
                code: CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR,
            });
        } else if (leftValue === ConstantNull) {
            accept(
                'info',
                'The left operand is always null, so the elvis operator is unnecessary (keep the right operand).',
                {
                    node,
                    code: CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR,
                },
            );
        } else if (rightValue === ConstantNull) {
            accept(
                'info',
                'The right operand is always null, so the elvis operator is unnecessary (keep the left operand).',
                {
                    node,
                    code: CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR,
                },
            );
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary import alias
// -----------------------------------------------------------------------------

export const importedDeclarationAliasShouldDifferFromDeclarationName = (
    node: SdsImportedDeclaration,
    accept: ValidationAcceptor,
) => {
    if (node.alias && node.alias.alias === node.declaration.$refText) {
        accept('info', 'This alias can be removed.', {
            node,
            property: 'alias',
            code: CODE_STYLE_UNNECESSARY_IMPORT_ALIAS,
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
// Unnecessary safe access
// -----------------------------------------------------------------------------

export const memberAccessNullSafetyShouldBeNeeded =
    (services: SafeDsServices) =>
    (node: SdsMemberAccess, accept: ValidationAcceptor): void => {
        if (!node.isNullSafe) {
            return;
        }

        const receiverType = services.types.TypeComputer.computeType(node.receiver);
        if (receiverType === UnknownType) {
            return;
        }

        if (!receiverType.isNullable) {
            accept('info', 'The receiver is never null, so the safe access is unnecessary.', {
                node,
                code: CODE_STYLE_UNNECESSARY_SAFE_ACCESS,
            });
        }
    };

// -----------------------------------------------------------------------------
// Unnecessary type argument lists
// -----------------------------------------------------------------------------

export const namedTypeTypeArgumentListShouldBeNeeded = (node: SdsNamedType, accept: ValidationAcceptor): void => {
    const typeArgumentList = node.typeArgumentList;
    if (!typeArgumentList || !isEmpty(typeArgumentList.typeArguments)) {
        // If there are type arguments, they are either needed or erroneous (i.e. we already show an error)
        return;
    }

    const namedTypeDeclaration = node.declaration?.ref;
    if (!namedTypeDeclaration) {
        return;
    }

    if (isEmpty(typeParametersOrEmpty(namedTypeDeclaration))) {
        accept('info', 'This type argument list can be removed.', {
            node: typeArgumentList,
            code: CODE_STYLE_UNNECESSARY_TYPE_ARGUMENT_LIST,
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

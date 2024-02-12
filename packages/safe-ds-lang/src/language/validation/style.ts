import { ValidationAcceptor } from 'langium';
import { isEmpty } from '../../helpers/collections.js';
import {
    isSdsCall,
    isSdsEnumVariant,
    isSdsIndexedAccess,
    isSdsMemberAccess,
    isSdsWildcard,
    SdsAnnotation,
    SdsAnnotationCall,
    SdsAssignment,
    SdsCall,
    SdsChainedExpression,
    SdsClassBody,
    SdsConstraintList,
    SdsEnumBody,
    SdsEnumVariant,
    SdsFunction,
    SdsImportedDeclaration,
    SdsInfixOperation,
    SdsNamedType,
    SdsSegment,
    SdsTypeParameterList,
    SdsUnionType,
} from '../generated/ast.js';
import { getParameters, getTypeParameters, Parameter } from '../helpers/nodeProperties.js';
import { NullConstant } from '../partialEvaluation/model.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { UnknownType } from '../typing/model.js';

export const CODE_STYLE_UNNECESSARY_ASSIGNMENT = 'style/unnecessary-assignment';
export const CODE_STYLE_UNNECESSARY_ARGUMENT_LIST = 'style/unnecessary-argument-list';
export const CODE_STYLE_UNNECESSARY_BODY = 'style/unnecessary-body';
export const CODE_STYLE_UNNECESSARY_CONST_MODIFIER = 'style/unnecessary-const-modifier';
export const CODE_STYLE_UNNECESSARY_CONSTRAINT_LIST = 'style/unnecessary-constraint-list';
export const CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR = 'style/unnecessary-elvis-operator';
export const CODE_STYLE_UNNECESSARY_IMPORT_ALIAS = 'style/unnecessary-import-alias';
export const CODE_STYLE_UNNECESSARY_NULL_SAFETY = 'style/unnecessary-null-safety';
export const CODE_STYLE_UNNECESSARY_PARAMETER_LIST = 'style/unnecessary-parameter-list';
export const CODE_STYLE_UNNECESSARY_RESULT_LIST = 'style/unnecessary-result-list';
export const CODE_STYLE_UNNECESSARY_TYPE_ARGUMENT_LIST = 'style/unnecessary-type-argument-list';
export const CODE_STYLE_UNNECESSARY_TYPE_PARAMETER_LIST = 'style/unnecessary-type-parameter-list';
export const CODE_STYLE_UNNECESSARY_UNION_TYPE = 'style/unnecessary-union-type';

// -----------------------------------------------------------------------------
// Unnecessary argument lists
// -----------------------------------------------------------------------------

export const annotationCallArgumentListShouldBeNeeded = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        const argumentList = node.argumentList;
        if (!argumentList || !isEmpty(argumentList.arguments)) {
            // If there are arguments, they are either needed or erroneous (i.e. we already show an error)
            return;
        }

        const annotation = node.annotation?.ref;
        if (!annotation) {
            return;
        }

        const hasRequiredParameters = getParameters(annotation).some(Parameter.isRequired);
        if (!hasRequiredParameters) {
            accept('info', 'This argument list can be removed.', {
                node: argumentList,
                code: CODE_STYLE_UNNECESSARY_ARGUMENT_LIST,
            });
        }
    };
};

export const callArgumentListShouldBeNeeded = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsCall, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        const argumentList = node.argumentList;
        if (!argumentList || !isEmpty(argumentList.arguments)) {
            // If there are arguments, they are either needed or erroneous (i.e. we already show an error)
            return;
        }

        const callable = services.helpers.NodeMapper.callToCallable(node);
        if (!isSdsEnumVariant(callable)) {
            return;
        }

        if (isEmpty(getParameters(callable))) {
            accept('info', 'This argument list can be removed.', {
                node: argumentList,
                code: CODE_STYLE_UNNECESSARY_ARGUMENT_LIST,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary assignments
// -----------------------------------------------------------------------------

export const assignmentShouldHaveMoreThanWildcardsAsAssignees = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsAssignment, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        const assignees = node.assigneeList?.assignees ?? [];
        if (assignees.every(isSdsWildcard)) {
            accept('info', 'This assignment can be replaced by an expression statement.', {
                node,
                code: CODE_STYLE_UNNECESSARY_ASSIGNMENT,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary bodies
// -----------------------------------------------------------------------------

export const classBodyShouldNotBeEmpty = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsClassBody, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (isEmpty(node.members)) {
            accept('info', 'This body can be removed.', {
                node,
                code: CODE_STYLE_UNNECESSARY_BODY,
            });
        }
    };
};

export const enumBodyShouldNotBeEmpty = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsEnumBody, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (isEmpty(node.variants)) {
            accept('info', 'This body can be removed.', {
                node,
                code: CODE_STYLE_UNNECESSARY_BODY,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary const modifier
// -----------------------------------------------------------------------------

export const annotationParameterShouldNotHaveConstModifier = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsAnnotation, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        for (const parameter of getParameters(node)) {
            if (parameter.isConstant) {
                accept('info', 'Annotation parameters are always const, so this modifier can be removed.', {
                    node: parameter,
                    property: 'isConstant',
                    code: CODE_STYLE_UNNECESSARY_CONST_MODIFIER,
                });
            }
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary constraint lists
// -----------------------------------------------------------------------------

export const constraintListShouldNotBeEmpty = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsConstraintList, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (isEmpty(node.constraints)) {
            accept('info', 'This constraint list can be removed.', {
                node,
                code: CODE_STYLE_UNNECESSARY_CONSTRAINT_LIST,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary elvis operator
// -----------------------------------------------------------------------------

export const elvisOperatorShouldBeNeeded = (services: SafeDsServices) => {
    const partialEvaluator = services.evaluation.PartialEvaluator;
    const settingsProvider = services.workspace.SettingsProvider;
    const typeComputer = services.types.TypeComputer;

    return async (node: SdsInfixOperation, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (node.operator !== '?:') {
            return;
        }

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

        const leftValue = partialEvaluator.evaluate(node.leftOperand);
        const rightValue = partialEvaluator.evaluate(node.rightOperand);
        if (leftValue === NullConstant && rightValue === NullConstant) {
            accept(
                'info',
                'Both operands are always null, so the elvis operator is unnecessary (replace it with null).',
                {
                    node,
                    code: CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR,
                },
            );
        } else if (leftValue === NullConstant) {
            accept(
                'info',
                'The left operand is always null, so the elvis operator is unnecessary (keep the right operand).',
                {
                    node,
                    code: CODE_STYLE_UNNECESSARY_ELVIS_OPERATOR,
                },
            );
        } else if (rightValue === NullConstant) {
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

export const importedDeclarationAliasShouldDifferFromDeclarationName = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsImportedDeclaration, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (node.alias && node.alias.alias === node.declaration?.$refText) {
            accept('info', 'This alias can be removed.', {
                node,
                property: 'alias',
                code: CODE_STYLE_UNNECESSARY_IMPORT_ALIAS,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary null safety
// -----------------------------------------------------------------------------

export const chainedExpressionNullSafetyShouldBeNeeded = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return async (node: SdsChainedExpression, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (!node.isNullSafe) {
            return;
        }

        const receiverType = typeComputer.computeType(node.receiver);
        if (receiverType === UnknownType) {
            return;
        }

        if (
            (isSdsCall(node) && !receiverType.isNullable && typeChecker.canBeCalled(receiverType)) ||
            (isSdsIndexedAccess(node) && !receiverType.isNullable && typeChecker.canBeAccessedByIndex(receiverType)) ||
            (isSdsMemberAccess(node) && !receiverType.isNullable)
        ) {
            accept('info', 'The receiver is never null, so null-safety is unnecessary.', {
                node,
                code: CODE_STYLE_UNNECESSARY_NULL_SAFETY,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary parameter lists
// -----------------------------------------------------------------------------

export const annotationParameterListShouldNotBeEmpty = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsAnnotation, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (node.parameterList && isEmpty(node.parameterList.parameters)) {
            accept('info', 'This parameter list can be removed.', {
                node,
                property: 'parameterList',
                code: CODE_STYLE_UNNECESSARY_PARAMETER_LIST,
            });
        }
    };
};

export const enumVariantParameterListShouldNotBeEmpty = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsEnumVariant, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (node.parameterList && isEmpty(node.parameterList.parameters)) {
            accept('info', 'This parameter list can be removed.', {
                node,
                property: 'parameterList',
                code: CODE_STYLE_UNNECESSARY_PARAMETER_LIST,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary result lists
// -----------------------------------------------------------------------------

export const functionResultListShouldNotBeEmpty = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsFunction, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (node.resultList && isEmpty(node.resultList.results)) {
            accept('info', 'This result list can be removed.', {
                node,
                property: 'resultList',
                code: CODE_STYLE_UNNECESSARY_RESULT_LIST,
            });
        }
    };
};

export const segmentResultListShouldNotBeEmpty = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsSegment, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (node.resultList && isEmpty(node.resultList.results)) {
            accept('info', 'This result list can be removed.', {
                node,
                property: 'resultList',
                code: CODE_STYLE_UNNECESSARY_RESULT_LIST,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary type argument lists
// -----------------------------------------------------------------------------

export const namedTypeTypeArgumentListShouldBeNeeded = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsNamedType, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        const typeArgumentList = node.typeArgumentList;
        if (!typeArgumentList || !isEmpty(typeArgumentList.typeArguments)) {
            // If there are type arguments, they are either needed or erroneous (i.e. we already show an error)
            return;
        }

        const namedTypeDeclaration = node.declaration?.ref;
        if (!namedTypeDeclaration) {
            return;
        }

        if (isEmpty(getTypeParameters(namedTypeDeclaration))) {
            accept('info', 'This type argument list can be removed.', {
                node: typeArgumentList,
                code: CODE_STYLE_UNNECESSARY_TYPE_ARGUMENT_LIST,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary type parameter lists
// -----------------------------------------------------------------------------

export const typeParameterListShouldNotBeEmpty = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsTypeParameterList, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        if (isEmpty(node.typeParameters)) {
            accept('info', 'This type parameter list can be removed.', {
                node,
                code: CODE_STYLE_UNNECESSARY_TYPE_PARAMETER_LIST,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Unnecessary type parameter lists
// -----------------------------------------------------------------------------

export const unionTypeShouldNotHaveASingularTypeArgument = (services: SafeDsServices) => {
    const settingsProvider = services.workspace.SettingsProvider;

    return async (node: SdsUnionType, accept: ValidationAcceptor) => {
        if (!(await settingsProvider.shouldValidateCodeStyle())) {
            /* c8 ignore next 2 */
            return;
        }

        const typeArguments = node.typeArgumentList?.typeArguments ?? [];
        if (typeArguments.length === 1) {
            accept('info', 'This can be replaced by the singular type argument of the union type.', {
                node,
                code: CODE_STYLE_UNNECESSARY_UNION_TYPE,
            });
        }
    };
};

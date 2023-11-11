import { ValidationAcceptor } from 'langium';
import { DiagnosticTag } from 'vscode-languageserver';
import {
    isSdsParameter,
    isSdsResult,
    isSdsWildcard,
    SdsAnnotationCall,
    SdsArgument,
    SdsAssignee,
    SdsNamedType,
    SdsParameter,
    SdsReference,
} from '../../generated/ast.js';
import { Parameter } from '../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { parameterCanBeAnnotated } from '../other/declarations/annotationCalls.js';

export const CODE_DEPRECATED_ASSIGNED_RESULT = 'deprecated/assigned-result';
export const CODE_DEPRECATED_CALLED_ANNOTATION = 'deprecated/called-annotation';
export const CODE_DEPRECATED_CORRESPONDING_PARAMETER = 'deprecated/corresponding-parameter';
export const CODE_DEPRECATED_REFERENCED_DECLARATION = 'deprecated/referenced-declaration';
export const CODE_DEPRECATED_REQUIRED_PARAMETER = 'deprecated/required-parameter';

export const assigneeAssignedResultShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsAssignee, accept: ValidationAcceptor) => {
        if (isSdsWildcard(node)) {
            return;
        }

        const assignedObject = services.helpers.NodeMapper.assigneeToAssignedObject(node);
        if (!isSdsResult(assignedObject)) {
            return;
        }

        if (services.builtins.Annotations.isDeprecated(assignedObject)) {
            accept('warning', `The assigned result '${assignedObject.name}' is deprecated.`, {
                node,
                code: CODE_DEPRECATED_ASSIGNED_RESULT,
                tags: [DiagnosticTag.Deprecated],
            });
        }
    };

export const annotationCallAnnotationShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
        const annotation = node.annotation?.ref;
        if (!annotation) {
            return;
        }

        if (services.builtins.Annotations.isDeprecated(annotation)) {
            accept('warning', `The called annotation '${annotation.name}' is deprecated.`, {
                node,
                property: 'annotation',
                code: CODE_DEPRECATED_CALLED_ANNOTATION,
                tags: [DiagnosticTag.Deprecated],
            });
        }
    };

export const argumentCorrespondingParameterShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsArgument, accept: ValidationAcceptor) => {
        const parameter = services.helpers.NodeMapper.argumentToParameter(node);
        if (!parameter) {
            return;
        }

        if (services.builtins.Annotations.isDeprecated(parameter)) {
            accept('warning', `The corresponding parameter '${parameter.name}' is deprecated.`, {
                node,
                code: CODE_DEPRECATED_CORRESPONDING_PARAMETER,
                tags: [DiagnosticTag.Deprecated],
            });
        }
    };

export const namedTypeDeclarationShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsNamedType, accept: ValidationAcceptor) => {
        const declaration = node.declaration?.ref;
        if (!declaration) {
            return;
        }

        if (services.builtins.Annotations.isDeprecated(declaration)) {
            accept('warning', `The referenced declaration '${declaration.name}' is deprecated.`, {
                node,
                code: CODE_DEPRECATED_REFERENCED_DECLARATION,
                tags: [DiagnosticTag.Deprecated],
            });
        }
    };

export const referenceTargetShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsReference, accept: ValidationAcceptor) => {
        const target = node.target.ref;
        if (!target || isSdsParameter(target)) {
            return;
        }

        if (services.builtins.Annotations.isDeprecated(target)) {
            accept('warning', `The referenced declaration '${target.name}' is deprecated.`, {
                node,
                code: CODE_DEPRECATED_REFERENCED_DECLARATION,
                tags: [DiagnosticTag.Deprecated],
            });
        }
    };

export const requiredParameterMustNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsParameter, accept: ValidationAcceptor) => {
        if (Parameter.isRequired(node) && parameterCanBeAnnotated(node)) {
            if (services.builtins.Annotations.isDeprecated(node)) {
                accept('error', 'A deprecated parameter must be optional.', {
                    node,
                    property: 'name',
                    code: CODE_DEPRECATED_REQUIRED_PARAMETER,
                });
            }
        }
    };

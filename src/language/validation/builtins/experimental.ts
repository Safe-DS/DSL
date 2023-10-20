import { ValidationAcceptor } from 'langium';
import {
    isSdsParameter,
    isSdsResult,
    isSdsWildcard,
    SdsAnnotationCall,
    SdsArgument,
    SdsAssignee,
    SdsNamedType,
    SdsReference,
} from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';

export const CODE_EXPERIMENTAL_ASSIGNED_RESULT = 'experimental/assigned-result';
export const CODE_EXPERIMENTAL_CALLED_ANNOTATION = 'experimental/called-annotation';
export const CODE_EXPERIMENTAL_CORRESPONDING_PARAMETER = 'experimental/corresponding-parameter';
export const CODE_EXPERIMENTAL_REFERENCED_DECLARATION = 'experimental/referenced-declaration';

export const assigneeAssignedResultShouldNotBeExperimental =
    (services: SafeDsServices) => (node: SdsAssignee, accept: ValidationAcceptor) => {
        if (isSdsWildcard(node)) {
            return;
        }

        const assignedObject = services.helpers.NodeMapper.assigneeToAssignedObjectOrUndefined(node);
        if (!isSdsResult(assignedObject)) {
            return;
        }

        if (services.builtins.Annotations.isExperimental(assignedObject)) {
            accept('warning', `The assigned result '${assignedObject.name}' is experimental.`, {
                node,
                code: CODE_EXPERIMENTAL_ASSIGNED_RESULT,
            });
        }
    };

export const annotationCallAnnotationShouldNotBeExperimental =
    (services: SafeDsServices) => (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
        const annotation = node.annotation?.ref;
        if (!annotation) {
            return;
        }

        if (services.builtins.Annotations.isExperimental(annotation)) {
            accept('warning', `The called annotation '${annotation.name}' is experimental.`, {
                node,
                property: 'annotation',
                code: CODE_EXPERIMENTAL_CALLED_ANNOTATION,
            });
        }
    };

export const argumentCorrespondingParameterShouldNotBeExperimental =
    (services: SafeDsServices) => (node: SdsArgument, accept: ValidationAcceptor) => {
        const parameter = services.helpers.NodeMapper.argumentToParameterOrUndefined(node);
        if (!parameter) {
            return;
        }

        if (services.builtins.Annotations.isExperimental(parameter)) {
            accept('warning', `The corresponding parameter '${parameter.name}' is experimental.`, {
                node,
                code: CODE_EXPERIMENTAL_CORRESPONDING_PARAMETER,
            });
        }
    };

export const namedTypeDeclarationShouldNotBeExperimental =
    (services: SafeDsServices) => (node: SdsNamedType, accept: ValidationAcceptor) => {
        const declaration = node.declaration.ref;
        if (!declaration) {
            return;
        }

        if (services.builtins.Annotations.isExperimental(declaration)) {
            accept('warning', `The referenced declaration '${declaration.name}' is experimental.`, {
                node,
                code: CODE_EXPERIMENTAL_REFERENCED_DECLARATION,
            });
        }
    };

export const referenceTargetShouldNotExperimental =
    (services: SafeDsServices) => (node: SdsReference, accept: ValidationAcceptor) => {
        const target = node.target.ref;
        if (!target || isSdsParameter(target)) {
            return;
        }

        if (services.builtins.Annotations.isExperimental(target)) {
            accept('warning', `The referenced declaration '${target.name}' is experimental.`, {
                node,
                code: CODE_EXPERIMENTAL_REFERENCED_DECLARATION,
            });
        }
    };

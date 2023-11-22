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

export const CODE_EXPERIMENTAL_LIBRARY_ELEMENT = 'experimental/library-element';

export const assigneeAssignedResultShouldNotBeExperimental =
    (services: SafeDsServices) => (node: SdsAssignee, accept: ValidationAcceptor) => {
        if (isSdsWildcard(node)) {
            return;
        }

        const assignedObject = services.helpers.NodeMapper.assigneeToAssignedObject(node);
        if (!isSdsResult(assignedObject)) {
            return;
        }

        if (services.builtins.Annotations.callsExperimental(assignedObject)) {
            accept('warning', `The assigned result '${assignedObject.name}' is experimental.`, {
                node,
                code: CODE_EXPERIMENTAL_LIBRARY_ELEMENT,
            });
        }
    };

export const annotationCallAnnotationShouldNotBeExperimental =
    (services: SafeDsServices) => (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
        const annotation = node.annotation?.ref;
        if (!annotation) {
            return;
        }

        if (services.builtins.Annotations.callsExperimental(annotation)) {
            accept('warning', `The called annotation '${annotation.name}' is experimental.`, {
                node,
                property: 'annotation',
                code: CODE_EXPERIMENTAL_LIBRARY_ELEMENT,
            });
        }
    };

export const argumentCorrespondingParameterShouldNotBeExperimental =
    (services: SafeDsServices) => (node: SdsArgument, accept: ValidationAcceptor) => {
        const parameter = services.helpers.NodeMapper.argumentToParameter(node);
        if (!parameter) {
            return;
        }

        if (services.builtins.Annotations.callsExperimental(parameter)) {
            accept('warning', `The corresponding parameter '${parameter.name}' is experimental.`, {
                node,
                code: CODE_EXPERIMENTAL_LIBRARY_ELEMENT,
            });
        }
    };

export const namedTypeDeclarationShouldNotBeExperimental =
    (services: SafeDsServices) => (node: SdsNamedType, accept: ValidationAcceptor) => {
        const declaration = node.declaration?.ref;
        if (!declaration) {
            return;
        }

        if (services.builtins.Annotations.callsExperimental(declaration)) {
            accept('warning', `The referenced declaration '${declaration.name}' is experimental.`, {
                node,
                code: CODE_EXPERIMENTAL_LIBRARY_ELEMENT,
            });
        }
    };

export const referenceTargetShouldNotExperimental =
    (services: SafeDsServices) => (node: SdsReference, accept: ValidationAcceptor) => {
        const target = node.target.ref;
        if (!target || isSdsParameter(target)) {
            return;
        }

        if (services.builtins.Annotations.callsExperimental(target)) {
            accept('warning', `The referenced declaration '${target.name}' is experimental.`, {
                node,
                code: CODE_EXPERIMENTAL_LIBRARY_ELEMENT,
            });
        }
    };

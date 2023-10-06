import { ValidationAcceptor } from 'langium';
import {
    isSdsParameter,
    isSdsResult,
    isSdsWildcard,
    SdsAnnotationCall,
    SdsArgument,
    SdsAssignee,
    SdsNamedType, SdsReference,
} from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';

export const CODE_DEPRECATED_ASSIGNED_RESULT = 'deprecated/assigned-result';
export const CODE_DEPRECATED_CALLED_ANNOTATION = 'deprecated/called-annotation';
export const CODE_DEPRECATED_CORRESPONDING_PARAMETER = 'deprecated/corresponding-parameter';
export const CODE_DEPRECATED_REFERENCED_DECLARATION = 'deprecated/referenced-declaration';

export const assigneeAssignedResultShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsAssignee, accept: ValidationAcceptor) => {
        if (isSdsWildcard(node)) {
            return;
        }

        const assignedObject = services.helpers.NodeMapper.assigneeToAssignedObjectOrUndefined(node);
        if (!isSdsResult(assignedObject)) {
            return;
        }

        if (services.builtins.Annotations.isDeprecated(assignedObject)) {
            accept('warning', `The assigned result '${assignedObject.name}' is deprecated.`, {
                node,
                code: CODE_DEPRECATED_ASSIGNED_RESULT,
            });
        }
    };

export const annotationCallAnnotationShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
        const annotation = node.annotation.ref;
        if (!annotation) {
            return;
        }

        if (services.builtins.Annotations.isDeprecated(annotation)) {
            accept('warning', `The called annotation '${annotation.name}' is deprecated.`, {
                node,
                property: 'annotation',
                code: CODE_DEPRECATED_CALLED_ANNOTATION,
            });
        }
    };

export const argumentCorrespondingParameterShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsArgument, accept: ValidationAcceptor) => {
        const parameter = services.helpers.NodeMapper.argumentToParameterOrUndefined(node);
        if (!parameter) {
            return;
        }

        if (services.builtins.Annotations.isDeprecated(parameter)) {
            accept('warning', `The corresponding parameter '${parameter.name}' is deprecated.`, {
                node,
                code: CODE_DEPRECATED_CORRESPONDING_PARAMETER,
            });
        }
    };

export const namedTypeDeclarationShouldNotBeDeprecated = (services: SafeDsServices) => (node: SdsNamedType, accept: ValidationAcceptor) => {
    const declaration = node.declaration.ref;
    if (!declaration) {
        return;
    }

    if (services.builtins.Annotations.isDeprecated(declaration)) {
        accept('warning', `The referenced declaration '${declaration.name}' is deprecated.`, {
            node,
            code: CODE_DEPRECATED_REFERENCED_DECLARATION,
        });
    }
};

export const referenceTargetShouldNotBeDeprecated = (services: SafeDsServices) => (node: SdsReference, accept: ValidationAcceptor) => {
    const target = node.target.ref;
    if (!target || isSdsParameter(target)) {
        return;
    }

    if (services.builtins.Annotations.isDeprecated(target)) {
        accept('warning', `The referenced declaration '${target.name}' is deprecated.`, {
            node,
            code: CODE_DEPRECATED_REFERENCED_DECLARATION,
        });
    }
};

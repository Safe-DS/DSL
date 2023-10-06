import { ValidationAcceptor } from 'langium';
import { isSdsResult, isSdsWildcard, SdsAnnotationCall, SdsAssignee } from '../../generated/ast.js';
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
                property: 'assignedObject',
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

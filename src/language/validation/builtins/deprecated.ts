import { ValidationAcceptor } from 'langium';
import { SdsAnnotationCall } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';

export const CODE_DEPRECATED_ASSIGNED_RESULT = 'deprecated/assigned-result';
export const CODE_DEPRECATED_CALLED_ANNOTATION = 'deprecated/called-annotation';
export const CODE_DEPRECATED_CORRESPONDING_PARAMETER = 'deprecated/corresponding-parameter';
export const CODE_DEPRECATED_REFERENCED_DECLARATION = 'deprecated/referenced-declaration';

export const annotationCallAnnotationShouldNotBeDeprecated =
    (services: SafeDsServices) => (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
        const annotation = node.annotation?.ref;
        if (!annotation) {
            return;
        }

        if (services.builtins.CoreAnnotations.isDeprecated(annotation)) {
            accept('warning', `The called annotation '${annotation.name}' is deprecated.`, {
                node,
                property: 'annotation',
                code: CODE_DEPRECATED_CALLED_ANNOTATION,
            });
        }
    };

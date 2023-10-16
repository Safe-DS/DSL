import { ValidationAcceptor } from 'langium';
import { SdsDeclaration } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { annotationCallsOrEmpty } from '../../helpers/nodeProperties.js';
import { duplicatesBy } from '../../helpers/collectionUtils.js';

export const CODE_ANNOTATION_NOT_REPEATABLE = 'annotation/not-repeatable';

export const singleUseAnnotationsMustNotBeRepeated =
    (services: SafeDsServices) => (node: SdsDeclaration, accept: ValidationAcceptor) => {
        const callsOfSingleUseAnnotations = annotationCallsOrEmpty(node).filter((it) => {
            const annotation = it.annotation?.ref;
            return annotation && !services.builtins.Annotations.isRepeatable(annotation);
        });

        for (const duplicate of duplicatesBy(callsOfSingleUseAnnotations, (it) => it.annotation?.ref)) {
            accept('error', `The annotation '${duplicate.annotation.$refText}' is not repeatable.`, {
                node: duplicate,
                code: CODE_ANNOTATION_NOT_REPEATABLE,
            });
        }
    };

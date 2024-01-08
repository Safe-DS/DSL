import { ValidationAcceptor } from 'langium';
import { duplicatesBy } from '../../../helpers/collections.js';
import { SdsDeclaration } from '../../generated/ast.js';
import { getAnnotationCalls } from '../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../safe-ds-module.js';

export const CODE_ANNOTATION_NOT_REPEATABLE = 'annotation/not-repeatable';

export const singleUseAnnotationsMustNotBeRepeated =
    (services: SafeDsServices) => (node: SdsDeclaration, accept: ValidationAcceptor) => {
        const callsOfSingleUseAnnotations = getAnnotationCalls(node).filter((it) => {
            const annotation = it.annotation?.ref;
            return annotation && !services.builtins.Annotations.callsRepeatable(annotation);
        });

        for (const duplicate of duplicatesBy(callsOfSingleUseAnnotations, (it) => it.annotation?.ref)) {
            accept('error', `The annotation '${duplicate.annotation?.$refText}' is not repeatable.`, {
                node: duplicate,
                property: 'annotation',
                code: CODE_ANNOTATION_NOT_REPEATABLE,
            });
        }
    };

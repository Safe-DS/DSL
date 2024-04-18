import { ValidationAcceptor } from 'langium';
import { isSdsList, isSdsModuleMember, SdsDeclaration } from '../../generated/ast.js';
import { findFirstAnnotationCallOf } from '../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { StringConstant } from '../../partialEvaluation/model.js';

export const CODE_TAGS_DUPLICATE_TAG = 'tags/duplicate-tag';

export const tagsShouldNotHaveDuplicateEntries = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const partialEvaluator = services.evaluation.PartialEvaluator;
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsDeclaration, accept: ValidationAcceptor) => {
        if (!isSdsModuleMember(node)) {
            return;
        }

        const annotationCall = findFirstAnnotationCallOf(node, builtinAnnotations.Tags);
        if (!annotationCall) {
            return;
        }

        const tags = nodeMapper.callToParameterValue(annotationCall, 'tags');
        if (!isSdsList(tags)) {
            return;
        }

        const knownTags = new Set<string>();
        for (const tag of tags.elements) {
            const evaluatedTag = partialEvaluator.evaluate(tag);
            if (!(evaluatedTag instanceof StringConstant)) {
                continue;
            }

            if (knownTags.has(evaluatedTag.value)) {
                accept('warning', `The tag '${evaluatedTag.value}' was set already.`, {
                    node: tag,
                    code: CODE_TAGS_DUPLICATE_TAG,
                });
            } else {
                knownTags.add(evaluatedTag.value);
            }
        }
    };
};

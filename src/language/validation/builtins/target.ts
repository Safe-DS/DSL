import { ValidationAcceptor } from 'langium';
import { SdsAnnotation, SdsAnnotationCall } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { duplicatesBy, isEmpty } from '../../../helpers/collectionUtils.js';
import { pluralize } from '../../../helpers/stringUtils.js';
import { findFirstAnnotationCallOf } from '../../helpers/nodeProperties.js';

export const CODE_TARGET_DUPLICATE_TARGET = 'target/duplicate-target';
export const CODE_TARGET_WRONG_TARGET = 'target/wrong-target';

export const targetShouldNotHaveDuplicateEntries = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsAnnotation, accept: ValidationAcceptor) => {
        const annotationCall = findFirstAnnotationCallOf(node, builtinAnnotations.Target);
        if (!annotationCall) {
            return;
        }

        const validTargets = builtinAnnotations.streamValidTargets(node).map((it) => `'${it.name}'`);
        const duplicateTargets = duplicatesBy(validTargets, (it) => it)
            .distinct()
            .toArray();

        if (isEmpty(duplicateTargets)) {
            return;
        }

        const noun = pluralize(duplicateTargets.length, 'target');
        const duplicateTargetString = duplicateTargets.join(', ');
        const verb = pluralize(duplicateTargets.length, 'occurs', 'occur');

        accept('warning', `The ${noun} ${duplicateTargetString} ${verb} multiple times.`, {
            node: annotationCall,
            property: 'annotation',
            code: CODE_TARGET_DUPLICATE_TARGET,
        });
    };
};

export const annotationCallMustHaveCorrectTarget = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsAnnotationCall, accept: ValidationAcceptor) => {};
};

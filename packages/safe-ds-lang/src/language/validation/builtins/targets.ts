import { ValidationAcceptor } from 'langium';
import {
    isSdsAnnotation,
    isSdsAttribute,
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsList,
    isSdsModule,
    isSdsParameter,
    isSdsPipeline,
    isSdsResult,
    isSdsSchema,
    isSdsSegment,
    isSdsTypeParameter,
    SdsAnnotation,
    SdsAnnotationCall,
    SdsEnumVariant,
} from '../../generated/ast.js';
import { findFirstAnnotationCallOf, getAnnotationCallTarget } from '../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../safe-ds-module.js';

export const CODE_TARGETS_DUPLICATE_TARGET = 'targets/duplicate-target';
export const CODE_TARGETS_WRONG_TARGET = 'targets/wrong-target';

export const targetsShouldNotHaveDuplicateEntries = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const builtinEnums = services.builtins.Enums;
    const partialEvaluator = services.evaluation.PartialEvaluator;
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsAnnotation, accept: ValidationAcceptor) => {
        const annotationCall = findFirstAnnotationCallOf(node, builtinAnnotations.Targets);
        if (!annotationCall) {
            return;
        }

        const targets = nodeMapper.callToParameterValue(annotationCall, 'targets');
        if (!isSdsList(targets)) {
            return;
        }

        const knownTargets = new Set<SdsEnumVariant>();
        for (const target of targets.elements) {
            const evaluatedTarget = partialEvaluator.evaluate(target);
            if (!builtinEnums.isEvaluatedAnnotationTarget(evaluatedTarget)) {
                continue;
            }

            if (knownTargets.has(evaluatedTarget.variant)) {
                accept('warning', `The target '${evaluatedTarget.variant.name}' was set already.`, {
                    node: target,
                    code: CODE_TARGETS_DUPLICATE_TARGET,
                });
            } else {
                knownTargets.add(evaluatedTarget.variant);
            }
        }
    };
};

export const annotationCallMustHaveCorrectTarget = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
        const annotation = node.annotation?.ref;
        if (!annotation) {
            return;
        }

        const actualTarget = getActualTarget(node);
        /* c8 ignore start */
        if (!actualTarget) {
            return;
        }
        /* c8 ignore stop */

        const validTargets = builtinAnnotations
            .streamValidTargets(annotation)
            .map((it) => it.name)
            .toSet();

        if (!validTargets.has(actualTarget.enumVariantName)) {
            accept('error', `The annotation '${annotation.name}' cannot be applied to ${actualTarget.prettyName}.`, {
                node,
                property: 'annotation',
                code: CODE_TARGETS_WRONG_TARGET,
            });
        }
    };
};

const getActualTarget = (node: SdsAnnotationCall): GetActualTargetResult | void => {
    const annotatedObject = getAnnotationCallTarget(node);

    if (isSdsAnnotation(annotatedObject)) {
        return {
            enumVariantName: 'Annotation',
            prettyName: 'an annotation',
        };
    } else if (isSdsAttribute(annotatedObject)) {
        return {
            enumVariantName: 'Attribute',
            prettyName: 'an attribute',
        };
    } else if (isSdsClass(annotatedObject)) {
        return {
            enumVariantName: 'Class',
            prettyName: 'a class',
        };
    } else if (isSdsEnum(annotatedObject)) {
        return {
            enumVariantName: 'Enum',
            prettyName: 'an enum',
        };
    } else if (isSdsEnumVariant(annotatedObject)) {
        return {
            enumVariantName: 'EnumVariant',
            prettyName: 'an enum variant',
        };
    } else if (isSdsFunction(annotatedObject)) {
        return {
            enumVariantName: 'Function',
            prettyName: 'a function',
        };
    } else if (isSdsModule(annotatedObject)) {
        return {
            enumVariantName: 'Module',
            prettyName: 'a module',
        };
    } else if (isSdsParameter(annotatedObject)) {
        return {
            enumVariantName: 'Parameter',
            prettyName: 'a parameter',
        };
    } else if (isSdsPipeline(annotatedObject)) {
        return {
            enumVariantName: 'Pipeline',
            prettyName: 'a pipeline',
        };
    } else if (isSdsResult(annotatedObject)) {
        return {
            enumVariantName: 'Result',
            prettyName: 'a result',
        };
    } else if (isSdsSchema(annotatedObject)) {
        return {
            enumVariantName: 'Schema',
            prettyName: 'a schema',
        };
    } else if (isSdsSegment(annotatedObject)) {
        return {
            enumVariantName: 'Segment',
            prettyName: 'a segment',
        };
    } else if (isSdsTypeParameter(annotatedObject)) {
        return {
            enumVariantName: 'TypeParameter',
            prettyName: 'a type parameter',
        };
    }
};

interface GetActualTargetResult {
    enumVariantName: string;
    prettyName: string;
}

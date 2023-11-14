import { stream, type ValidationAcceptor } from 'langium';
import { isSubset } from '../../helpers/collectionUtils.js';
import { isSdsCall, isSdsFunction, isSdsList, type SdsFunction, type SdsParameter } from '../generated/ast.js';
import { findFirstAnnotationCallOf, getArguments, getParameters } from '../helpers/nodeProperties.js';
import { StringConstant } from '../partialEvaluation/model.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { CallableType } from '../typing/model.js';

export const CODE_PURITY_DUPLICATE_IMPURITY_REASON = 'purity/duplicate-impurity-reason';
export const CODE_PURITY_IMPURE_AND_PURE = 'purity/impure-and-pure';
export const CODE_PURITY_IMPURITY_REASONS_OF_OVERRIDING_METHOD = 'purity/impurity-reasons-of-overriding-method';
export const CODE_PURITY_INVALID_PARAMETER_NAME = 'purity/invalid-parameter-name';
export const CODE_PURITY_MUST_BE_SPECIFIED = 'purity/must-be-specified';
export const CODE_PURITY_PURE_PARAMETER_MUST_HAVE_CALLABLE_TYPE = 'purity/pure-parameter-must-have-callable-type';

export const functionPurityMustBeSpecified = (services: SafeDsServices) => {
    const annotations = services.builtins.Annotations;

    return (node: SdsFunction, accept: ValidationAcceptor) => {
        if (annotations.isPure(node) && annotations.isImpure(node)) {
            return accept('error', "'@Impure' and '@Pure' are mutually exclusive.", {
                node,
                property: 'name',
                code: CODE_PURITY_IMPURE_AND_PURE,
            });
        } else if (!annotations.isImpure(node) && !annotations.isPure(node)) {
            return accept(
                'error',
                "The purity of a function must be specified. Call the annotation '@Pure' or '@Impure'.",
                {
                    node,
                    property: 'name',
                    code: CODE_PURITY_MUST_BE_SPECIFIED,
                },
            );
        }

        const impureAnnotationCall = findFirstAnnotationCallOf(node, annotations.Impure);
        if (impureAnnotationCall && annotations.streamImpurityReasons(node).isEmpty()) {
            accept('error', 'At least one impurity reason must be specified.', {
                node: impureAnnotationCall,
                property: 'annotation',
                code: CODE_PURITY_MUST_BE_SPECIFIED,
            });
        }
    };
};

export const impurityReasonsOfOverridingMethodMustBeSubsetOfOverriddenMethod = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const classHierarchy = services.types.ClassHierarchy;

    return (node: SdsFunction, accept: ValidationAcceptor): void => {
        const overriddenMember = classHierarchy.getOverriddenMember(node);
        if (!overriddenMember || !isSdsFunction(overriddenMember)) {
            return;
        }

        // Don't further validate if the function is marked as impure and as pure
        if (builtinAnnotations.isImpure(node) && builtinAnnotations.isPure(node)) {
            return;
        }

        if (
            !isSubset(
                builtinAnnotations
                    .streamImpurityReasons(node)
                    .map((it) => it.toString())
                    .toSet(),
                builtinAnnotations
                    .streamImpurityReasons(overriddenMember)
                    .map((it) => it.toString())
                    .toSet(),
            )
        ) {
            accept(
                'error',
                'The impurity reasons of an overriding function must be a subset of the impurity reasons of the overridden function.',
                {
                    node,
                    property: 'name',
                    code: CODE_PURITY_IMPURITY_REASONS_OF_OVERRIDING_METHOD,
                },
            );
        }
    };
};

export const impurityReasonParameterNameMustBelongToParameter = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const builtinEnums = services.builtins.Enums;
    const nodeMapper = services.helpers.NodeMapper;
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsFunction, accept: ValidationAcceptor) => {
        const annotationCall = findFirstAnnotationCallOf(node, builtinAnnotations.Impure);

        // Don't further validate if the function is marked as impure and as pure
        if (!annotationCall || builtinAnnotations.isPure(node)) {
            return;
        }

        // Check whether allReasons is valid
        const allReasons = nodeMapper.callToParameterValue(annotationCall, 'allReasons');
        if (!isSdsList(allReasons)) {
            return;
        }

        const parameterNames = stream(getParameters(node))
            .map((it) => it.name)
            .toSet();

        for (const reason of allReasons.elements) {
            // If it's not a call, no parameter name could've been provided
            if (!isSdsCall(reason)) {
                continue;
            }

            // Check whether the reason is valid
            const evaluatedReason = partialEvaluator.evaluate(reason);
            if (!builtinEnums.isEvaluatedImpurityReason(evaluatedReason)) {
                continue;
            }

            // Check whether a parameter name was provided
            const parameterName = nodeMapper.callToParameterValue(reason, 'parameterName');
            if (!parameterName) {
                continue;
            }

            // Check whether parameterName is valid
            const evaluatedParameterName = partialEvaluator.evaluate(parameterName);
            if (!(evaluatedParameterName instanceof StringConstant)) {
                continue;
            }

            if (!parameterNames.has(evaluatedParameterName.value)) {
                const parameterNameArgument = getArguments(reason).find(
                    (it) => nodeMapper.argumentToParameter(it)?.name === 'parameterName',
                )!;

                accept('error', `The parameter '${evaluatedParameterName.value}' does not exist.`, {
                    node: parameterNameArgument,
                    code: CODE_PURITY_INVALID_PARAMETER_NAME,
                });
            }
        }
    };
};

export const impurityReasonShouldNotBeSetMultipleTimes = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const builtinEnums = services.builtins.Enums;
    const nodeMapper = services.helpers.NodeMapper;
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsFunction, accept: ValidationAcceptor) => {
        const annotationCall = findFirstAnnotationCallOf(node, builtinAnnotations.Impure);

        // Don't further validate if the function is marked as impure and as pure
        if (!annotationCall || builtinAnnotations.isPure(node)) {
            return;
        }

        // Check whether allReasons is valid
        const allReasons = nodeMapper.callToParameterValue(annotationCall, 'allReasons');
        if (!isSdsList(allReasons)) {
            return;
        }

        const knownReasons = new Set<string>();
        for (const reason of allReasons.elements) {
            // Check whether the reason is valid
            const evaluatedReason = partialEvaluator.evaluate(reason);
            if (!builtinEnums.isEvaluatedImpurityReason(evaluatedReason)) {
                continue;
            }

            const stringifiedReason = evaluatedReason.toString();
            if (knownReasons.has(stringifiedReason)) {
                accept('warning', `The impurity reason '${stringifiedReason}' was set already.`, {
                    node: reason,
                    code: CODE_PURITY_DUPLICATE_IMPURITY_REASON,
                });
            } else {
                knownReasons.add(stringifiedReason);
            }
        }
    };
};

export const pureParameterMustHaveCallableType = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        // Don't show an error if no type is specified (yet) or if the parameter is not marked as pure
        if (!node.type || !builtinAnnotations.isPure(node)) {
            return;
        }

        const type = typeComputer.computeType(node);
        if (!(type instanceof CallableType)) {
            accept('error', 'A pure parameter must have a callable type.', {
                node,
                property: 'name',
                code: CODE_PURITY_PURE_PARAMETER_MUST_HAVE_CALLABLE_TYPE,
            });
        }
    };
};

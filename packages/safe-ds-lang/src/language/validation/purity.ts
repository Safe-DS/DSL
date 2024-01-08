import { stream, type ValidationAcceptor } from 'langium';
import { isSubset } from '../../helpers/collections.js';
import { isSdsCall, isSdsFunction, isSdsList, SdsCall, type SdsFunction, SdsParameter } from '../generated/ast.js';
import { findFirstAnnotationCallOf, getArguments, getParameters } from '../helpers/nodeProperties.js';
import { StringConstant } from '../partialEvaluation/model.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { CallableType } from '../typing/model.js';

export const CODE_PURITY_DUPLICATE_IMPURITY_REASON = 'purity/duplicate-impurity-reason';
export const CODE_PURITY_IMPURE_AND_PURE = 'purity/impure-and-pure';
export const CODE_PURITY_IMPURITY_REASONS_OF_OVERRIDING_METHOD = 'purity/impurity-reasons-of-overriding-method';
export const CODE_PURITY_INVALID_PARAMETER_NAME = 'purity/invalid-parameter-name';
export const CODE_PURITY_MUST_BE_SPECIFIED = 'purity/must-be-specified';
export const CODE_PURITY_POTENTIALLY_IMPURE_PARAMETER_NOT_CALLABLE = 'purity/potentially-impure-parameter-not-callable';
export const CODE_PURITY_PURE_PARAMETER_SET_TO_IMPURE_CALLABLE = 'purity/pure-parameter-set-to-impure-callable';

export const functionPurityMustBeSpecified = (services: SafeDsServices) => {
    const annotations = services.builtins.Annotations;

    return (node: SdsFunction, accept: ValidationAcceptor) => {
        if (annotations.callsPure(node) && annotations.callsImpure(node)) {
            return accept('error', "'@Impure' and '@Pure' are mutually exclusive.", {
                node,
                property: 'name',
                code: CODE_PURITY_IMPURE_AND_PURE,
            });
        } else if (!annotations.callsImpure(node) && !annotations.callsPure(node)) {
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
        if (builtinAnnotations.callsImpure(node) && builtinAnnotations.callsPure(node)) {
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

export const impurityReasonParameterNameMustBelongToParameterOfCorrectType = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const builtinEnums = services.builtins.Enums;
    const impurityReasons = services.builtins.ImpurityReasons;
    const nodeMapper = services.helpers.NodeMapper;
    const partialEvaluator = services.evaluation.PartialEvaluator;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsFunction, accept: ValidationAcceptor) => {
        const annotationCall = findFirstAnnotationCallOf(node, builtinAnnotations.Impure);

        // Don't further validate if the function is marked as impure and as pure
        if (!annotationCall || builtinAnnotations.callsPure(node)) {
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

            // A parameter with the given name must exist
            if (!parameterNames.has(evaluatedParameterName.value)) {
                const parameterNameArgument = getArguments(reason).find(
                    (it) => nodeMapper.argumentToParameter(it)?.name === 'parameterName',
                )!;

                accept('error', `The parameter '${evaluatedParameterName.value}' does not exist.`, {
                    node: parameterNameArgument,
                    code: CODE_PURITY_INVALID_PARAMETER_NAME,
                });

                continue;
            }

            // The parameter must have the correct type
            if (evaluatedReason.variant === impurityReasons.PotentiallyImpureParameterCall) {
                const parameter = getParameters(node).find((it) => it.name === evaluatedParameterName.value)!;
                if (!parameter.type) {
                    continue;
                }

                const parameterType = typeComputer.computeType(parameter);
                if (parameterType instanceof CallableType) {
                    continue;
                }

                const parameterNameArgument = getArguments(reason).find(
                    (it) => nodeMapper.argumentToParameter(it)?.name === 'parameterName',
                )!;

                accept('error', `The parameter '${evaluatedParameterName.value}' must have a callable type.`, {
                    node: parameterNameArgument,
                    code: CODE_PURITY_POTENTIALLY_IMPURE_PARAMETER_NOT_CALLABLE,
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
        if (!annotationCall || builtinAnnotations.callsPure(node)) {
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

export const pureParameterDefaultValueMustBePure = (services: SafeDsServices) => {
    const purityComputer = services.purity.PurityComputer;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        if (!node.defaultValue) {
            return;
        }

        const parameterType = typeComputer.computeType(node);
        if (!(parameterType instanceof CallableType) || !purityComputer.isPureParameter(node)) {
            return;
        }

        const defaultValueType = typeComputer.computeType(node.defaultValue);
        if (!(defaultValueType instanceof CallableType)) {
            return;
        }

        if (!purityComputer.isPureCallable(defaultValueType.callable)) {
            accept('error', 'Cannot pass an impure callable to a pure parameter.', {
                node: node.defaultValue,
                code: CODE_PURITY_PURE_PARAMETER_SET_TO_IMPURE_CALLABLE,
            });
        }
    };
};

export const callArgumentAssignedToPureParameterMustBePure = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const purityComputer = services.purity.PurityComputer;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsCall, accept: ValidationAcceptor) => {
        for (const argument of getArguments(node)) {
            const parameter = nodeMapper.argumentToParameter(argument);
            if (!parameter) {
                continue;
            }

            const parameterType = typeComputer.computeType(parameter);
            if (!(parameterType instanceof CallableType) || !purityComputer.isPureParameter(parameter)) {
                continue;
            }

            const argumentType = typeComputer.computeType(argument);
            if (!(argumentType instanceof CallableType)) {
                continue;
            }

            if (!purityComputer.isPureCallable(argumentType.callable)) {
                accept('error', 'Cannot pass an impure callable to a pure parameter.', {
                    node: argument,
                    code: CODE_PURITY_PURE_PARAMETER_SET_TO_IMPURE_CALLABLE,
                });
            }
        }
    };
};

import { getContainerOfType, stream, ValidationAcceptor } from 'langium';
import { isSdsCall, isSdsEnum, isSdsList, SdsFunction } from '../../generated/ast.js';
import type { SafeDsServices } from '../../safe-ds-module.js';
import { findFirstAnnotationCallOf, getArguments, getParameters } from '../../helpers/nodeProperties.js';
import { EvaluatedEnumVariant, StringConstant } from '../../partialEvaluation/model.js';

export const CODE_IMPURE_PARAMETER_NAME = 'impure/parameter-name';

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
            if (
                !(evaluatedReason instanceof EvaluatedEnumVariant) ||
                getContainerOfType(evaluatedReason.variant, isSdsEnum) !== builtinEnums.ImpurityReason
            ) {
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
                    code: CODE_IMPURE_PARAMETER_NAME,
                });
            }
        }
    };
};

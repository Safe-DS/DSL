import {
    isSdsCallable,
    isSdsCallableType,
    isSdsLambda,
    SdsAnnotationCall,
    SdsCallableType,
    SdsLambda,
    SdsParameter,
} from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import {
    annotationCallsOrEmpty,
    argumentsOrEmpty,
    isRequiredParameter,
    parametersOrEmpty,
    resultsOrEmpty,
} from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { isEmpty } from '../../../../helpers/collectionUtils.js';

export const CODE_ANNOTATION_CALL_CONSTANT_ARGUMENT = 'annotation-call/constant-argument';
export const CODE_ANNOTATION_CALL_MISSING_ARGUMENT_LIST = 'annotation-call/missing-argument-list';
export const CODE_ANNOTATION_CALL_TARGET_PARAMETER = 'annotation-call/target-parameter';
export const CODE_ANNOTATION_CALL_TARGET_RESULT = 'annotation-call/target-result';

export const annotationCallArgumentsMustBeConstant = (services: SafeDsServices) => {
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
        for (const argument of argumentsOrEmpty(node)) {
            const evaluatedArgumentValue = partialEvaluator.evaluate(argument.value);

            if (!evaluatedArgumentValue.isFullyEvaluated) {
                accept('error', 'Arguments of annotation calls must be constant.', {
                    node: argument,
                    property: 'value',
                    code: CODE_ANNOTATION_CALL_CONSTANT_ARGUMENT,
                });
            }
        }
    };
};

export const annotationCallMustNotLackArgumentList = (node: SdsAnnotationCall, accept: ValidationAcceptor) => {
    if (node.argumentList) {
        return;
    }

    const requiredParameters = parametersOrEmpty(node.annotation?.ref).filter(isRequiredParameter);
    if (!isEmpty(requiredParameters)) {
        accept(
            'error',
            `The annotation '${node.annotation?.$refText}' has required parameters, so an argument list must be added.`,
            {
                node,
                code: CODE_ANNOTATION_CALL_MISSING_ARGUMENT_LIST,
            },
        );
    }
};

export const callableTypeParametersMustNotBeAnnotated = (node: SdsCallableType, accept: ValidationAcceptor) => {
    for (const parameter of parametersOrEmpty(node)) {
        for (const annotationCall of annotationCallsOrEmpty(parameter)) {
            accept('error', 'Parameters of callable types must not be annotated.', {
                node: annotationCall,
                code: CODE_ANNOTATION_CALL_TARGET_PARAMETER,
            });
        }
    }
};

export const callableTypeResultsMustNotBeAnnotated = (node: SdsCallableType, accept: ValidationAcceptor) => {
    for (const result of resultsOrEmpty(node.resultList)) {
        for (const annotationCall of annotationCallsOrEmpty(result)) {
            accept('error', 'Results of callable types must not be annotated.', {
                node: annotationCall,
                code: CODE_ANNOTATION_CALL_TARGET_RESULT,
            });
        }
    }
};

export const lambdaParametersMustNotBeAnnotated = (node: SdsLambda, accept: ValidationAcceptor) => {
    for (const parameter of parametersOrEmpty(node)) {
        for (const annotationCall of annotationCallsOrEmpty(parameter)) {
            accept('error', 'Lambda parameters must not be annotated.', {
                node: annotationCall,
                code: CODE_ANNOTATION_CALL_TARGET_PARAMETER,
            });
        }
    }
};

export const parameterCanBeAnnotated = (node: SdsParameter) => {
    const containingCallable = getContainerOfType(node, isSdsCallable);
    return !isSdsCallableType(containingCallable) && !isSdsLambda(containingCallable);
};

import { SafeDsServices } from '../../../safe-ds-module.js';
import {
    isSdsCallable,
    isSdsCallableType,
    isSdsLambda,
    SdsCallableType,
    SdsLambda,
    SdsParameter,
    SdsResult,
} from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import {
    annotationCallsOrEmpty,
    isRequiredParameter,
    parametersOrEmpty,
    resultsOrEmpty,
} from '../../../helpers/nodeProperties.js';

export const CODE_ANNOTATION_CALL_TARGET_PARAMETER = 'annotation-call/target-parameter';
export const CODE_ANNOTATION_CALL_TARGET_RESULT = 'annotation-call/target-result';

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

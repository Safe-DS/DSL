import { isSdsAbstractCall, isSdsAnnotation, isSdsCall, SdsArgumentList } from '../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../safe-ds-module.js';
import { argumentsOrEmpty, isRequiredParameter, parametersOrEmpty } from '../../helpers/nodeProperties.js';
import { duplicatesBy } from '../../helpers/collectionUtils.js';
import { isEmpty } from 'radash';
import { pluralize } from '../../helpers/stringUtils.js';

export const CODE_ARGUMENT_LIST_DUPLICATE_PARAMETER = 'argument-list/duplicate-parameter';
export const CODE_ARGUMENT_LIST_MISSING_REQUIRED_PARAMETER = 'argument-list/missing-required-parameter';
export const CODE_ARGUMENT_LIST_POSITIONAL_AFTER_NAMED = 'argument-list/positional-after-named';

export const argumentListMustNotSetParameterMultipleTimes = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const argumentToParameterOrUndefined = nodeMapper.argumentToParameterOrUndefined.bind(nodeMapper);

    return (node: SdsArgumentList, accept: ValidationAcceptor): void => {
        // We already report other errors in this case
        const containingCall = getContainerOfType(node, isSdsCall);
        const callable = nodeMapper.callToCallableOrUndefined(containingCall);
        if (isSdsAnnotation(callable)) {
            return;
        }

        const args = argumentsOrEmpty(node);
        const duplicates = duplicatesBy(args, argumentToParameterOrUndefined);

        for (const duplicate of duplicates) {
            const correspondingParameter = argumentToParameterOrUndefined(duplicate)!;
            accept('error', `The parameter '${correspondingParameter.name}' is already set.`, {
                node: duplicate,
                code: CODE_ARGUMENT_LIST_DUPLICATE_PARAMETER,
            });
        }
    };
};

export const argumentListMustNotHavePositionalArgumentsAfterNamedArguments = (
    node: SdsArgumentList,
    accept: ValidationAcceptor,
): void => {
    let foundNamed = false;
    for (const argument of node.arguments) {
        if (argument.parameter) {
            foundNamed = true;
        } else if (foundNamed) {
            accept('error', 'After the first named argument all arguments must be named.', {
                node: argument,
                code: CODE_ARGUMENT_LIST_POSITIONAL_AFTER_NAMED,
            });
        }
    }
};

export const argumentListMustSetAllRequiredParameters = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsArgumentList, accept: ValidationAcceptor): void => {
        const containingAbstractCall = getContainerOfType(node, isSdsAbstractCall);
        const callable = nodeMapper.callToCallableOrUndefined(containingAbstractCall);

        // We already report other errors in this case
        if (isSdsCall(containingAbstractCall) && isSdsAnnotation(callable)) {
            return;
        }

        const expectedParameters = parametersOrEmpty(callable).filter((it) => isRequiredParameter(it));
        if (isEmpty(expectedParameters)) {
            return;
        }

        const actualParameters = argumentsOrEmpty(node).map((it) => nodeMapper.argumentToParameterOrUndefined(it));

        const missingTypeParameters = expectedParameters.filter((it) => !actualParameters.includes(it));
        if (!isEmpty(missingTypeParameters)) {
            const kind = pluralize(missingTypeParameters.length, 'parameter');
            const missingParametersString = missingTypeParameters.map((it) => `'${it.name}'`).join(', ');

            accept('error', `The ${kind} ${missingParametersString} must be set here.`, {
                node,
                code: CODE_ARGUMENT_LIST_MISSING_REQUIRED_PARAMETER,
            });
        }
    };
};

// @Check
//     fun missingRequiredParameter(sdsArgumentList: SdsArgumentList) {
//         val parameters = sdsArgumentList.parametersOrNull() ?: return
//         val requiredParameters = parameters.filter { it.isRequired() }
//         val givenParameters = sdsArgumentList.arguments.mapNotNull { it.parameterOrNull() }
//         val missingRequiredParameters = requiredParameters - givenParameters.toSet()
//
//         missingRequiredParameters.forEach {
//             error(
//                 "The parameter '${it.name}' is required and must be set here.",
//                 null,
//                 ErrorCode.MISSING_REQUIRED_PARAMETER
//             )
//         }
//     }
//
// @Check
//     fun tooManyArguments(sdsArgumentList: SdsArgumentList) {
//         val parameters = sdsArgumentList.parametersOrNull()
//         if (parameters == null || parameters.any { it.isVariadic }) {
//             return
//         }
//
//         val maximumExpectedNumberOfArguments = parameters.size
//         val actualNumberOfArguments = sdsArgumentList.arguments.size
//
//         if (actualNumberOfArguments > maximumExpectedNumberOfArguments) {
//             val minimumExpectedNumberOfArguments = parameters.filter { it.isRequired() }.size
//             val message = buildString {
//                 append("Expected ")
//
//                 when {
//                     minimumExpectedNumberOfArguments != maximumExpectedNumberOfArguments -> {
//                         append("between $minimumExpectedNumberOfArguments and $maximumExpectedNumberOfArguments arguments")
//                     }
//                     minimumExpectedNumberOfArguments == 1 -> append("exactly 1 argument")
//                 else -> append("exactly $minimumExpectedNumberOfArguments arguments")
//                 }
//
//                 append(" but got $actualNumberOfArguments.")
//             }
//
//             error(
//                 message,
//                 null,
//                 ErrorCode.TOO_MANY_ARGUMENTS
//             )
//         }
//     }

import { isSdsAnnotation, isSdsCall, isSdsLambda, SdsArgumentList } from '../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../safe-ds-module.js';
import { argumentsOrEmpty } from '../../helpers/nodeProperties.js';
import { duplicatesBy } from '../../helpers/collectionUtils.js';

export const CODE_ARGUMENT_LIST_DUPLICATE_PARAMETER = 'argument-list/duplicate-parameter';
export const CODE_ARGUMENT_LIST_POSITIONAL_AFTER_NAMED = 'argument-list/positional-after-named';

export const argumentListMustNotSetParameterMultipleTimes = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const argumentToParameterOrUndefined = nodeMapper.argumentToParameterOrUndefined.bind(nodeMapper);

    return (node: SdsArgumentList, accept: ValidationAcceptor): void => {
        // We already report other errors in those cases
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

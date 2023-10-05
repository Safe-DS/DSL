import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import {
    isSdsAbstractCall,
    isSdsAnnotationCall,
    isSdsCall,
    isSdsCallable,
    SdsAbstractCall,
    SdsArgument,
    SdsCallable,
    SdsParameter,
} from '../generated/ast.js';
import { CallableType, StaticType } from '../typing/model.js';
import { getContainerOfType } from 'langium';
import {argumentsOrEmpty, parametersOrEmpty} from "./shortcuts.js";
import {isNamedArgument} from "./checks.js";

export class SafeDsNodeMapper {
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.typeComputer = new SafeDsTypeComputer(services);
    }

    callToCallableOrUndefined(node: SdsAbstractCall | undefined): SdsCallable | undefined {
        if (isSdsAnnotationCall(node)) {
            return node.annotation?.ref;
        } else if (isSdsCall(node)) {
            const receiverType = this.typeComputer.computeType(node.receiver);
            if (receiverType instanceof CallableType) {
                return receiverType.sdsCallable;
            } else if (receiverType instanceof StaticType) {
                const declaration = receiverType.instanceType.sdsDeclaration;
                if (isSdsCallable(declaration)) {
                    return declaration;
                }
            }
        }

        return undefined;
    }

    argumentToParameterOrUndefined(node: SdsArgument| undefined): SdsParameter | undefined {
        if (!node) {
            return undefined;
        }

        // Named argument
        if (node?.parameter) {
            return node.parameter.ref;
        }

        // Positional argument
        const containingAbstractCall = getContainerOfType(node, isSdsAbstractCall)!;
        const args = argumentsOrEmpty(containingAbstractCall);
        const argumentPosition = node.$containerIndex ?? -1;

        // A prior argument is named
        for (let i = 0; i < argumentPosition; i++) {
            if (isNamedArgument(args[i])) {
                return undefined;
            }
        }

        const callable = this.callToCallableOrUndefined(containingAbstractCall);
        const parameters = parametersOrEmpty(callable);
        if (argumentPosition < parameters.length) {
            return parameters[argumentPosition];
        }

        const lastParameter = parameters[parameters.length - 1];
        if (lastParameter?.isVariadic)  {
            return lastParameter;
        }

        return undefined;
    }
}

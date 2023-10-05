import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import {
    isSdsAbstractCall,
    isSdsAnnotationCall,
    isSdsCall,
    isSdsCallable,
    isSdsClass,
    isSdsEnumVariant,
    isSdsNamedType,
    isSdsType,
    SdsAbstractCall,
    SdsArgument,
    SdsCallable,
    SdsNamedTypeDeclaration,
    SdsParameter,
    SdsTypeArgument,
    SdsTypeParameter,
} from '../generated/ast.js';
import { CallableType, StaticType } from '../typing/model.js';
import { getContainerOfType } from 'langium';
import { argumentsOrEmpty, parametersOrEmpty, typeArgumentsOrEmpty, typeParametersOrEmpty } from './shortcuts.js';
import { isNamedArgument, isNamedTypeArgument } from './checks.js';

export class SafeDsNodeMapper {
    private readonly typeComputer: () => SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.typeComputer = () => services.types.TypeComputer;
    }

    /**
     * Returns the callable that is called by the given call. If no callable can be found, returns undefined.
     */
    callToCallableOrUndefined(node: SdsAbstractCall | undefined): SdsCallable | undefined {
        if (isSdsAnnotationCall(node)) {
            return node.annotation?.ref;
        } else if (isSdsCall(node)) {
            const receiverType = this.typeComputer().computeType(node.receiver);
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

    /**
     * Returns the parameter that the argument is assigned to. If there is no matching parameter, returns undefined.
     */
    argumentToParameterOrUndefined(node: SdsArgument | undefined): SdsParameter | undefined {
        if (!node) {
            return undefined;
        }

        // Named argument
        if (node.parameter) {
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

        // Find parameter at the same position
        const callable = this.callToCallableOrUndefined(containingAbstractCall);
        const parameters = parametersOrEmpty(callable);
        if (argumentPosition < parameters.length) {
            return parameters[argumentPosition];
        }

        // If no parameter is found, check if the last parameter is variadic
        const lastParameter = parameters[parameters.length - 1];
        if (lastParameter?.isVariadic) {
            return lastParameter;
        }

        return undefined;
    }

    /**
     * Returns the type parameter that the type argument is assigned to. If there is no matching type parameter, returns
     * undefined.
     */
    typeArgumentToTypeParameterOrUndefined(node: SdsTypeArgument | undefined): SdsTypeParameter | undefined {
        if (!node) {
            return undefined;
        }

        // Named type argument
        if (node.typeParameter) {
            return node.typeParameter.ref;
        }

        // Positional type argument
        const containingType = getContainerOfType(node, isSdsType);
        if (!isSdsNamedType(containingType)) {
            return undefined;
        }

        const typeArguments = typeArgumentsOrEmpty(containingType.typeArgumentList);
        const typeArgumentPosition = node.$containerIndex ?? -1;

        // A prior type argument is named
        for (let i = 0; i < typeArgumentPosition; i++) {
            if (isNamedTypeArgument(typeArguments[i])) {
                return undefined;
            }
        }

        // Find type parameter at the same position
        const namedTypeDeclaration = containingType.declaration.ref;
        const typeParameters = this.typeParametersOfNamedTypeDeclarationOrEmpty(namedTypeDeclaration);
        return typeParameters[typeArgumentPosition];
    }

    private typeParametersOfNamedTypeDeclarationOrEmpty(node: SdsNamedTypeDeclaration | undefined): SdsTypeParameter[] {
        if (isSdsClass(node)) {
            return typeParametersOrEmpty(node.typeParameterList);
        } else if (isSdsEnumVariant(node)) {
            return typeParametersOrEmpty(node.typeParameterList);
        } else {
            return [];
        }
    }
}

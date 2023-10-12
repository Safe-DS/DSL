import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import {
    isSdsAbstractCall,
    isSdsAnnotationCall,
    isSdsAssignment,
    isSdsBlock,
    isSdsCall,
    isSdsCallable, isSdsClass, isSdsEnumVariant,
    isSdsNamedType,
    isSdsReference,
    isSdsSegment,
    isSdsType,
    isSdsYield,
    SdsAbstractCall,
    SdsAbstractResult,
    SdsArgument,
    SdsAssignee,
    SdsCallable,
    SdsExpression,
    SdsParameter,
    SdsPlaceholder,
    SdsReference,
    SdsResult,
    SdsTypeArgument,
    SdsTypeParameter,
    SdsYield,
} from '../generated/ast.js';
import { CallableType, StaticType } from '../typing/model.js';
import { findLocalReferences, getContainerOfType, Stream, stream } from 'langium';
import {
    abstractResultsOrEmpty,
    argumentsOrEmpty,
    isNamedArgument,
    isNamedTypeArgument,
    parametersOrEmpty,
    typeArgumentsOrEmpty,
    typeParametersOrEmpty,
} from './nodeProperties.js';

export class SafeDsNodeMapper {
    private readonly typeComputer: () => SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.typeComputer = () => services.types.TypeComputer;
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

        return undefined;
    }

    /**
     * Returns the result, block lambda result, or expression that is assigned to the given assignee. If nothing is
     * assigned, `undefined` is returned.
     */
    assigneeToAssignedObjectOrUndefined(node: SdsAssignee | undefined): SdsAbstractResult | SdsExpression | undefined {
        if (!node) {
            return undefined;
        }

        const containingAssignment = getContainerOfType(node, isSdsAssignment);
        /* c8 ignore start */
        if (!containingAssignment) {
            return undefined;
        }
        /* c8 ignore stop */

        const assigneePosition = node.$containerIndex ?? -1;
        const expression = containingAssignment.expression;

        // If the RHS is not a call, the first assignee gets the entire RHS
        if (!isSdsCall(expression)) {
            if (assigneePosition === 0) {
                return expression;
            } else {
                return undefined;
            }
        }

        // If the RHS instantiates a class or enum variant, the first assignee gets the entire RHS
        const callable = this.callToCallableOrUndefined(expression);
        if (isSdsClass(callable) || isSdsEnumVariant(callable)) {
            if (assigneePosition === 0) {
                return expression;
            } else {
                return undefined;
            }
        }

        // Otherwise, the assignee gets the result at the same position
        const abstractResults = abstractResultsOrEmpty(callable);
        return abstractResults[assigneePosition];
    }

    /**
     * Returns the callable that is called by the given call. If no callable can be found, returns undefined.
     */
    callToCallableOrUndefined(node: SdsAbstractCall | undefined): SdsCallable | undefined {
        if (!node) {
            return undefined;
        }

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
     * Returns all references that target the given parameter.
     */
    parameterToReferences(node: SdsParameter | undefined): Stream<SdsReference> {
        if (!node) {
            return stream();
        }

        const containingCallable = getContainerOfType(node, isSdsCallable);
        /* c8 ignore start */
        if (!containingCallable) {
            return stream();
        }
        /* c8 ignore stop */

        return findLocalReferences(node, containingCallable)
            .map((it) => it.$refNode?.astNode)
            .filter(isSdsReference);
    }

    /**
     * Returns all references that target the given placeholder.
     */
    placeholderToReferences(node: SdsPlaceholder | undefined): Stream<SdsReference> {
        if (!node) {
            return stream();
        }

        const containingBlock = getContainerOfType(node, isSdsBlock);
        /* c8 ignore start */
        if (!containingBlock) {
            return stream();
        }
        /* c8 ignore stop */

        return findLocalReferences(node, containingBlock)
            .map((it) => it.$refNode?.astNode)
            .filter(isSdsReference);
    }

    /**
     * Returns all yields that assign to the given result.
     */
    resultToYields(node: SdsResult | undefined): Stream<SdsYield> {
        if (!node) {
            return stream();
        }

        const containingSegment = getContainerOfType(node, isSdsSegment);
        if (!containingSegment) {
            return stream();
        }

        return findLocalReferences(node, containingSegment)
            .map((it) => it.$refNode?.astNode)
            .filter(isSdsYield);
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
        const typeParameters = typeParametersOrEmpty(namedTypeDeclaration);
        return typeParameters[typeArgumentPosition];
    }
}

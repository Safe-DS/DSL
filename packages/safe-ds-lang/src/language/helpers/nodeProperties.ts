import { AstNode, AstUtils, Stream, stream } from 'langium';
import {
    isSdsAnnotation,
    isSdsArgument,
    isSdsArgumentList,
    isSdsAssignment,
    isSdsAttribute,
    isSdsBlockLambda,
    isSdsBlockLambdaResult,
    isSdsCallable,
    isSdsCallableType,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsLambda,
    isSdsModule,
    isSdsModuleMember,
    isSdsNamedType,
    isSdsParameter,
    isSdsParameterBound,
    isSdsPipeline,
    isSdsPlaceholder,
    isSdsQualifiedImport,
    isSdsSegment,
    isSdsTypeAlias,
    isSdsTypeArgumentList,
    isSdsTypeParameter,
    isSdsTypeParameterList,
    SdsAbstractCall,
    SdsAbstractResult,
    SdsAnnotatedObject,
    SdsAnnotation,
    SdsAnnotationCall,
    SdsArgument,
    SdsArgumentList,
    SdsAssignee,
    SdsAssignment,
    SdsBlock,
    SdsBlockLambda,
    SdsBlockLambdaResult,
    SdsCallable,
    SdsClass,
    SdsClassMember,
    SdsConstraint,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsImport,
    SdsImportedDeclaration,
    SdsLiteral,
    SdsLiteralType,
    SdsModule,
    SdsModuleMember,
    SdsNamedType,
    SdsNamedTypeDeclaration,
    SdsParameter,
    SdsParameterBound,
    SdsPlaceholder,
    SdsQualifiedImport,
    SdsResult,
    SdsResultList,
    SdsStatement,
    SdsType,
    SdsTypeArgument,
    SdsTypeArgumentList,
    SdsTypeParameter,
    SdsTypeParameterList,
} from '../generated/ast.js';

// -------------------------------------------------------------------------------------------------
// Checks
// -------------------------------------------------------------------------------------------------

export const hasAnnotationCallOf = (
    node: SdsAnnotatedObject | undefined,
    expected: SdsAnnotation | undefined,
): boolean => {
    return getAnnotationCalls(node).some((it) => {
        const actual = it.annotation?.ref;
        return actual === expected;
    });
};

export const isInternal = (node: SdsDeclaration | undefined): boolean => {
    return isSdsModuleMember(node) && node.visibility === 'internal';
};

export const isPrivate = (node: SdsDeclaration | undefined): boolean => {
    return isSdsModuleMember(node) && node.visibility === 'private';
};

export namespace Argument {
    export const isNamed = (node: SdsArgument | undefined): boolean => {
        return Boolean(node?.parameter);
    };

    export const isPositional = (node: SdsArgument | undefined): boolean => {
        return isSdsArgument(node) && !node.parameter;
    };
}

export namespace Class {
    /**
     * Checks whether the class is only for typing, i.e. whether it has no constructor and no static members.
     */
    export const isOnlyForTyping = (node: SdsClass | undefined): boolean => {
        return isSdsClass(node) && !node.parameterList && !getClassMembers(node).some((it) => isStatic(it));
    };
}

export namespace Enum {
    export const isConstant = (node: SdsEnum | undefined): boolean => {
        return Boolean(node) && getEnumVariants(node).every((it) => EnumVariant.isConstant(it));
    };
}

export namespace EnumVariant {
    export const isConstant = (node: SdsEnumVariant | undefined): boolean => {
        return Boolean(node) && getParameters(node).every((it) => Parameter.isConstant(it));
    };
}

export namespace Parameter {
    export const isConstant = (node: SdsParameter | undefined): boolean => {
        if (!node) {
            return false;
        }

        const containingCallable = AstUtils.getContainerOfType(node, isSdsCallable);

        // In those cases, the const modifier is not applicable
        if (isSdsCallableType(containingCallable) || isSdsLambda(containingCallable)) {
            return false;
        }

        return node.isConstant || isSdsAnnotation(containingCallable);
    };

    export const isOptional = (node: SdsParameter | undefined): boolean => {
        return Boolean(node?.defaultValue);
    };

    export const isRequired = (node: SdsParameter | undefined): boolean => {
        return isSdsParameter(node) && !node.defaultValue;
    };

    export const getBounds = (node: SdsParameter | undefined): SdsParameterBound[] => {
        const callable = AstUtils.getContainerOfType(node, isSdsCallable);
        const result = getConstraints(callable).filter((it) => isSdsParameterBound(it) && it.leftOperand?.ref === node);
        return result as SdsParameterBound[];
    };
}

export const isStatic = (node: SdsClassMember | undefined): boolean => {
    if (isSdsClass(node) || isSdsEnum(node)) {
        return true;
    } else if (isSdsAttribute(node)) {
        return node.isStatic;
    } else if (isSdsFunction(node)) {
        return node.isStatic;
    } else {
        /* c8 ignore next 2 */
        return false;
    }
};

export namespace TypeArgument {
    export const isNamed = (node: SdsTypeArgument | undefined): boolean => {
        return Boolean(node?.typeParameter);
    };
}

export namespace TypeParameter {
    export const isOptional = (node: SdsTypeParameter | undefined): boolean => {
        return Boolean(node?.defaultValue);
    };

    export const isRequired = (node: SdsTypeParameter | undefined): boolean => {
        return isSdsTypeParameter(node) && !node.defaultValue;
    };

    export const isContravariant = (node: SdsTypeParameter | undefined): boolean => {
        return isSdsTypeParameter(node) && node.variance === 'in';
    };

    export const isCovariant = (node: SdsTypeParameter | undefined): boolean => {
        return isSdsTypeParameter(node) && node.variance === 'out';
    };

    export const isInvariant = (node: SdsTypeParameter | undefined): boolean => {
        return isSdsTypeParameter(node) && !node.variance;
    };
}

/**
 * Checks whether the declaration is valid in a pipeline file.
 */
export const isValidPipelineDeclaration = (node: SdsDeclaration): boolean => {
    return isSdsPipeline(node) || isSdsSegment(node) || isSdsTypeAlias(node);
};

/**
 * Checks whether the declaration is valid in a stub file.
 */
export const isValidStubDeclaration = (node: SdsDeclaration): boolean => {
    return (
        isSdsAnnotation(node) ||
        isSdsAttribute(node) ||
        isSdsClass(node) ||
        isSdsEnum(node) ||
        isSdsFunction(node) ||
        isSdsTypeAlias(node)
    );
};

// -------------------------------------------------------------------------------------------------
// Accessors for list elements
// -------------------------------------------------------------------------------------------------

export const getAbstractResults = (node: SdsCallable | undefined): SdsAbstractResult[] => {
    if (!node) {
        return [];
    }

    if (isSdsBlockLambda(node)) {
        return streamBlockLambdaResults(node).toArray();
    } else if (isSdsCallableType(node)) {
        return getResults(node.resultList);
    } else if (isSdsFunction(node)) {
        return getResults(node.resultList);
    } else if (isSdsSegment(node)) {
        return getResults(node.resultList);
    } /* c8 ignore start */ else {
        return [];
    } /* c8 ignore stop */
};

export const getAnnotationCalls = (node: SdsAnnotatedObject | undefined): SdsAnnotationCall[] => {
    if (!node) {
        /* c8 ignore next 2 */
        return [];
    }

    if (isSdsDeclaration(node)) {
        return node?.annotationCallList?.annotationCalls ?? node?.annotationCalls ?? [];
    } else {
        /* c8 ignore next 2 */
        return node?.annotationCalls ?? [];
    }
};

export const getAnnotationCallTarget = (node: SdsAnnotationCall | undefined): SdsDeclaration | undefined => {
    return AstUtils.getContainerOfType(node, isSdsDeclaration);
};

export const findFirstAnnotationCallOf = (
    node: SdsAnnotatedObject | undefined,
    expected: SdsAnnotation | undefined,
): SdsAnnotationCall | undefined => {
    if (!node || !expected) {
        return undefined;
    }

    return getAnnotationCalls(node).find((it) => {
        const actual = it.annotation?.ref;
        return actual === expected;
    });
};

export const getArguments = (node: SdsArgumentList | SdsAbstractCall | undefined): SdsArgument[] => {
    if (isSdsArgumentList(node)) {
        return node.arguments;
    } else {
        return node?.argumentList?.arguments ?? [];
    }
};

export const getAssignees = (node: SdsAssignment | undefined): SdsAssignee[] => {
    return node?.assigneeList?.assignees ?? [];
};

export const streamBlockLambdaResults = (node: SdsBlockLambda | undefined): Stream<SdsBlockLambdaResult> => {
    return stream(getStatements(node?.body))
        .filter(isSdsAssignment)
        .flatMap(getAssignees)
        .filter(isSdsBlockLambdaResult);
};

export const getClassMembers = (node: SdsClass | undefined): SdsClassMember[] => {
    return node?.body?.members ?? [];
};

export const getConstraints = (node: SdsCallable | undefined): SdsConstraint[] => {
    if (isSdsAnnotation(node)) {
        return node.constraintList?.constraints ?? [];
    } else if (isSdsClass(node)) {
        return node.constraintList?.constraints ?? [];
    } else if (isSdsEnumVariant(node)) {
        return node.constraintList?.constraints ?? [];
    } else if (isSdsFunction(node)) {
        return node.constraintList?.constraints ?? [];
    } else if (isSdsSegment(node)) {
        return node.constraintList?.constraints ?? [];
    } else {
        return [];
    }
};

export const getEnumVariants = (node: SdsEnum | undefined): SdsEnumVariant[] => {
    return node?.body?.variants ?? [];
};

export const getImports = (node: SdsModule | undefined): SdsImport[] => {
    return node?.imports ?? [];
};

export const getImportedDeclarations = (node: SdsModule | SdsQualifiedImport | undefined): SdsImportedDeclaration[] => {
    if (isSdsModule(node)) {
        return getImports(node).flatMap((imp) => {
            if (isSdsQualifiedImport(imp)) {
                return getImportedDeclarations(imp);
            } else {
                return [];
            }
        });
    } else {
        return node?.importedDeclarationList?.importedDeclarations ?? [];
    }
};

export const getLiterals = (node: SdsLiteralType | undefined): SdsLiteral[] => {
    return node?.literalList?.literals ?? [];
};

export const getModuleMembers = (node: SdsModule | undefined): SdsModuleMember[] => {
    return node?.members?.filter(isSdsModuleMember) ?? [];
};

export const getPackageName = (node: AstNode | undefined): string | undefined => {
    return AstUtils.getContainerOfType(node, isSdsModule)?.name;
};

export const getParameters = (node: SdsCallable | undefined): SdsParameter[] => {
    return node?.parameterList?.parameters ?? [];
};

export const getParentTypes = (node: SdsClass | undefined): SdsType[] => {
    return node?.parentTypeList?.parentTypes ?? [];
};

export const getQualifiedName = (node: SdsDeclaration | undefined): string => {
    const segments = [];

    let current: SdsDeclaration | undefined = node;
    while (current) {
        if (current.name) {
            segments.unshift(current.name);
        }
        current = AstUtils.getContainerOfType(current.$container, isSdsDeclaration);
    }

    return segments.join('.');
};

export const streamPlaceholders = (node: SdsBlock | undefined): Stream<SdsPlaceholder> => {
    return stream(getStatements(node)).filter(isSdsAssignment).flatMap(getAssignees).filter(isSdsPlaceholder);
};

export const getPlaceholderByName = (block: SdsBlock, name: string | undefined): SdsPlaceholder | undefined => {
    return name ? streamPlaceholders(block).find((placeholder) => placeholder.name === name) : undefined;
};

export const getResults = (node: SdsResultList | undefined): SdsResult[] => {
    return node?.results ?? [];
};

export const getStatements = (node: SdsBlock | undefined): SdsStatement[] => {
    return node?.statements ?? [];
};

export const getTypeArguments = (node: SdsTypeArgumentList | SdsNamedType | undefined): SdsTypeArgument[] => {
    if (!node) {
        return [];
    }

    if (isSdsTypeArgumentList(node)) {
        return node.typeArguments;
    } else if (isSdsNamedType(node)) {
        return getTypeArguments(node.typeArgumentList);
    } /* c8 ignore start */ else {
        return [];
    } /* c8 ignore stop */
};

export const getTypeParameters = (
    node: SdsTypeParameterList | SdsCallable | SdsNamedTypeDeclaration | undefined,
): SdsTypeParameter[] => {
    if (!node) {
        return [];
    }

    if (isSdsTypeParameterList(node)) {
        return node.typeParameters;
    } else if (isSdsClass(node)) {
        return getTypeParameters(node.typeParameterList);
    } else if (isSdsFunction(node)) {
        return getTypeParameters(node.typeParameterList);
    } /* c8 ignore start */ else {
        return [];
    } /* c8 ignore stop */
};

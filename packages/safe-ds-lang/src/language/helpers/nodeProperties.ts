import { AstNode, getContainerOfType, Stream, stream } from 'langium';
import {
    isSdsAnnotation,
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
    isSdsParameter,
    isSdsPlaceholder,
    isSdsSegment,
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
    SdsColumn,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsImport,
    SdsImportedDeclaration,
    SdsLiteral,
    SdsLiteralType,
    SdsModule,
    SdsModuleMember,
    SdsNamedTypeDeclaration,
    SdsParameter,
    SdsPlaceholder,
    SdsQualifiedImport,
    SdsResult,
    SdsResultList,
    SdsSchema,
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

export const isInternal = (node: SdsDeclaration): boolean => {
    return isSdsSegment(node) && node.visibility === 'internal';
};

export const isNamedArgument = (node: SdsArgument): boolean => {
    return Boolean(node.parameter);
};

export const isPositionalArgument = (node: SdsArgument): boolean => {
    return !node.parameter;
};

export namespace Parameter {
    export const isConstant = (node: SdsParameter | undefined): boolean => {
        if (!node) {
            return false;
        }

        const containingCallable = getContainerOfType(node, isSdsCallable);

        // In those cases, the const modifier is not applicable
        if (isSdsCallableType(containingCallable) || isSdsLambda(containingCallable)) {
            return false;
        }

        return isSdsAnnotation(containingCallable) || node.isConstant;
    };

    export const isOptional = (node: SdsParameter | undefined): boolean => {
        return Boolean(node?.defaultValue);
    };

    export const isRequired = (node: SdsParameter | undefined): boolean => {
        return isSdsParameter(node) && !node.defaultValue;
    };
}

export const isStatic = (node: SdsClassMember): boolean => {
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

export const isNamedTypeArgument = (node: SdsTypeArgument): boolean => {
    return Boolean(node.typeParameter);
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
    return getContainerOfType(node, isSdsDeclaration);
};

export const findFirstAnnotationCallOf = (
    node: SdsAnnotatedObject | undefined,
    expected: SdsAnnotation | undefined,
): SdsAnnotationCall | undefined => {
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

export const getMatchingClassMembers = (
    node: SdsClass | undefined,
    filterFunction: (member: SdsClassMember) => boolean = () => true,
): SdsClassMember[] => {
    return node?.body?.members?.filter(filterFunction) ?? [];
};

export const getColumns = (node: SdsSchema | undefined): SdsColumn[] => {
    return node?.columnList?.columns ?? [];
};

export const getEnumVariants = (node: SdsEnum | undefined): SdsEnumVariant[] => {
    return node?.body?.variants ?? [];
};

export const getImports = (node: SdsModule | undefined): SdsImport[] => {
    return node?.imports ?? [];
};

export const getImportedDeclarations = (node: SdsQualifiedImport | undefined): SdsImportedDeclaration[] => {
    return node?.importedDeclarationList?.importedDeclarations ?? [];
};

export const getLiterals = (node: SdsLiteralType | undefined): SdsLiteral[] => {
    return node?.literalList?.literals ?? [];
};

export const getModuleMembers = (node: SdsModule | undefined): SdsModuleMember[] => {
    return node?.members?.filter(isSdsModuleMember) ?? [];
};

export const getPackageName = (node: AstNode | undefined): string | undefined => {
    return getContainerOfType(node, isSdsModule)?.name;
};

export const getParameters = (node: SdsCallable | undefined): SdsParameter[] => {
    return node?.parameterList?.parameters ?? [];
};

export const getParentTypes = (node: SdsClass | undefined): SdsType[] => {
    return node?.parentTypeList?.parentTypes ?? [];
};

export const streamPlaceholders = (node: SdsBlock | undefined): Stream<SdsPlaceholder> => {
    return stream(getStatements(node)).filter(isSdsAssignment).flatMap(getAssignees).filter(isSdsPlaceholder);
};

export const getResults = (node: SdsResultList | undefined): SdsResult[] => {
    return node?.results ?? [];
};

export const getStatements = (node: SdsBlock | undefined): SdsStatement[] => {
    return node?.statements ?? [];
};

export const getTypeArguments = (node: SdsTypeArgumentList | undefined): SdsTypeArgument[] => {
    return node?.typeArguments ?? [];
};

export const getTypeParameters = (
    node: SdsTypeParameterList | SdsNamedTypeDeclaration | undefined,
): SdsTypeParameter[] => {
    if (!node) {
        return [];
    }

    if (isSdsTypeParameterList(node)) {
        return node.typeParameters;
    } else if (isSdsClass(node)) {
        return getTypeParameters(node.typeParameterList);
    } else if (isSdsEnumVariant(node)) {
        return getTypeParameters(node.typeParameterList);
    } /* c8 ignore start */ else {
        return [];
    } /* c8 ignore stop */
};

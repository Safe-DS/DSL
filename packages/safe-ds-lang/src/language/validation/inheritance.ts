import { AstUtils, ValidationAcceptor } from 'langium';
import { isEmpty, isEqualSet } from '../../helpers/collections.js';
import { isSdsClass, isSdsFunction, SdsClass, type SdsClassMember, SdsFunction } from '../generated/ast.js';
import { getParentTypes, getQualifiedName } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { ClassType, Type, UnknownType } from '../typing/model.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { expandToStringWithNL } from 'langium/generate';

export const CODE_INHERITANCE_CYCLE = 'inheritance/cycle';
export const CODE_INHERITANCE_MULTIPLE_INHERITANCE = 'inheritance/multiple-inheritance';
export const CODE_INHERITANCE_IDENTICAL_TO_OVERRIDDEN_MEMBER = 'inheritance/identical-to-overridden-member';
export const CODE_INHERITANCE_INCOMPATIBLE_TO_OVERRIDDEN_MEMBER = 'inheritance/incompatible-to-overridden-member';
export const CODE_INHERITANCE_NOT_A_CLASS = 'inheritance/not-a-class';
export const CODE_INHERITANCE_NULLABLE = 'inheritance/nullable';
export const CODE_INHERITANCE_PYTHON_CALL = 'inheritance/python-call';
export const CODE_INHERITANCE_PYTHON_NAME = 'inheritance/python-name';

export const classMemberMustMatchOverriddenMemberAndShouldBeNeeded = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const classHierarchy = services.typing.ClassHierarchy;
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsClassMember, accept: ValidationAcceptor): void => {
        // Check whether the member overrides something
        const overriddenMember = classHierarchy.getOverriddenMember(node);
        if (!overriddenMember) {
            return;
        }

        // Compute types
        const { ownMemberType, overriddenMemberType, substitutedOwnMemberType, substitutedOverriddenMemberType } =
            computeMemberTypes(node, overriddenMember, typeComputer);

        // Check whether the overriding is legal and needed
        if (
            // It's an error if the overriding member calls the `@PythonCall` annotation
            (isSdsFunction(node) && builtinAnnotations.getPythonCall(node)) ||
            // It's an error if the overridden member calls the `@PythonCall` annotation
            (isSdsFunction(overriddenMember) && builtinAnnotations.getPythonCall(overriddenMember)) ||
            // It's an error if the overriding member has a different Python name than the overridden member
            (builtinAnnotations.getPythonName(node) ?? node.name) !==
                (builtinAnnotations.getPythonName(overriddenMember) ?? overriddenMember.name)
        ) {
            return;
        }

        if (!typeChecker.isSubtypeOf(substitutedOwnMemberType, overriddenMemberType)) {
            accept(
                'error',
                expandToStringWithNL`
                    Overriding member does not match the overridden member:
                    - Expected type: ${overriddenMemberType}
                    - Actual type:   ${ownMemberType}
                `,
                {
                    node,
                    property: 'name',
                    code: CODE_INHERITANCE_INCOMPATIBLE_TO_OVERRIDDEN_MEMBER,
                },
            );
        } else if (typeChecker.isSubtypeOf(substitutedOverriddenMemberType, ownMemberType)) {
            // Prevents the info from showing when editing the builtin files
            if (isInSafedsLangAnyClass(services, node)) {
                /* c8 ignore next 2 */
                return;
            }

            // Reasons for impurity must differ
            if (
                isSdsFunction(node) &&
                isSdsFunction(overriddenMember) &&
                !isEqualSet(
                    builtinAnnotations
                        .streamImpurityReasons(node)
                        .map((it) => it.toString())
                        .toSet(),
                    builtinAnnotations
                        .streamImpurityReasons(overriddenMember)
                        .map((it) => it.toString())
                        .toSet(),
                )
            ) {
                return;
            }

            accept('info', 'Overriding member is identical to overridden member and can be removed.', {
                node,
                property: 'name',
                code: CODE_INHERITANCE_IDENTICAL_TO_OVERRIDDEN_MEMBER,
            });
        }
    };
};

const computeMemberTypes = (
    ownMember: SdsClassMember,
    overriddenMember: SdsClassMember,
    typeComputer: SafeDsTypeComputer,
): ComputeMemberTypesResult => {
    // Compute basic types (might contain type parameters)
    const ownMemberType = typeComputer.computeType(ownMember);
    let overriddenMemberType = typeComputer.computeType(overriddenMember);

    // Substitute type parameters of class containing the overridden member
    const classContainingOwnMember = AstUtils.getContainerOfType(ownMember, isSdsClass);
    const typeContainingOwnMember = typeComputer.computeType(classContainingOwnMember);

    if (typeContainingOwnMember instanceof ClassType) {
        const classContainingOverriddenMember = AstUtils.getContainerOfType(overriddenMember, isSdsClass);
        const typeContainingOverriddenMember = typeComputer.computeMatchingSupertype(
            typeContainingOwnMember,
            classContainingOverriddenMember,
        );

        if (typeContainingOverriddenMember) {
            overriddenMemberType = overriddenMemberType.substituteTypeParameters(
                typeContainingOverriddenMember.substitutions,
            );
        }
    }

    // Substitute type parameters of methods
    const substitutedOwnMemberType = ownMemberType.substituteTypeParameters(
        typeComputer.computeSubstitutionsForOverriding(ownMemberType, overriddenMemberType),
    );
    const substitutedOverriddenMemberType = overriddenMemberType.substituteTypeParameters(
        typeComputer.computeSubstitutionsForOverriding(overriddenMemberType, ownMemberType),
    );

    return { ownMemberType, overriddenMemberType, substitutedOwnMemberType, substitutedOverriddenMemberType };
};

interface ComputeMemberTypesResult {
    /**
     * The type of the own member. Type parameters of the containing class or own member are not yet substituted.
     */
    ownMemberType: Type;

    /**
     * The type of the overridden member. Type parameters of the containing class are substituted, but not the type
     * parameters of the overridden member.
     */
    overriddenMemberType: Type;

    /**
     * The type of the own member with all type parameters of the own member substituted. Substitutions are based on the
     * types of the corresponding parameters of the overridden member.
     */
    substitutedOwnMemberType: Type;

    /**
     * The type of the overridden member with all type parameters of the overridden member substituted. Substitutions
     * are based on the types of the corresponding parameters of the own member.
     */
    substitutedOverriddenMemberType: Type;
}

const isInSafedsLangAnyClass = (services: SafeDsServices, node: SdsClassMember): boolean => {
    const containingClass = AstUtils.getContainerOfType(node, isSdsClass);
    return (
        isSdsClass(containingClass) &&
        getQualifiedName(containingClass) === getQualifiedName(services.builtins.Classes.Any)
    );
};

export const classMustOnlyInheritASingleClass = (services: SafeDsServices) => {
    const typeComputer = services.typing.TypeComputer;
    const computeType = typeComputer.computeType.bind(typeComputer);

    return (node: SdsClass, accept: ValidationAcceptor): void => {
        const parentTypes = getParentTypes(node);
        if (isEmpty(parentTypes)) {
            return;
        }

        const [firstParentType, ...otherParentTypes] = parentTypes;

        // First parent type must be a class
        const computedType = computeType(firstParentType);
        if (computedType !== UnknownType) {
            if (!(computedType instanceof ClassType)) {
                accept('error', 'A class must only inherit classes.', {
                    node: firstParentType!,
                    code: CODE_INHERITANCE_NOT_A_CLASS,
                });
            } else if (computedType.isExplicitlyNullable) {
                accept('error', 'The parent type must not be nullable.', {
                    node: firstParentType!,
                    code: CODE_INHERITANCE_NULLABLE,
                });
            }
        }

        // Must have only one parent type
        for (const parentType of otherParentTypes) {
            accept('error', 'Multiple inheritance is not supported. Only the first parent type will be considered.', {
                node: parentType,
                code: CODE_INHERITANCE_MULTIPLE_INHERITANCE,
            });
        }
    };
};

export const classMustNotInheritItself = (services: SafeDsServices) => {
    const classHierarchy = services.typing.ClassHierarchy;

    return (node: SdsClass, accept: ValidationAcceptor): void => {
        const superClasses = classHierarchy.streamProperSuperclasses(node);
        if (superClasses.includes(node)) {
            accept('error', 'A class must not directly or indirectly be a subtype of itself.', {
                node: getParentTypes(node)[0]!,
                code: CODE_INHERITANCE_CYCLE,
            });
        }
    };
};

export const overridingAndOverriddenMethodsMustNotHavePythonCall = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsFunction, accept: ValidationAcceptor): void => {
        // Prevents the errors from showing when editing the builtin files
        if (isInSafedsLangAnyClass(services, node)) {
            /* c8 ignore next 2 */
            return;
        }

        // Check whether the function overrides something
        const overriddenMember = services.typing.ClassHierarchy.getOverriddenMember(node);
        if (!overriddenMember) {
            return;
        }

        // Check whether the function calls the `@PythonCall` annotation
        const ownPythonCall = builtinAnnotations.getPythonCall(node);
        if (ownPythonCall !== undefined) {
            accept('error', "An overriding method must not call the '@PythonCall' annotation.", {
                node,
                property: 'name',
                code: CODE_INHERITANCE_PYTHON_CALL,
            });
            return;
        }

        // Check whether the overridden function calls the `@PythonCall` annotation
        if (!isSdsFunction(overriddenMember)) {
            return;
        }

        const overriddenPythonCall = builtinAnnotations.getPythonCall(overriddenMember);
        if (overriddenPythonCall !== undefined) {
            accept('error', "Cannot override a method that calls the '@PythonCall' annotation.", {
                node,
                property: 'name',
                code: CODE_INHERITANCE_PYTHON_CALL,
            });
        }
    };
};

export const overridingMemberPythonNameMustMatchOverriddenMember = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsClassMember, accept: ValidationAcceptor): void => {
        // Check whether the function overrides something
        const overriddenMember = services.typing.ClassHierarchy.getOverriddenMember(node);
        if (!overriddenMember) {
            return;
        }

        // Check whether the function has a different Python name than the overridden member
        if (
            (builtinAnnotations.getPythonName(node) ?? node.name) !==
            (builtinAnnotations.getPythonName(overriddenMember) ?? overriddenMember.name)
        ) {
            accept('error', 'The Python name must match the overridden member.', {
                node,
                property: 'name',
                code: CODE_INHERITANCE_PYTHON_NAME,
            });
        }
    };
};

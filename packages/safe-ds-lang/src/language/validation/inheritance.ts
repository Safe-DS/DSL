import { expandToStringWithNL, getContainerOfType, ValidationAcceptor } from 'langium';
import { isEmpty, isEqualSet } from '../../helpers/collections.js';
import { isSdsClass, isSdsFunction, SdsClass, type SdsClassMember } from '../generated/ast.js';
import { getParentTypes, getQualifiedName } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { ClassType, Type, UnknownType } from '../typing/model.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';

export const CODE_INHERITANCE_CYCLE = 'inheritance/cycle';
export const CODE_INHERITANCE_MULTIPLE_INHERITANCE = 'inheritance/multiple-inheritance';
export const CODE_INHERITANCE_IDENTICAL_TO_OVERRIDDEN_MEMBER = 'inheritance/identical-to-overridden-member';
export const CODE_INHERITANCE_INCOMPATIBLE_TO_OVERRIDDEN_MEMBER = 'inheritance/incompatible-to-overridden-member';
export const CODE_INHERITANCE_NOT_A_CLASS = 'inheritance/not-a-class';
export const CODE_INHERITANCE_NULLABLE = 'inheritance/nullable';

export const classMemberMustMatchOverriddenMemberAndShouldBeNeeded = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;
    const classHierarchy = services.types.ClassHierarchy;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

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
            !typeChecker.isSubtypeOf(substitutedOwnMemberType, overriddenMemberType, {
                strictTypeParameterTypeCheck: true,
            })
        ) {
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
        } else if (
            typeChecker.isSubtypeOf(substitutedOverriddenMemberType, ownMemberType, {
                strictTypeParameterTypeCheck: true,
            })
        ) {
            // Prevents the info from showing when editing the builtin files
            if (isInSafedsLangAnyClass(services, node)) {
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
    const classContainingOwnMember = getContainerOfType(ownMember, isSdsClass);
    const typeContainingOwnMember = typeComputer.computeType(classContainingOwnMember);

    if (typeContainingOwnMember instanceof ClassType) {
        const classContainingOverriddenMember = getContainerOfType(overriddenMember, isSdsClass);
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
    const containingClass = getContainerOfType(node, isSdsClass);
    return (
        isSdsClass(containingClass) &&
        getQualifiedName(containingClass) === getQualifiedName(services.builtins.Classes.Any)
    );
};

export const classMustOnlyInheritASingleClass = (services: SafeDsServices) => {
    const typeComputer = services.types.TypeComputer;
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
    const classHierarchy = services.types.ClassHierarchy;

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

import { expandToStringWithNL, getContainerOfType, stream, ValidationAcceptor } from 'langium';
import { isEmpty, isEqualSet } from '../../helpers/collections.js';
import { isSdsClass, isSdsFunction, SdsClass, type SdsClassMember } from '../generated/ast.js';
import { getParentTypes, getQualifiedName } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { ClassType, UnknownType } from '../typing/model.js';

export const CODE_INHERITANCE_CYCLE = 'inheritance/cycle';
export const CODE_INHERITANCE_MULTIPLE_INHERITANCE = 'inheritance/multiple-inheritance';
export const CODE_INHERITANCE_IDENTICAL_TO_OVERRIDDEN_MEMBER = 'inheritance/identical-to-overridden-member';
export const CODE_INHERITANCE_INCOMPATIBLE_TO_OVERRIDDEN_MEMBER = 'inheritance/incompatible-to-overridden-member';
export const CODE_INHERITANCE_NOT_A_CLASS = 'inheritance/not-a-class';

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

        // Compute basic types (might contain type parameters)
        const ownMemberType = typeComputer.computeType(node);
        let overriddenMemberType = typeComputer.computeType(overriddenMember);

        // Substitute type parameters on overriddenMemberType
        const classContainingOwnMember = getContainerOfType(node, isSdsClass);
        const typeContainingOwnMember = typeComputer.computeType(classContainingOwnMember);

        if (typeContainingOwnMember instanceof ClassType) {
            const classContainingOverriddenMember = getContainerOfType(overriddenMember, isSdsClass);
            const typeContainingOverriddenMember = stream(typeComputer.streamSupertypes(typeContainingOwnMember)).find(
                (it) => it.declaration === classContainingOverriddenMember,
            );

            if (typeContainingOverriddenMember) {
                overriddenMemberType = overriddenMemberType.substituteTypeParameters(
                    typeContainingOverriddenMember.substitutions,
                );
            }
        }

        if (!typeChecker.isAssignableTo(ownMemberType, overriddenMemberType)) {
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
        } else if (typeChecker.isAssignableTo(overriddenMemberType, ownMemberType)) {
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
        if (computedType !== UnknownType && !(computedType instanceof ClassType)) {
            accept('error', 'A class must only inherit classes.', {
                node: firstParentType!,
                code: CODE_INHERITANCE_NOT_A_CLASS,
            });
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
        const superClasses = classHierarchy.streamSuperclasses(node);
        if (superClasses.includes(node)) {
            accept('error', 'A class must not directly or indirectly be a subtype of itself.', {
                node: getParentTypes(node)[0]!,
                code: CODE_INHERITANCE_CYCLE,
            });
        }
    };
};

import { getContainerOfType } from 'langium';
import type { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { isSdsCallable, isSdsClass, isSdsEnum, type SdsAbstractResult, SdsDeclaration } from '../generated/ast.js';
import {
    Enum,
    EnumVariant,
    getParameters,
    getTypeParameters,
    Parameter,
    TypeParameter,
} from '../helpers/nodeProperties.js';
import { Constant, NullConstant } from '../partialEvaluation/model.js';
import { SafeDsServices } from '../safe-ds-module.js';
import {
    CallableType,
    ClassType,
    EnumType,
    EnumVariantType,
    LiteralType,
    NamedTupleEntry,
    NamedTupleType,
    StaticType,
    Type,
    TypeParameterType,
    UnionType,
    UnknownType,
} from './model.js';
import { SafeDsClassHierarchy } from './safe-ds-class-hierarchy.js';
import { SafeDsCoreTypes } from './safe-ds-core-types.js';
import type { SafeDsTypeComputer } from './safe-ds-type-computer.js';
import { isEmpty } from '../../helpers/collections.js';
import { SafeDsTypeFactory } from './safe-ds-type-factory.js';

export class SafeDsTypeChecker {
    private readonly builtinClasses: SafeDsClasses;
    private readonly classHierarchy: SafeDsClassHierarchy;
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly factory: SafeDsTypeFactory;
    private readonly typeComputer: () => SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.builtinClasses = services.builtins.Classes;
        this.classHierarchy = services.types.ClassHierarchy;
        this.coreTypes = services.types.CoreTypes;
        this.factory = services.types.TypeFactory;
        this.typeComputer = () => services.types.TypeComputer;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // General cases
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Checks whether {@link type} is a supertype of {@link other}.
     */
    isSupertypeOf = (type: Type, other: Type, options: TypeCheckOptions = {}): boolean => {
        return this.isSubtypeOf(other, type, options);
    };

    /**
     * Checks whether {@link type} is a subtype of {@link other}.
     */
    isSubtypeOf = (type: Type, other: Type, options: TypeCheckOptions = {}): boolean => {
        if (type.equals(this.coreTypes.Nothing) || other.equals(this.coreTypes.AnyOrNull)) {
            return true;
        } else if (type === UnknownType || other === UnknownType) {
            return false;
        }

        if (other instanceof TypeParameterType) {
            if (options.strictTypeParameterTypeCheck) {
                const otherLowerBound = this.coreTypes.Nothing.withExplicitNullability(other.isExplicitlyNullable);
                return this.isSubtypeOf(type, otherLowerBound, options);
            } else {
                const otherUpperBound = this.typeComputer().computeUpperBound(other);
                return this.isSubtypeOf(type, otherUpperBound, options);
            }
        } else if (other instanceof UnionType) {
            return other.types.some((it) => this.isSubtypeOf(type, it, options));
        }

        if (type instanceof CallableType) {
            return this.callableTypeIsSubtypeOf(type, other, options);
        } else if (type instanceof ClassType) {
            return this.classTypeIsSubtypeOf(type, other, options);
        } else if (type instanceof EnumType) {
            return this.enumTypeIsSubtypeOf(type, other);
        } else if (type instanceof EnumVariantType) {
            return this.enumVariantTypeIsSubtypeOf(type, other);
        } else if (type instanceof LiteralType) {
            return this.literalTypeIsSubtypeOf(type, other, options);
        } else if (type instanceof NamedTupleType) {
            return this.namedTupleTypeIsSubtypeOf(type, other, options);
        } else if (type instanceof StaticType) {
            return this.staticTypeIsSubtypeOf(type, other, options);
        } else if (type instanceof TypeParameterType) {
            return this.typeParameterTypeIsSubtypeOf(type, other, options);
        } else if (type instanceof UnionType) {
            return this.unionTypeIsSubtypeOf(type, other, options);
        } /* c8 ignore start */ else {
            throw new Error(`Unexpected type: ${type.constructor.name}`);
        } /* c8 ignore stop */
    };

    private callableTypeIsSubtypeOf(type: CallableType, other: Type, options: TypeCheckOptions): boolean {
        if (other instanceof ClassType) {
            return other.declaration === this.builtinClasses.Any;
        } else if (other instanceof CallableType) {
            // Must accept at least as many parameters and produce at least as many results
            if (type.inputType.length < other.inputType.length || type.outputType.length < other.outputType.length) {
                return false;
            }

            // Check expected parameters
            for (let i = 0; i < other.inputType.length; i++) {
                const typeEntry = type.inputType.entries[i]!;
                const otherEntry = other.inputType.entries[i]!;

                // Names must match
                if (typeEntry.name !== otherEntry.name) {
                    return false;
                }

                // Optionality must match (all but required to optional is OK)
                if (Parameter.isRequired(typeEntry.declaration) && Parameter.isOptional(otherEntry.declaration)) {
                    return false;
                }

                // Types must be contravariant
                if (!this.isSubtypeOf(otherEntry.type, typeEntry.type, options)) {
                    return false;
                }
            }

            // Additional parameters must be optional
            for (let i = other.inputType.length; i < type.inputType.length; i++) {
                const typeEntry = type.inputType.entries[i]!;
                if (!Parameter.isOptional(typeEntry.declaration)) {
                    return false;
                }
            }

            // Check expected results
            for (let i = 0; i < other.outputType.length; i++) {
                const typeEntry = type.outputType.entries[i]!;
                const otherEntry = other.outputType.entries[i]!;

                // Names must not match since we always fetch results by index

                // Types must be covariant
                if (!this.isSubtypeOf(typeEntry.type, otherEntry.type, options)) {
                    return false;
                }
            }

            // Additional results are OK

            return true;
        } else {
            return false;
        }
    }

    private classTypeIsSubtypeOf(type: ClassType, other: Type, options: TypeCheckOptions): boolean {
        if (type.isExplicitlyNullable && !other.isExplicitlyNullable) {
            return false;
        } else if (type.declaration === this.builtinClasses.Nothing) {
            return true;
        }

        if (other instanceof ClassType) {
            if (!this.classHierarchy.isEqualToOrSubclassOf(type.declaration, other.declaration)) {
                return false;
            }

            // We are done already if we ignore type parameters or if the other type has no type parameters
            const typeParameters = getTypeParameters(other.declaration);
            if (options.ignoreTypeParameters || isEmpty(typeParameters)) {
                return true;
            }

            // Get the parent type that refers to the same class as `other`
            const candidate = this.typeComputer().computeMatchingSupertype(type, other.declaration);
            if (!candidate) {
                /* c8 ignore next 2 */
                return false;
            }

            // Check type parameters
            return typeParameters.every((it) => {
                const candidateType = candidate.substitutions.get(it) ?? UnknownType;
                const otherType = other.substitutions.get(it) ?? UnknownType;

                if (TypeParameter.isInvariant(it)) {
                    return candidateType !== UnknownType && candidateType.equals(otherType);
                } else if (TypeParameter.isCovariant(it)) {
                    return this.isSubtypeOf(candidateType, otherType, options);
                } else {
                    return this.isSubtypeOf(otherType, candidateType, options);
                }
            });
        } else {
            return false;
        }
    }

    private enumTypeIsSubtypeOf(type: EnumType, other: Type): boolean {
        if (type.isExplicitlyNullable && !other.isExplicitlyNullable) {
            return false;
        }

        if (other instanceof ClassType) {
            return other.declaration === this.builtinClasses.Any;
        } else if (other instanceof EnumType) {
            return type.declaration === other.declaration;
        } else {
            return false;
        }
    }

    private enumVariantTypeIsSubtypeOf(type: EnumVariantType, other: Type): boolean {
        if (type.isExplicitlyNullable && !other.isExplicitlyNullable) {
            return false;
        }

        if (other instanceof ClassType) {
            return other.declaration === this.builtinClasses.Any;
        } else if (other instanceof EnumType) {
            const containingEnum = getContainerOfType(type.declaration, isSdsEnum);
            return containingEnum === other.declaration;
        } else if (other instanceof EnumVariantType) {
            return type.declaration === other.declaration;
        } else {
            return false;
        }
    }

    private literalTypeIsSubtypeOf(type: LiteralType, other: Type, options: TypeCheckOptions): boolean {
        if (type.isExplicitlyNullable && !other.isExplicitlyNullable) {
            return false;
        } else if (type.constants.length === 0) {
            // Empty literal types are equivalent to `Nothing` and assignable to any type
            return true;
        } else if (type.constants.every((it) => it === NullConstant)) {
            // Literal types containing only `null` are equivalent to `Nothing?` and assignable to any nullable type
            return other.isExplicitlyNullable;
        }

        if (other instanceof ClassType) {
            if (other.equals(this.coreTypes.Any.withExplicitNullability(type.isExplicitlyNullable))) {
                return true;
            }

            return type.constants.every((constant) => this.constantIsSubtypeOfClassType(constant, other, options));
        } else if (other instanceof LiteralType) {
            return type.constants.every((constant) =>
                other.constants.some((otherConstant) => constant.equals(otherConstant)),
            );
        } else {
            return false;
        }
    }

    private constantIsSubtypeOfClassType(constant: Constant, other: ClassType, options: TypeCheckOptions): boolean {
        const classType = this.typeComputer().computeClassTypeForConstant(constant);
        return this.isSubtypeOf(classType, other, options);
    }

    private namedTupleTypeIsSubtypeOf(
        type: NamedTupleType<SdsDeclaration>,
        other: Type,
        options: TypeCheckOptions,
    ): boolean {
        if (other instanceof ClassType) {
            return other.declaration === this.builtinClasses.Any;
        } else if (other instanceof NamedTupleType) {
            return (
                type.length === other.length &&
                type.entries.every((typeEntry, i) => {
                    const otherEntry = other.entries[i]!;
                    // We deliberately ignore the declarations here
                    return (
                        typeEntry.name === otherEntry.name && this.isSubtypeOf(typeEntry.type, otherEntry.type, options)
                    );
                })
            );
        } else {
            return false;
        }
    }

    private staticTypeIsSubtypeOf(type: StaticType, other: Type, options: TypeCheckOptions): boolean {
        if (other instanceof CallableType) {
            return this.isSubtypeOf(this.associatedCallableTypeForStaticType(type), other, options);
        } else if (other instanceof ClassType) {
            return other.declaration === this.builtinClasses.Any;
        } else {
            return type.equals(other);
        }
    }

    private associatedCallableTypeForStaticType(type: StaticType): Type {
        const instanceType = type.instanceType;
        if (instanceType instanceof ClassType) {
            const declaration = instanceType.declaration;
            if (!declaration.parameterList) {
                return UnknownType;
            }

            const parameterEntries = this.factory.createNamedTupleType(
                ...getParameters(declaration).map(
                    (it) => new NamedTupleEntry(it, it.name, this.typeComputer().computeType(it)),
                ),
            );
            const resultEntries = this.factory.createNamedTupleType(
                new NamedTupleEntry<SdsAbstractResult>(undefined, 'instance', instanceType),
            );

            return this.factory.createCallableType(declaration, undefined, parameterEntries, resultEntries);
        } else if (instanceType instanceof EnumVariantType) {
            const declaration = instanceType.declaration;

            const parameterEntries = this.factory.createNamedTupleType(
                ...getParameters(declaration).map(
                    (it) => new NamedTupleEntry(it, it.name, this.typeComputer().computeType(it)),
                ),
            );
            const resultEntries = this.factory.createNamedTupleType(
                new NamedTupleEntry<SdsAbstractResult>(undefined, 'instance', instanceType),
            );

            return this.factory.createCallableType(declaration, undefined, parameterEntries, resultEntries);
        } else {
            return UnknownType;
        }
    }

    private typeParameterTypeIsSubtypeOf(type: TypeParameterType, other: Type, options: TypeCheckOptions): boolean {
        const upperBound = this.typeComputer().computeUpperBound(type);
        return this.isSubtypeOf(upperBound, other, options);
    }

    private unionTypeIsSubtypeOf(type: UnionType, other: Type, options: TypeCheckOptions): boolean {
        return type.types.every((it) => this.isSubtypeOf(it, other, options));
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Special cases
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Checks whether {@link type} is allowed as the type of the receiver of an indexed access.
     */
    canBeAccessedByIndex = (type: Type): boolean => {
        return this.isList(type) || this.isMap(type);
    };

    /**
     * Checks whether {@link type} is allowed as the type of the receiver of a call.
     */
    canBeCalled = (type: Type): boolean => {
        // We must create the non-nullable version since calls can be null-safe
        const nonNullableReceiverType = this.typeComputer().computeNonNullableType(type);

        if (nonNullableReceiverType instanceof CallableType) {
            return true;
        } else if (nonNullableReceiverType instanceof StaticType) {
            const declaration = nonNullableReceiverType.instanceType.declaration;
            if (isSdsClass(declaration)) {
                // Must have a constructor
                return declaration.parameterList !== undefined;
            } else {
                return isSdsCallable(declaration);
            }
        } else {
            return false;
        }
    };

    /**
     * Returns whether {@link type} can be `null`. Compared to {@link Type.isExplicitlyNullable}, this method also considers the
     * upper bound of type parameter types.
     */
    canBeNull = (type: Type): boolean => {
        if (type.isExplicitlyNullable) {
            return true;
        } else if (type instanceof TypeParameterType) {
            const upperBound = this.typeComputer().computeUpperBound(type);
            return upperBound.isExplicitlyNullable;
        } else {
            return false;
        }
    };

    /**
     * Checks whether {@link type} is allowed as the type of a constant parameter.
     */
    canBeTypeOfConstantParameter = (type: Type): boolean => {
        if (type instanceof ClassType) {
            return [
                this.builtinClasses.Boolean,
                this.builtinClasses.Float,
                this.builtinClasses.Int,
                this.builtinClasses.List,
                this.builtinClasses.Map,
                this.builtinClasses.Nothing,
                this.builtinClasses.String,
            ].includes(type.declaration);
        } else if (type instanceof EnumType) {
            return Enum.isConstant(type.declaration);
        } else if (type instanceof EnumVariantType) {
            return EnumVariant.isConstant(type.declaration);
        } else {
            return type instanceof LiteralType || type === UnknownType;
        }
    };

    /**
     * Checks whether {@link type} is some kind of list (with any element type).
     */
    isList(type: Type): type is ClassType | TypeParameterType {
        const listOrNull = this.coreTypes.List(UnknownType).withExplicitNullability(true);

        return (
            !type.equals(this.coreTypes.Nothing) &&
            !type.equals(this.coreTypes.NothingOrNull) &&
            this.isSubtypeOf(type, listOrNull, {
                ignoreTypeParameters: true,
            })
        );
    }

    /**
     * Checks whether {@link type} is some kind of map (with any key/value types).
     */
    isMap(type: Type): type is ClassType | TypeParameterType {
        const mapOrNull = this.coreTypes.Map(UnknownType, UnknownType).withExplicitNullability(true);

        return (
            !type.equals(this.coreTypes.Nothing) &&
            !type.equals(this.coreTypes.NothingOrNull) &&
            this.isSubtypeOf(type, mapOrNull, {
                ignoreTypeParameters: true,
            })
        );
    }
}

/**
 * Options for {@link SafeDsTypeChecker.isSubtypeOf} and {@link SafeDsTypeChecker.isSupertypeOf}.
 */
interface TypeCheckOptions {
    /**
     * Whether to ignore type parameters when comparing class types.
     */
    ignoreTypeParameters?: boolean;

    /**
     * By default, type parameter types are replaced with their upper bound when comparing types. This is usually the
     * correct behavior, e.g. to check whether the type `Int` can be assigned to an unsubstituted type parameter type
     * `T`.
     *
     * However, in some cases, we have to assume that the type parameter type that we compare to gets substituted later,
     * e.g. by its lower bound `Nothing`. This options enables a strict check, replacing type parameter types in the
     * first argument of {@link SafeDsTypeChecker.isSubtypeOf} with their upper bound, and in the second argument with
     * their lower bound.
     */
    strictTypeParameterTypeCheck?: boolean;
}

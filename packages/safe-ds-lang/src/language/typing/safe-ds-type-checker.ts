import { getContainerOfType } from 'langium';
import type { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { isSdsEnum, type SdsAbstractResult, SdsDeclaration } from '../generated/ast.js';
import { getParameters } from '../helpers/nodeProperties.js';
import { Constant } from '../partialEvaluation/model.js';
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
    UnionType,
    UnknownType,
} from './model.js';
import { SafeDsClassHierarchy } from './safe-ds-class-hierarchy.js';
import { SafeDsCoreTypes } from './safe-ds-core-types.js';
import type { SafeDsTypeComputer } from './safe-ds-type-computer.js';

export class SafeDsTypeChecker {
    private readonly builtinClasses: SafeDsClasses;
    private readonly classHierarchy: SafeDsClassHierarchy;
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly typeComputer: () => SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.builtinClasses = services.builtins.Classes;
        this.classHierarchy = services.types.ClassHierarchy;
        this.coreTypes = services.types.CoreTypes;
        this.typeComputer = () => services.types.TypeComputer;
    }

    /**
     * Checks whether {@link type} is assignable {@link other}.
     */
    isAssignableTo(type: Type, other: Type): boolean {
        if (type === UnknownType || other === UnknownType) {
            return false;
        } else if (other instanceof UnionType) {
            return other.possibleTypes.some((it) => this.isAssignableTo(type, it));
        }

        if (type instanceof CallableType) {
            return this.callableTypeIsAssignableTo(type, other);
        } else if (type instanceof ClassType) {
            return this.classTypeIsAssignableTo(type, other);
        } else if (type instanceof EnumType) {
            return this.enumTypeIsAssignableTo(type, other);
        } else if (type instanceof EnumVariantType) {
            return this.enumVariantTypeIsAssignableTo(type, other);
        } else if (type instanceof LiteralType) {
            return this.literalTypeIsAssignableTo(type, other);
        } else if (type instanceof NamedTupleType) {
            return this.namedTupleTypeIsAssignableTo(type, other);
        } else if (type instanceof StaticType) {
            return this.staticTypeIsAssignableTo(type, other);
        } else if (type instanceof UnionType) {
            return this.unionTypeIsAssignableTo(type, other);
        } /* c8 ignore start */ else {
            throw new Error(`Unexpected type: ${type.constructor.name}`);
        } /* c8 ignore stop */
    }

    private callableTypeIsAssignableTo(type: CallableType, other: Type): boolean {
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

                // Types must be contravariant
                if (!this.isAssignableTo(otherEntry.type, typeEntry.type)) {
                    return false;
                }
            }

            // Additional parameters must be optional
            for (let i = other.inputType.length; i < type.inputType.length; i++) {
                const typeEntry = type.inputType.entries[i]!;
                if (!typeEntry.declaration?.defaultValue) {
                    return false;
                }
            }

            // Check expected results
            for (let i = 0; i < other.outputType.length; i++) {
                const typeEntry = type.outputType.entries[i]!;
                const otherEntry = other.outputType.entries[i]!;

                // Names must not match since we always fetch results by index

                // Types must be covariant
                if (!this.isAssignableTo(typeEntry.type, otherEntry.type)) {
                    return false;
                }
            }

            // Additional results are OK

            return true;
        } else {
            return false;
        }
    }

    private classTypeIsAssignableTo(type: ClassType, other: Type): boolean {
        if (type.isNullable && !other.isNullable) {
            return false;
        }

        if (other instanceof ClassType) {
            return this.classHierarchy.isEqualToOrSubclassOf(type.declaration, other.declaration);
        } else {
            return false;
        }
    }

    private enumTypeIsAssignableTo(type: EnumType, other: Type): boolean {
        if (type.isNullable && !other.isNullable) {
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

    private enumVariantTypeIsAssignableTo(type: EnumVariantType, other: Type): boolean {
        if (type.isNullable && !other.isNullable) {
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

    private literalTypeIsAssignableTo(type: LiteralType, other: Type): boolean {
        if (type.isNullable && !other.isNullable) {
            return false;
        }

        if (other instanceof ClassType) {
            if (other.equals(this.coreTypes.AnyOrNull)) {
                return true;
            }

            return type.constants.every((constant) => this.constantIsAssignableToClassType(constant, other));
        } else if (other instanceof LiteralType) {
            return type.constants.every((constant) =>
                other.constants.some((otherConstant) => constant.equals(otherConstant)),
            );
        } else {
            return false;
        }
    }

    private constantIsAssignableToClassType(constant: Constant, other: ClassType): boolean {
        const classType = this.typeComputer().computeClassTypeForConstant(constant);
        return this.isAssignableTo(classType, other);
    }

    private namedTupleTypeIsAssignableTo(type: NamedTupleType<SdsDeclaration>, other: Type): boolean {
        if (other instanceof NamedTupleType) {
            return (
                type.length === other.length &&
                type.entries.every((typeEntry, i) => {
                    const otherEntry = other.entries[i]!;
                    // We deliberately ignore the declarations here
                    return typeEntry.name === otherEntry.name && this.isAssignableTo(typeEntry.type, otherEntry.type);
                })
            );
        } else {
            return false;
        }
    }

    private staticTypeIsAssignableTo(type: StaticType, other: Type): boolean {
        if (other instanceof CallableType) {
            return this.isAssignableTo(this.associatedCallableTypeForStaticType(type), other);
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

            const parameterEntries = new NamedTupleType(
                ...getParameters(declaration).map(
                    (it) => new NamedTupleEntry(it, it.name, this.typeComputer().computeType(it)),
                ),
            );
            const resultEntries = new NamedTupleType(
                new NamedTupleEntry<SdsAbstractResult>(undefined, 'instance', instanceType),
            );

            return new CallableType(declaration, parameterEntries, resultEntries);
        } else if (instanceType instanceof EnumVariantType) {
            const declaration = instanceType.declaration;

            const parameterEntries = new NamedTupleType(
                ...getParameters(declaration).map(
                    (it) => new NamedTupleEntry(it, it.name, this.typeComputer().computeType(it)),
                ),
            );
            const resultEntries = new NamedTupleType(
                new NamedTupleEntry<SdsAbstractResult>(undefined, 'instance', instanceType),
            );

            return new CallableType(declaration, parameterEntries, resultEntries);
        } else {
            return UnknownType;
        }
    }

    private unionTypeIsAssignableTo(type: UnionType, other: Type): boolean {
        return type.possibleTypes.every((it) => this.isAssignableTo(it, other));
    }
}

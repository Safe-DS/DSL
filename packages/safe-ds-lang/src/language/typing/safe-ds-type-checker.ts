import { getContainerOfType } from 'langium';
import type { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { isSdsEnum, SdsDeclaration } from '../generated/ast.js';
import {
    BooleanConstant,
    Constant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../partialEvaluation/model.js';
import { SafeDsServices } from '../safe-ds-module.js';
import {
    CallableType,
    ClassType,
    EnumType,
    EnumVariantType,
    LiteralType,
    NamedTupleType,
    StaticType,
    Type,
    UnionType,
    UnknownType,
} from './model.js';
import { SafeDsClassHierarchy } from './safe-ds-class-hierarchy.js';
import { SafeDsCoreTypes } from './safe-ds-core-types.js';

export class SafeDsTypeChecker {
    private readonly builtinClasses: SafeDsClasses;
    private readonly classHierarchy: SafeDsClassHierarchy;
    private readonly coreTypes: SafeDsCoreTypes;

    constructor(services: SafeDsServices) {
        this.builtinClasses = services.builtins.Classes;
        this.classHierarchy = services.types.ClassHierarchy;
        this.coreTypes = services.types.CoreTypes;
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
        //     return when (val unwrappedOther = unwrapVariadicType(other)) {
        //         is CallableType -> {
        //             // TODO: We need to compare names of parameters & results and can allow additional optional parameters
        //
        //             // Sizes must match (too strict requirement -> should be loosened later)
        //             if (this.parameters.size != unwrappedOther.parameters.size || this.results.size != this.results.size) {
        //                 return false
        //             }
        //
        //             // Actual parameters must be supertypes of expected parameters (contravariance)
        //             this.parameters.zip(unwrappedOther.parameters).forEach { (thisParameter, otherParameter) ->
        //                 if (!otherParameter.isSubstitutableFor(thisParameter)) {
        //                     return false
        //                 }
        //             }
        //
        //             // Expected results must be subtypes of expected results (covariance)
        //             this.results.zip(unwrappedOther.results).forEach { (thisResult, otherResult) ->
        //                 if (!thisResult.isSubstitutableFor(otherResult)) {
        //                     return false
        //                 }
        //             }
        //
        //             true
        //         }
        //         is ClassType -> {
        //             unwrappedOther.sdsClass.qualifiedNameOrNull() == StdlibClasses.Any
        //         }
        //     else -> false
        //     }
        // }

        return type.equals(other);
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
        let classType: Type;
        if (constant instanceof BooleanConstant) {
            classType = this.coreTypes.Boolean;
        } else if (constant instanceof FloatConstant) {
            classType = this.coreTypes.Float;
        } else if (constant instanceof IntConstant) {
            classType = this.coreTypes.Int;
        } else if (constant === NullConstant) {
            classType = this.coreTypes.NothingOrNull;
        } else if (constant instanceof StringConstant) {
            classType = this.coreTypes.String;
        } /* c8 ignore start */ else {
            throw new Error(`Unexpected constant type: ${constant.constructor.name}`);
        } /* c8 ignore stop */

        return this.isAssignableTo(classType, other);
    }

    private namedTupleTypeIsAssignableTo(type: NamedTupleType<SdsDeclaration>, other: Type): boolean {
        if (other instanceof NamedTupleType) {
            return (
                type.length === other.length &&
                type.entries.every((typeEntry, index) => {
                    const otherEntry = other.entries[index];
                    // We deliberately ignore the declarations here
                    return typeEntry.name === otherEntry.name && this.isAssignableTo(typeEntry.type, otherEntry.type);
                })
            );
        } else {
            return false;
        }
    }

    private staticTypeIsAssignableTo(type: Type, other: Type): boolean {
        return type.equals(other);
    }

    private unionTypeIsAssignableTo(type: UnionType, other: Type): boolean {
        return type.possibleTypes.every((it) => this.isAssignableTo(it, other));
    }
}

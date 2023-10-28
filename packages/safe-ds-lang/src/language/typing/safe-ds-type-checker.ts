import { SdsDeclaration } from '../generated/ast.js';
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
    private readonly classHierarchy: SafeDsClassHierarchy;
    private readonly coreTypes: SafeDsCoreTypes;

    constructor(services: SafeDsServices) {
        this.classHierarchy = services.types.ClassHierarchy;
        this.coreTypes = services.types.CoreTypes;
    }

    /**
     * Checks whether {@link type} is assignable {@link other}.
     */
    isAssignableTo(type: Type, other: Type): boolean {
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
        } else {
            return false;
        }
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
        //         is UnionType -> {
        //             unwrappedOther.possibleTypes.any { this.isSubstitutableFor(it) }
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
        } else if (other instanceof UnionType) {
            return other.possibleTypes.some((it) => this.isAssignableTo(type, it));
        } else {
            return false;
        }
    }

    private enumTypeIsAssignableTo(type: EnumType, other: Type): boolean {
        //     return when (val unwrappedOther = unwrapVariadicType(other)) {
        //         is ClassType -> {
        //             (!this.isNullable || unwrappedOther.isNullable) &&
        //             unwrappedOther.sdsClass.qualifiedNameOrNull() == StdlibClasses.Any
        //         }
        //         is EnumType -> {
        //             (!this.isNullable || unwrappedOther.isNullable) && this.sdsEnum == unwrappedOther.sdsEnum
        //         }
        //         is UnionType -> {
        //             unwrappedOther.possibleTypes.any { this.isSubstitutableFor(it) }
        //         }
        //     else -> false
        //     }

        return type.equals(other);
    }

    private enumVariantTypeIsAssignableTo(type: EnumVariantType, other: Type): boolean {
        //     return when (val unwrappedOther = unwrapVariadicType(other)) {
        //         is ClassType -> {
        //             (!this.isNullable || unwrappedOther.isNullable) &&
        //             unwrappedOther.sdsClass.qualifiedNameOrNull() == StdlibClasses.Any
        //         }
        //         is EnumType -> {
        //             (!this.isNullable || unwrappedOther.isNullable) &&
        //             this.sdsEnumVariant in unwrappedOther.sdsEnum.variantsOrEmpty()
        //         }
        //         is EnumVariantType -> {
        //             (!this.isNullable || unwrappedOther.isNullable) && this.sdsEnumVariant == unwrappedOther.sdsEnumVariant
        //         }
        //         is UnionType -> unwrappedOther.possibleTypes.any { this.isSubstitutableFor(it) }
        //     else -> false
        //     }

        return type.equals(other);
    }

    private literalTypeIsAssignableTo(type: LiteralType, other: Type): boolean {
        if (type.isNullable && !other.isNullable) {
            return false;
        }

        if (other instanceof ClassType) {
            if (other.equals(this.coreTypes.AnyOrNull)) {
                return true;
            }

            return type.constants.every((constant) => {
                const constantType = this.constantToType(constant);
                return this.isAssignableTo(constantType, other);
            });
        } else if (other instanceof LiteralType) {
            return type.constants.every((constant) =>
                other.constants.some((otherConstant) => constant.equals(otherConstant)),
            );
        } else {
            // TODO: union type
            return false;
        }
    }

    private constantToType(constant: Constant): Type {
        if (constant instanceof BooleanConstant) {
            return this.coreTypes.Boolean;
        } else if (constant instanceof FloatConstant) {
            return this.coreTypes.Float;
        } else if (constant instanceof IntConstant) {
            return this.coreTypes.Int;
        } else if (constant === NullConstant) {
            return this.coreTypes.NothingOrNull;
        } else if (constant instanceof StringConstant) {
            return this.coreTypes.String;
        } else {
            return UnknownType;
        }
    }

    private namedTupleTypeIsAssignableTo(type: NamedTupleType<SdsDeclaration>, other: Type): boolean {
        return type.equals(other);
    }

    private staticTypeIsAssignableTo(type: Type, other: Type): boolean {
        return type.equals(other);
    }

    private unionTypeIsAssignableTo(type: UnionType, other: Type): boolean {
        //     return this.possibleTypes.all { it.isSubstitutableFor(other) }
        return type.equals(other);
    }
}

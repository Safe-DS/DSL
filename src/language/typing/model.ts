// package com.larsreimann.safeds.staticAnalysis.typing
//
// import com.larsreimann.safeds.emf.containingEnumOrNull
// import com.larsreimann.safeds.naming.qualifiedNameOrNull
// import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
// import com.larsreimann.safeds.safeDS.SdsClass
// import com.larsreimann.safeds.safeDS.SdsEnum
// import com.larsreimann.safeds.safeDS.SdsEnumVariant
// import org.eclipse.xtext.naming.QualifiedName

import { SdsClass, SdsDeclaration, SdsEnum, SdsEnumVariant } from '../generated/ast.js';

/* c8 ignore start */
export abstract class Type {
    abstract isNullable: boolean;

    abstract copyWithNullability(isNullable: boolean): Type;

    abstract equals(other: Type): boolean;

    abstract toString(): string;
}

export abstract class NamedType extends Type {
    protected constructor(private readonly sdsDeclaration: SdsDeclaration) {
        super();
    }

    override toString(): string {
        if (this.isNullable) {
            return `${this.sdsDeclaration.name}?`;
        } else {
            return this.sdsDeclaration.name;
        }
    }

    // TODO: toQualifiedString(): string that uses qualified names instead of simple names
}

export class ClassType extends NamedType {
    constructor(
        readonly sdsClass: SdsClass,
        override readonly isNullable: boolean,
    ) {
        super(sdsClass);
    }

    override copyWithNullability(isNullable: boolean): Type {
        return new ClassType(this.sdsClass, isNullable);
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof ClassType)) {
            return false;
        }

        return other.sdsClass === this.sdsClass && other.isNullable === this.isNullable;
    }
}

export class EnumType extends NamedType {
    constructor(
        readonly sdsEnum: SdsEnum,
        override readonly isNullable: boolean,
    ) {
        super(sdsEnum);
    }

    override copyWithNullability(isNullable: boolean): Type {
        return new EnumType(this.sdsEnum, isNullable);
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof EnumType)) {
            return false;
        }

        return other.sdsEnum === this.sdsEnum && other.isNullable === this.isNullable;
    }
}

export class EnumVariantType extends NamedType {
    constructor(
        readonly sdsEnumVariant: SdsEnumVariant,
        override readonly isNullable: boolean,
    ) {
        super(sdsEnumVariant);
    }

    override copyWithNullability(isNullable: boolean): Type {
        return new EnumVariantType(this.sdsEnumVariant, isNullable);
    }

    override equals(other: Type): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof EnumVariantType)) {
            return false;
        }

        return other.sdsEnumVariant === this.sdsEnumVariant && other.isNullable === this.isNullable;
    }

    //     override fun toSimpleString() = buildString {
    //         sdsEnumVariant.containingEnumOrNull()?.let { append("${it.name}.") }
    //         append(sdsEnumVariant.name)
    //         // nullability
    //     }
}

// class RecordType(resultToType: List<Pair<String, Type>>) : Type() {
// private val resultToType = resultToType.toMap()
//
//     override val isNullable = false
//     override fun setIsNullableOnCopy(isNullable: boolean) = this
//
//     override fun toString(): String {
//         val types = resultToType.entries.joinToString { (name, type) -> "$name: $type" }
//         return "($types)"
//     }
//
//     override fun toSimpleString(): String {
//         val types = resultToType.entries.joinToString { (name, type) -> "$name: ${type.toSimpleString()}" }
//         return "($types)"
//     }
//
//     override fun equals(other: Any?): boolean {
//         if (this === other) return true
//         if (javaClass != other?.javaClass) return false
//
//         other as RecordType
//
//         if (resultToType != other.resultToType) return false
//         if (isNullable != other.isNullable) return false
//
//         return true
//     }
//
//     override fun hashCode(): Int {
//         var result = resultToType.hashCode()
//         result = 31 * result + isNullable.hashCode()
//         return result
//     }
// }
//
// data class CallableType(val parameters: List<Type>, val results: List<Type>) : Type() {
//     override val isNullable = false
//     override fun setIsNullableOnCopy(isNullable: boolean) = this
//
//     override fun toString(): String {
//         val parameters = parameters.joinToString()
//         val results = results.joinToString()
//
//         return "($parameters) -> ($results)"
//     }
//
//     override fun toSimpleString(): String {
//         val parameters = parameters.joinToString { it.toSimpleString() }
//         val results = results.joinToString { it.toSimpleString() }
//
//         return "($parameters) -> ($results)"
//     }
// }
//
//
// LiteralType
//
// }
//
// data class UnionType(val possibleTypes: Set<Type>) : Type() {
//     override val isNullable = false
//     override fun setIsNullableOnCopy(isNullable: boolean) = this
//
//     override fun toString(): String {
//         return "union<${possibleTypes.joinToString()}>"
//     }
//
//     override fun toSimpleString(): String {
//         return "union<${possibleTypes.joinToString { it.toSimpleString() }}>"
//     }
// }
//
// data class VariadicType(val elementType: Type) : Type() {
//     override val isNullable = false
//     override fun setIsNullableOnCopy(isNullable: boolean) = this
//
//     override fun toString(): String {
//         return "vararg<$elementType>"
//     }
//
//     override fun toSimpleString(): String {
//         return "vararg<${elementType.toSimpleString()}>"
//     }
// }
//
// data class ParameterisedType(
//     val sdsAbstractNamedTypeDeclaration: SdsAbstractDeclaration,
//     val kind: String,
// ) : Type() {
//     override val isNullable = false
//     override fun setIsNullableOnCopy(isNullable: boolean) = this
//
//     override fun toString(): String {
//         return "::$kind"
//     }
//
//     override fun toSimpleString(): String {
//         return "::$kind"
//     }
// }

class UnresolvedTypeClass extends Type {
    readonly isNullable = false;

    copyWithNullability(_isNullable: boolean): Type {
        return this;
    }

    override equals(other: Type): boolean {
        return other instanceof UnresolvedTypeClass;
    }

    toString(): string {
        return '$Unresolved';
    }
}

export const UnresolvedType = new UnresolvedTypeClass();
/* c8 ignore stop */

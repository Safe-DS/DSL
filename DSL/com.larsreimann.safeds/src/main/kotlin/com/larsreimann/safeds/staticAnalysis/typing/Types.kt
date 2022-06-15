package com.larsreimann.safeds.staticAnalysis.typing

import de.unibonn.simpleml.emf.containingEnumOrNull
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import org.eclipse.xtext.naming.QualifiedName

sealed class Type {
    abstract val isNullable: Boolean
    abstract fun setIsNullableOnCopy(isNullable: Boolean): Type
    abstract fun toSimpleString(): String
}

class RecordType(resultToType: List<Pair<String, Type>>) : Type() {
    private val resultToType = resultToType.toMap()

    override val isNullable = false
    override fun setIsNullableOnCopy(isNullable: Boolean) = this

    override fun toString(): String {
        val types = resultToType.entries.joinToString { (name, type) -> "$name: $type" }
        return "($types)"
    }

    override fun toSimpleString(): String {
        val types = resultToType.entries.joinToString { (name, type) -> "$name: ${type.toSimpleString()}" }
        return "($types)"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as RecordType

        if (resultToType != other.resultToType) return false
        if (isNullable != other.isNullable) return false

        return true
    }

    override fun hashCode(): Int {
        var result = resultToType.hashCode()
        result = 31 * result + isNullable.hashCode()
        return result
    }
}

data class CallableType(val parameters: List<Type>, val results: List<Type>) : Type() {
    override val isNullable = false
    override fun setIsNullableOnCopy(isNullable: Boolean) = this

    override fun toString(): String {
        val parameters = parameters.joinToString()
        val results = results.joinToString()

        return "($parameters) -> ($results)"
    }

    override fun toSimpleString(): String {
        val parameters = parameters.joinToString { it.toSimpleString() }
        val results = results.joinToString { it.toSimpleString() }

        return "($parameters) -> ($results)"
    }
}

sealed class NamedType(smlDeclaration: SmlAbstractDeclaration) : Type() {
    val simpleName: String = smlDeclaration.name
    val qualifiedName: QualifiedName = smlDeclaration.qualifiedNameOrNull()!!

    override fun toString() = buildString {
        append(qualifiedName)
        if (isNullable) {
            append("?")
        }
    }

    override fun toSimpleString() = buildString {
        append(simpleName)
        if (isNullable) {
            append("?")
        }
    }
}

data class ClassType(
    val smlClass: SmlClass,
    override val isNullable: Boolean
) : NamedType(smlClass) {
    override fun setIsNullableOnCopy(isNullable: Boolean) = this.copy(isNullable = isNullable)

    override fun toString() = super.toString()
}

data class EnumType(
    val smlEnum: SmlEnum,
    override val isNullable: Boolean
) : NamedType(smlEnum) {
    override fun setIsNullableOnCopy(isNullable: Boolean) = this.copy(isNullable = isNullable)

    override fun toString() = super.toString()
}

data class EnumVariantType(
    val smlEnumVariant: SmlEnumVariant,
    override val isNullable: Boolean
) : NamedType(smlEnumVariant) {
    override fun setIsNullableOnCopy(isNullable: Boolean) = this.copy(isNullable = isNullable)

    override fun toString() = super.toString()

    override fun toSimpleString() = buildString {
        smlEnumVariant.containingEnumOrNull()?.let { append("${it.name}.") }
        append(smlEnumVariant.name)
    }
}

data class UnionType(val possibleTypes: Set<Type>) : Type() {
    override val isNullable = false
    override fun setIsNullableOnCopy(isNullable: Boolean) = this

    override fun toString(): String {
        return "union<${possibleTypes.joinToString()}>"
    }

    override fun toSimpleString(): String {
        return "union<${possibleTypes.joinToString { it.toSimpleString() }}>"
    }
}

data class VariadicType(val elementType: Type) : Type() {
    override val isNullable = false
    override fun setIsNullableOnCopy(isNullable: Boolean) = this

    override fun toString(): String {
        return "vararg<$elementType>"
    }

    override fun toSimpleString(): String {
        return "vararg<${elementType.toSimpleString()}>"
    }
}

object UnresolvedType : Type() {
    override val isNullable = false
    override fun setIsNullableOnCopy(isNullable: Boolean) = this

    override fun toString() = "\$Unresolved"

    override fun toSimpleString() = toString()
}

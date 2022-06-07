package de.unibonn.simpleml.staticAnalysis.typing

import de.unibonn.simpleml.emf.variantsOrEmpty
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import de.unibonn.simpleml.staticAnalysis.classHierarchy.isSubtypeOf
import de.unibonn.simpleml.stdlibAccess.StdlibClasses

fun Type.isSubstitutableFor(other: Type, resultIfUnresolved: Boolean = false): Boolean {
    if (other == UnresolvedType) {
        return resultIfUnresolved
    }

    return when (this) {
        is CallableType -> this.isSubstitutableFor(other)
        is ClassType -> this.isSubstitutableFor(other)
        is EnumType -> this.isSubstitutableFor(other)
        is EnumVariantType -> this.isSubstitutableFor(other)
        is UnionType -> this.isSubstitutableFor(other)
        is VariadicType -> this.isSubstitutableFor(other)
        is RecordType -> false
        UnresolvedType -> resultIfUnresolved
    }
}

private fun CallableType.isSubstitutableFor(other: Type): Boolean {
    return when (val unwrappedOther = unwrapVariadicType(other)) {
        is CallableType -> {
            // TODO: We need to compare names of parameters & results and can allow additional optional parameters

            // Sizes must match (too strict requirement -> should be loosened later)
            if (this.parameters.size != unwrappedOther.parameters.size || this.results.size != this.results.size) {
                return false
            }

            // Actual parameters must be supertypes of expected parameters (contravariance)
            this.parameters.zip(unwrappedOther.parameters).forEach { (thisParameter, otherParameter) ->
                if (!otherParameter.isSubstitutableFor(thisParameter)) {
                    return false
                }
            }

            // Expected results must be subtypes of expected results (covariance)
            this.results.zip(unwrappedOther.results).forEach { (thisResult, otherResult) ->
                if (!thisResult.isSubstitutableFor(otherResult)) {
                    return false
                }
            }

            true
        }
        is ClassType -> {
            unwrappedOther.smlClass.qualifiedNameOrNull() == StdlibClasses.Any
        }
        is UnionType -> {
            unwrappedOther.possibleTypes.any { this.isSubstitutableFor(it) }
        }
        else -> false
    }
}

private fun ClassType.isSubstitutableFor(other: Type): Boolean {
    return when (val unwrappedOther = unwrapVariadicType(other)) {
        is ClassType -> {
            (!this.isNullable || unwrappedOther.isNullable) && this.smlClass.isSubtypeOf(unwrappedOther.smlClass)
        }
        is UnionType -> {
            unwrappedOther.possibleTypes.any { this.isSubstitutableFor(it) }
        }
        else -> false
    }
}

private fun EnumType.isSubstitutableFor(other: Type): Boolean {
    return when (val unwrappedOther = unwrapVariadicType(other)) {
        is ClassType -> {
            (!this.isNullable || unwrappedOther.isNullable) &&
                    unwrappedOther.smlClass.qualifiedNameOrNull() == StdlibClasses.Any
        }
        is EnumType -> {
            (!this.isNullable || unwrappedOther.isNullable) && this.smlEnum == unwrappedOther.smlEnum
        }
        is UnionType -> {
            unwrappedOther.possibleTypes.any { this.isSubstitutableFor(it) }
        }
        else -> false
    }
}

private fun EnumVariantType.isSubstitutableFor(other: Type): Boolean {
    return when (val unwrappedOther = unwrapVariadicType(other)) {
        is ClassType -> {
            (!this.isNullable || unwrappedOther.isNullable) &&
                    unwrappedOther.smlClass.qualifiedNameOrNull() == StdlibClasses.Any
        }
        is EnumType -> {
            (!this.isNullable || unwrappedOther.isNullable) &&
                    this.smlEnumVariant in unwrappedOther.smlEnum.variantsOrEmpty()
        }
        is EnumVariantType -> {
            (!this.isNullable || unwrappedOther.isNullable) && this.smlEnumVariant == unwrappedOther.smlEnumVariant
        }
        is UnionType -> unwrappedOther.possibleTypes.any { this.isSubstitutableFor(it) }
        else -> false
    }
}

/**
 * A [UnionType] can be substituted for another type of all its possible types can be substituted for the other type.
 */
private fun UnionType.isSubstitutableFor(other: Type): Boolean {
    return this.possibleTypes.all { it.isSubstitutableFor(other) }
}

private fun VariadicType.isSubstitutableFor(other: Type): Boolean {
    return when (other) {
        is ClassType -> other.smlClass.qualifiedNameOrNull() == StdlibClasses.Any
        is VariadicType -> this.elementType.isSubstitutableFor(other)
        else -> false
    }
}

/**
 * Returns the elementType of a [VariadicType] or, otherwise, the type itself.
 */
private fun unwrapVariadicType(type: Type): Type {
    return when (type) {
        is VariadicType -> type.elementType
        else -> type
    }
}

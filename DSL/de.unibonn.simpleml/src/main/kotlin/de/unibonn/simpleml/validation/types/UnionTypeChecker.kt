package de.unibonn.simpleml.validation.types

import de.unibonn.simpleml.emf.typeArgumentsOrEmpty
import de.unibonn.simpleml.simpleML.SmlUnionType
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class UnionTypeChecker : AbstractSimpleMLChecker() {

    @Check
    fun numberOfTypeArguments(smlUnionType: SmlUnionType) {
        when (smlUnionType.typeArgumentsOrEmpty().size) {
            0 -> {
                error(
                    "A union type must have least one type argument.",
                    null,
                    ErrorCode.UNION_TYPE_WITHOUT_TYPE_ARGUMENTS
                )
            }
            1 -> {
                info(
                    "A union type with one type argument is equivalent to the the type argument itself.",
                    null,
                    InfoCode.UnnecessaryUnionType
                )
            }
        }
    }
}

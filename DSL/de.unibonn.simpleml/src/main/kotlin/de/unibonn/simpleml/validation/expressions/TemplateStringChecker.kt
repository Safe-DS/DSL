package de.unibonn.simpleml.validation.expressions

import de.unibonn.simpleml.simpleML.SmlAbstractTemplateStringPart
import de.unibonn.simpleml.simpleML.SmlTemplateString
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class TemplateStringChecker : AbstractSimpleMLChecker() {

    @Check
    fun missingTemplateExpression(smlTemplateString: SmlTemplateString) {
        smlTemplateString.expressions
            .windowed(size = 2, step = 1)
            .forEach { (first, second) ->
                if (first is SmlAbstractTemplateStringPart && second is SmlAbstractTemplateStringPart) {
                    error(
                        "There must be a template expression between two template string parts.",
                        second,
                        null,
                        ErrorCode.MissingTemplateExpression
                    )
                }
            }
    }
}

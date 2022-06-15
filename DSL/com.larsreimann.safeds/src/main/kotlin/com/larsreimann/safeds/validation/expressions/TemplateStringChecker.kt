package com.larsreimann.safeds.validation.expressions

import com.larsreimann.safeds.safeDS.SdsAbstractTemplateStringPart
import com.larsreimann.safeds.safeDS.SdsTemplateString
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class TemplateStringChecker : AbstractSafeDSChecker() {

    @Check
    fun missingTemplateExpression(sdsTemplateString: SdsTemplateString) {
        sdsTemplateString.expressions
            .windowed(size = 2, step = 1)
            .forEach { (first, second) ->
                if (first is SdsAbstractTemplateStringPart && second is SdsAbstractTemplateStringPart) {
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

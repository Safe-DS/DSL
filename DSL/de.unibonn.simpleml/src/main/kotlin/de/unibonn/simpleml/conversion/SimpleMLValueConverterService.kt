@file:Suppress("FunctionName")

package de.unibonn.simpleml.conversion

import com.google.inject.Inject
import com.google.inject.Singleton
import org.eclipse.xtext.conversion.IValueConverter
import org.eclipse.xtext.conversion.ValueConverter
import org.eclipse.xtext.conversion.impl.AbstractDeclarativeValueConverterService
import org.eclipse.xtext.conversion.impl.IDValueConverter
import org.eclipse.xtext.conversion.impl.INTValueConverter
import org.eclipse.xtext.conversion.impl.QualifiedNameValueConverter
import org.eclipse.xtext.conversion.impl.STRINGValueConverter

/**
 * Converters for ID, INT, and STRING.
 */
@Singleton
open class SimpleMLValueConverterService : AbstractDeclarativeValueConverterService() {

    @Inject
    private lateinit var idValueConverter: IDValueConverter

    @ValueConverter(rule = "ID")
    fun ID() = idValueConverter

    @Inject
    private lateinit var intValueConverter: INTValueConverter

    @ValueConverter(rule = "INT")
    fun INT(): IValueConverter<Int?> {
        return intValueConverter
    }

    @Inject
    private lateinit var stringValueConverter: STRINGValueConverter

    @ValueConverter(rule = "STRING")
    fun STRING() = stringValueConverter

    @Inject
    private lateinit var templateStringStartValueConverter: SimpleMLTEMPLATE_STRING_STARTValueConverter

    @ValueConverter(rule = "TEMPLATE_STRING_START")
    fun TEMPLATE_STRING_START() = templateStringStartValueConverter

    @Inject
    private lateinit var templateStringInnerValueConverter: SimpleMLTEMPLATE_STRING_INNERValueConverter

    @ValueConverter(rule = "TEMPLATE_STRING_INNER")
    fun TEMPLATE_STRING_INNER() = templateStringInnerValueConverter

    @Inject
    private lateinit var templateStringEndValueConverter: SimpleMLTEMPLATE_STRING_ENDValueConverter

    @ValueConverter(rule = "TEMPLATE_STRING_END")
    fun TEMPLATE_STRING_END() = templateStringEndValueConverter

    @Inject
    private lateinit var qualifiedNameValueConverter: QualifiedNameValueConverter

    @ValueConverter(rule = "QualifiedName")
    fun QualifiedName() = qualifiedNameValueConverter

    @ValueConverter(rule = "QualifiedNameWithWildcard")
    fun QualifiedNameWithWildcard() = qualifiedNameValueConverter
}

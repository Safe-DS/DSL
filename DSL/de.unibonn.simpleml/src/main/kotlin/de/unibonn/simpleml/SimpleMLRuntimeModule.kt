package de.unibonn.simpleml

import com.google.inject.Binder
import com.google.inject.name.Names
import de.unibonn.simpleml.conversion.SimpleMLIDValueConverter
import de.unibonn.simpleml.conversion.SimpleMLQualifiedNameValueConverter
import de.unibonn.simpleml.conversion.SimpleMLSTRINGValueConverter
import de.unibonn.simpleml.conversion.SimpleMLValueConverterService
import de.unibonn.simpleml.naming.QualifiedNameProviderInjectionTarget
import de.unibonn.simpleml.scoping.IndexExtensionsInjectionTarget
import de.unibonn.simpleml.scoping.SimpleMLImportedNamespaceAwareLocalScopeProvider
import de.unibonn.simpleml.scoping.SimpleMLResourceDescriptionStrategy
import de.unibonn.simpleml.serializer.SerializerExtensionsInjectionTarget
import de.unibonn.simpleml.serializer.SimpleMLCrossReferenceSerializer
import de.unibonn.simpleml.serializer.SimpleMLHiddenTokenSequencer
import de.unibonn.simpleml.services.SimpleMLGrammarAccess
import org.eclipse.xtext.IGrammarAccess
import org.eclipse.xtext.conversion.IValueConverterService
import org.eclipse.xtext.conversion.impl.IDValueConverter
import org.eclipse.xtext.conversion.impl.QualifiedNameValueConverter
import org.eclipse.xtext.conversion.impl.STRINGValueConverter
import org.eclipse.xtext.resource.IDefaultResourceDescriptionStrategy
import org.eclipse.xtext.scoping.IScopeProvider
import org.eclipse.xtext.scoping.impl.AbstractDeclarativeScopeProvider
import org.eclipse.xtext.serializer.sequencer.IHiddenTokenSequencer
import org.eclipse.xtext.serializer.tokens.ICrossReferenceSerializer

/**
 * Use this class to register components to be used at runtime / without the Equinox extension registry.
 */
@Suppress("unused")
open class SimpleMLRuntimeModule : AbstractSimpleMLRuntimeModule() {
    fun bindICrossReferenceSerializer(): Class<out ICrossReferenceSerializer> {
        return SimpleMLCrossReferenceSerializer::class.java
    }

    fun bindIDefaultResourceDescriptionStrategy(): Class<out IDefaultResourceDescriptionStrategy> {
        return SimpleMLResourceDescriptionStrategy::class.java
    }

    override fun bindIGrammarAccess(): Class<out IGrammarAccess> {
        return SimpleMLGrammarAccess::class.java
    }

    fun bindIHiddenTokenSequencer(): Class<out IHiddenTokenSequencer> {
        return SimpleMLHiddenTokenSequencer::class.java
    }

    override fun bindIValueConverterService(): Class<out IValueConverterService> {
        return SimpleMLValueConverterService::class.java
    }

    fun bindIDValueConverter(): Class<out IDValueConverter> {
        return SimpleMLIDValueConverter::class.java
    }

    fun bindSTRINGValueConverter(): Class<out STRINGValueConverter> {
        return SimpleMLSTRINGValueConverter::class.java
    }

    fun bindQualifiedNameValueConverter(): Class<out QualifiedNameValueConverter> {
        return SimpleMLQualifiedNameValueConverter::class.java
    }

    override fun configureIScopeProviderDelegate(binder: Binder) {
        binder.bind(IScopeProvider::class.java)
            .annotatedWith(Names.named(AbstractDeclarativeScopeProvider.NAMED_DELEGATE))
            .to(SimpleMLImportedNamespaceAwareLocalScopeProvider::class.java)
    }

    override fun configure(binder: Binder) {
        binder.requestStaticInjection(IndexExtensionsInjectionTarget::class.java)
        binder.requestStaticInjection(SerializerExtensionsInjectionTarget::class.java)
        binder.requestStaticInjection(QualifiedNameProviderInjectionTarget::class.java)

        super.configure(binder)
    }
}

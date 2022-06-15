package com.larsreimann.safeds

import com.google.inject.Binder
import com.google.inject.name.Names
import com.larsreimann.safeds.conversion.SafeDSIDValueConverter
import com.larsreimann.safeds.conversion.SafeDSQualifiedNameValueConverter
import com.larsreimann.safeds.conversion.SafeDSSTRINGValueConverter
import com.larsreimann.safeds.conversion.SafeDSValueConverterService
import com.larsreimann.safeds.naming.QualifiedNameProviderInjectionTarget
import com.larsreimann.safeds.scoping.IndexExtensionsInjectionTarget
import com.larsreimann.safeds.scoping.SafeDSImportedNamespaceAwareLocalScopeProvider
import com.larsreimann.safeds.scoping.SafeDSResourceDescriptionStrategy
import com.larsreimann.safeds.serializer.SerializerExtensionsInjectionTarget
import com.larsreimann.safeds.serializer.SafeDSCrossReferenceSerializer
import com.larsreimann.safeds.serializer.SafeDSHiddenTokenSequencer
import com.larsreimann.safeds.services.SafeDSGrammarAccess
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
open class SafeDSRuntimeModule : AbstractSafeDSRuntimeModule() {
    fun bindICrossReferenceSerializer(): Class<out ICrossReferenceSerializer> {
        return SafeDSCrossReferenceSerializer::class.java
    }

    fun bindIDefaultResourceDescriptionStrategy(): Class<out IDefaultResourceDescriptionStrategy> {
        return SafeDSResourceDescriptionStrategy::class.java
    }

    override fun bindIGrammarAccess(): Class<out IGrammarAccess> {
        return SafeDSGrammarAccess::class.java
    }

    fun bindIHiddenTokenSequencer(): Class<out IHiddenTokenSequencer> {
        return SafeDSHiddenTokenSequencer::class.java
    }

    override fun bindIValueConverterService(): Class<out IValueConverterService> {
        return SafeDSValueConverterService::class.java
    }

    fun bindIDValueConverter(): Class<out IDValueConverter> {
        return SafeDSIDValueConverter::class.java
    }

    fun bindSTRINGValueConverter(): Class<out STRINGValueConverter> {
        return SafeDSSTRINGValueConverter::class.java
    }

    fun bindQualifiedNameValueConverter(): Class<out QualifiedNameValueConverter> {
        return SafeDSQualifiedNameValueConverter::class.java
    }

    override fun configureIScopeProviderDelegate(binder: Binder) {
        binder.bind(IScopeProvider::class.java)
            .annotatedWith(Names.named(AbstractDeclarativeScopeProvider.NAMED_DELEGATE))
            .to(SafeDSImportedNamespaceAwareLocalScopeProvider::class.java)
    }

    override fun configure(binder: Binder) {
        binder.requestStaticInjection(IndexExtensionsInjectionTarget::class.java)
        binder.requestStaticInjection(SerializerExtensionsInjectionTarget::class.java)
        binder.requestStaticInjection(QualifiedNameProviderInjectionTarget::class.java)

        super.configure(binder)
    }
}

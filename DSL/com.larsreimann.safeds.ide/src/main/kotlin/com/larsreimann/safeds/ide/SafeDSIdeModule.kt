package com.larsreimann.safeds.ide

import com.larsreimann.safeds.ide.editor.contentassist.SafeDSIdeContentProposalProvider
import com.larsreimann.safeds.ide.server.codelens.SafeDSCodeLensProvider
import com.larsreimann.safeds.ide.server.commands.SafeDSExecutableCommandService
import com.larsreimann.safeds.ide.server.hover.SafeDSHoverService
import com.larsreimann.safeds.ide.server.symbol.SafeDSDocumentSymbolDeprecationInfoProvider
import com.larsreimann.safeds.ide.server.symbol.SafeDSDocumentSymbolDetailsProvider
import com.larsreimann.safeds.ide.server.symbol.SafeDSDocumentSymbolKindProvider
import com.larsreimann.safeds.ide.server.symbol.SafeDSDocumentSymbolNameProvider
import org.eclipse.xtext.ide.editor.contentassist.IdeContentProposalProvider
import org.eclipse.xtext.ide.server.codelens.ICodeLensResolver
import org.eclipse.xtext.ide.server.codelens.ICodeLensService
import org.eclipse.xtext.ide.server.commands.IExecutableCommandService
import org.eclipse.xtext.ide.server.hover.HoverService
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper

/**
 * Use this class to register IDE components.
 */
class SafeDSIdeModule : AbstractSafeDSIdeModule() {
    fun bindICodeLensResolver(): Class<out ICodeLensResolver> {
        return SafeDSCodeLensProvider::class.java
    }

    fun bindICodeLensService(): Class<out ICodeLensService> {
        return SafeDSCodeLensProvider::class.java
    }

    fun bindIExecutableCommandService(): Class<out IExecutableCommandService> {
        return SafeDSExecutableCommandService::class.java
    }

    fun bindDocumentSymbolDeprecationInfoProvider(): Class<out DocumentSymbolMapper.DocumentSymbolDeprecationInfoProvider> {
        return SafeDSDocumentSymbolDeprecationInfoProvider::class.java
    }

    fun bindDocumentSymbolDetailsProvider(): Class<out DocumentSymbolMapper.DocumentSymbolDetailsProvider> {
        return SafeDSDocumentSymbolDetailsProvider::class.java
    }

    fun bindDocumentSymbolKindProvider(): Class<out DocumentSymbolMapper.DocumentSymbolKindProvider> {
        return SafeDSDocumentSymbolKindProvider::class.java
    }

    fun bindDocumentSymbolNameProvider(): Class<out DocumentSymbolMapper.DocumentSymbolNameProvider> {
        return SafeDSDocumentSymbolNameProvider::class.java
    }

    fun bindIdeContentProposalProvider(): Class<out IdeContentProposalProvider> {
        return SafeDSIdeContentProposalProvider::class.java
    }

    fun bindHoverService(): Class<out HoverService> {
        return SafeDSHoverService::class.java
    }
}

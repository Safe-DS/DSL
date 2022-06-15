package com.larsreimann.safeds.ide

import com.larsreimann.safeds.ide.editor.contentassist.SimpleMLIdeContentProposalProvider
import com.larsreimann.safeds.ide.server.codelens.SimpleMLCodeLensProvider
import com.larsreimann.safeds.ide.server.commands.SimpleMLExecutableCommandService
import com.larsreimann.safeds.ide.server.hover.SimpleMLHoverService
import com.larsreimann.safeds.ide.server.symbol.SimpleMLDocumentSymbolDeprecationInfoProvider
import com.larsreimann.safeds.ide.server.symbol.SimpleMLDocumentSymbolDetailsProvider
import com.larsreimann.safeds.ide.server.symbol.SimpleMLDocumentSymbolKindProvider
import com.larsreimann.safeds.ide.server.symbol.SimpleMLDocumentSymbolNameProvider
import org.eclipse.xtext.ide.editor.contentassist.IdeContentProposalProvider
import org.eclipse.xtext.ide.server.codelens.ICodeLensResolver
import org.eclipse.xtext.ide.server.codelens.ICodeLensService
import org.eclipse.xtext.ide.server.commands.IExecutableCommandService
import org.eclipse.xtext.ide.server.hover.HoverService
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper

/**
 * Use this class to register IDE components.
 */
class SafeSDIdeModule : AbstractSafeDSIdeModule() {
    fun bindICodeLensResolver(): Class<out ICodeLensResolver> {
        return SimpleMLCodeLensProvider::class.java
    }

    fun bindICodeLensService(): Class<out ICodeLensService> {
        return SimpleMLCodeLensProvider::class.java
    }

    fun bindIExecutableCommandService(): Class<out IExecutableCommandService> {
        return SimpleMLExecutableCommandService::class.java
    }

    fun bindDocumentSymbolDeprecationInfoProvider(): Class<out DocumentSymbolMapper.DocumentSymbolDeprecationInfoProvider> {
        return SimpleMLDocumentSymbolDeprecationInfoProvider::class.java
    }

    fun bindDocumentSymbolDetailsProvider(): Class<out DocumentSymbolMapper.DocumentSymbolDetailsProvider> {
        return SimpleMLDocumentSymbolDetailsProvider::class.java
    }

    fun bindDocumentSymbolKindProvider(): Class<out DocumentSymbolMapper.DocumentSymbolKindProvider> {
        return SimpleMLDocumentSymbolKindProvider::class.java
    }

    fun bindDocumentSymbolNameProvider(): Class<out DocumentSymbolMapper.DocumentSymbolNameProvider> {
        return SimpleMLDocumentSymbolNameProvider::class.java
    }

    fun bindIdeContentProposalProvider(): Class<out IdeContentProposalProvider> {
        return SimpleMLIdeContentProposalProvider::class.java
    }

    fun bindHoverService(): Class<out HoverService> {
        return SimpleMLHoverService::class.java
    }
}

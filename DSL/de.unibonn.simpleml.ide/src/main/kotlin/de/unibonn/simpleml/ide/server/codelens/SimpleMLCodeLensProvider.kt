package de.unibonn.simpleml.ide.server.codelens

import com.google.inject.Inject
import org.eclipse.lsp4j.CodeLens
import org.eclipse.lsp4j.CodeLensParams
import org.eclipse.xtext.ide.server.Document
import org.eclipse.xtext.ide.server.codelens.ICodeLensResolver
import org.eclipse.xtext.ide.server.codelens.ICodeLensService
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.service.OperationCanceledManager
import org.eclipse.xtext.util.CancelIndicator

class SimpleMLCodeLensProvider : ICodeLensResolver, ICodeLensService {

    @Inject
    private lateinit var operationCanceledManager: OperationCanceledManager

    @Inject
    private lateinit var rangeProvider: DocumentSymbolMapper.DocumentSymbolRangeProvider

    override fun computeCodeLenses(
        document: Document,
        resource: XtextResource,
        params: CodeLensParams,
        indicator: CancelIndicator
    ): List<CodeLens> {
        return emptyList()
    }

    override fun resolveCodeLens(
        document: Document,
        resource: XtextResource,
        codeLens: CodeLens,
        indicator: CancelIndicator
    ): CodeLens {
        return codeLens
    }
}

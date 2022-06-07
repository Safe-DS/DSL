package de.unibonn.simpleml.ide.server.symbol

import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper

class SimpleMLDocumentSymbolDetailsProvider : DocumentSymbolMapper.DocumentSymbolDetailsProvider() {
    override fun getDetails(obj: EObject?): String {
        return ""
    }
}

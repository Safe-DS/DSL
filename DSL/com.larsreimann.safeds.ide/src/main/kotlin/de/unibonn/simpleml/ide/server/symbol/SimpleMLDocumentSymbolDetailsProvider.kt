package com.larsreimann.safeds.ide.server.symbol

import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper

class SafeSDDocumentSymbolDetailsProvider : DocumentSymbolMapper.DocumentSymbolDetailsProvider() {
    override fun getDetails(obj: EObject?): String {
        return ""
    }
}

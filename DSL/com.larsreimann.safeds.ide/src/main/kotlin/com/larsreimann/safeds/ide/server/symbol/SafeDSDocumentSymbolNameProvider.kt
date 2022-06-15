package com.larsreimann.safeds.ide.server.symbol

import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper
import org.eclipse.xtext.resource.IEObjectDescription

class SafeDSDocumentSymbolNameProvider : DocumentSymbolMapper.DocumentSymbolNameProvider() {
    override fun getName(obj: EObject): String? {
        return (obj as? SdsAbstractDeclaration)?.name
    }

    override fun getName(description: IEObjectDescription): String? {
        return getName(description.eObjectOrProxy)
    }
}

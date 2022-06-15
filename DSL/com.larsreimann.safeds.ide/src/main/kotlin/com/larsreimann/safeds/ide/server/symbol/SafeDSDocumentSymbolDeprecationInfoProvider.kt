package com.larsreimann.safeds.ide.server.symbol

import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.stdlibAccess.isDeprecated
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper
import org.eclipse.xtext.resource.IEObjectDescription

class SafeDSDocumentSymbolDeprecationInfoProvider : DocumentSymbolMapper.DocumentSymbolDeprecationInfoProvider() {

    override fun isDeprecated(obj: EObject): Boolean {
        if (obj !is SdsAbstractDeclaration) {
            return false
        }

        return obj.isDeprecated()
    }

    override fun isDeprecated(description: IEObjectDescription): Boolean {
        return isDeprecated(description.eObjectOrProxy)
    }
}

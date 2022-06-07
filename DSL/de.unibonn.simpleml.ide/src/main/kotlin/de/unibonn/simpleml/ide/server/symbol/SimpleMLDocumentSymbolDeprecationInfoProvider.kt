package de.unibonn.simpleml.ide.server.symbol

import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import de.unibonn.simpleml.stdlibAccess.isDeprecated
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper
import org.eclipse.xtext.resource.IEObjectDescription

class SimpleMLDocumentSymbolDeprecationInfoProvider : DocumentSymbolMapper.DocumentSymbolDeprecationInfoProvider() {

    override fun isDeprecated(obj: EObject): Boolean {
        if (obj !is SmlAbstractDeclaration) {
            return false
        }

        return obj.isDeprecated()
    }

    override fun isDeprecated(description: IEObjectDescription): Boolean {
        return isDeprecated(description.eObjectOrProxy)
    }
}

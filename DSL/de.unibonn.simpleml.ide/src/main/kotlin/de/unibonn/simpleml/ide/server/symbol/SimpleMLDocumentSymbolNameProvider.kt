package de.unibonn.simpleml.ide.server.symbol

import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper
import org.eclipse.xtext.resource.IEObjectDescription

class SimpleMLDocumentSymbolNameProvider : DocumentSymbolMapper.DocumentSymbolNameProvider() {
    override fun getName(obj: EObject): String? {
        return (obj as? SmlAbstractDeclaration)?.name
    }

    override fun getName(description: IEObjectDescription): String? {
        return getName(description.eObjectOrProxy)
    }
}

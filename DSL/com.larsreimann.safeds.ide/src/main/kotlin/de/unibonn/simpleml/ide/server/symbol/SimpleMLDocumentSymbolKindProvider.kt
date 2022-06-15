package com.larsreimann.safeds.ide.server.symbol

import de.unibonn.simpleml.emf.isClassMember
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsFunction
import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.EObject
import org.eclipse.lsp4j.SymbolKind
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper
import org.eclipse.xtext.resource.IEObjectDescription

class SafeSDDocumentSymbolKindProvider : DocumentSymbolMapper.DocumentSymbolKindProvider() {
    override fun getSymbolKind(obj: EObject?): SymbolKind? {
        if (obj is SmlFunction && obj.isClassMember()) {
            return SymbolKind.Method
        }

        return obj?.let { getSymbolKind(it.eClass()) }
    }

    override fun getSymbolKind(description: IEObjectDescription?): SymbolKind? {
        return getSymbolKind(description?.eObjectOrProxy)
    }

    override fun getSymbolKind(clazz: EClass): SymbolKind? {
        return when (clazz) {
            Literals.SML_ANNOTATION -> SymbolKind.Interface // Not ideal but matches @interface in Java
            Literals.SML_ATTRIBUTE -> SymbolKind.Field
            Literals.SML_CLASS -> SymbolKind.Class
            Literals.SML_COMPILATION_UNIT -> SymbolKind.Package
            Literals.SML_ENUM -> SymbolKind.Enum
            Literals.SML_ENUM_VARIANT -> SymbolKind.EnumMember
            Literals.SML_FUNCTION -> SymbolKind.Function
            Literals.SML_STEP -> SymbolKind.Function
            Literals.SML_WORKFLOW -> SymbolKind.Function
            else -> null
        }
    }
}

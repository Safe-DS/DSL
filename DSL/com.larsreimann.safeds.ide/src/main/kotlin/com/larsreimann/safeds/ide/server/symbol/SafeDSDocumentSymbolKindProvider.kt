package com.larsreimann.safeds.ide.server.symbol

import com.larsreimann.safeds.emf.isClassMember
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsFunction
import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.EObject
import org.eclipse.lsp4j.SymbolKind
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper
import org.eclipse.xtext.resource.IEObjectDescription

class SafeDSDocumentSymbolKindProvider : DocumentSymbolMapper.DocumentSymbolKindProvider() {
    override fun getSymbolKind(obj: EObject?): SymbolKind? {
        if (obj is SdsFunction && obj.isClassMember()) {
            return SymbolKind.Method
        }

        return obj?.let { getSymbolKind(it.eClass()) }
    }

    override fun getSymbolKind(description: IEObjectDescription?): SymbolKind? {
        return getSymbolKind(description?.eObjectOrProxy)
    }

    override fun getSymbolKind(clazz: EClass): SymbolKind? {
        return when (clazz) {
            Literals.SDS_ANNOTATION -> SymbolKind.Interface // Not ideal but matches @interface in Java
            Literals.SDS_ATTRIBUTE -> SymbolKind.Field
            Literals.SDS_CLASS -> SymbolKind.Class
            Literals.SDS_COMPILATION_UNIT -> SymbolKind.Package
            Literals.SDS_ENUM -> SymbolKind.Enum
            Literals.SDS_ENUM_VARIANT -> SymbolKind.EnumMember
            Literals.SDS_FUNCTION -> SymbolKind.Function
            Literals.SDS_PIPELINE -> SymbolKind.Function
            Literals.SDS_STEP -> SymbolKind.Function
            else -> null
        }
    }
}

package com.larsreimann.safeds.serializer

import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.CrossReference
import org.eclipse.xtext.nodemodel.INode
import org.eclipse.xtext.scoping.IScope
import org.eclipse.xtext.serializer.diagnostic.ISerializationDiagnostic
import org.eclipse.xtext.serializer.tokens.CrossReferenceSerializer

class SafeDSCrossReferenceSerializer : CrossReferenceSerializer() {

    override fun getCrossReferenceNameFromScope(
        semanticObject: EObject,
        crossref: CrossReference,
        target: EObject,
        scope: IScope,
        errors: ISerializationDiagnostic.Acceptor?
    ): String {
        return when (target) {
            is SdsAbstractDeclaration -> target.name
            else -> super.getCrossReferenceNameFromScope(semanticObject, crossref, target, scope, errors)
        }
    }

    override fun isValid(
        semanticObject: EObject,
        crossref: CrossReference,
        target: EObject,
        node: INode,
        errors: ISerializationDiagnostic.Acceptor?
    ): Boolean {
        return target is SdsAbstractDeclaration
    }
}

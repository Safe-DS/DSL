package de.unibonn.simpleml.serializer

import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.CrossReference
import org.eclipse.xtext.nodemodel.INode
import org.eclipse.xtext.scoping.IScope
import org.eclipse.xtext.serializer.diagnostic.ISerializationDiagnostic
import org.eclipse.xtext.serializer.tokens.CrossReferenceSerializer

class SimpleMLCrossReferenceSerializer : CrossReferenceSerializer() {

    override fun getCrossReferenceNameFromScope(
        semanticObject: EObject,
        crossref: CrossReference,
        target: EObject,
        scope: IScope,
        errors: ISerializationDiagnostic.Acceptor?
    ): String {
        return when (target) {
            is SmlAbstractDeclaration -> target.name
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
        return target is SmlAbstractDeclaration
    }
}

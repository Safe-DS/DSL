package de.unibonn.simpleml.scoping

import de.unibonn.simpleml.constant.SmlVisibility
import de.unibonn.simpleml.constant.visibility
import de.unibonn.simpleml.simpleML.SmlAnnotation
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.simpleML.SmlTypeParameter
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.resource.IEObjectDescription
import org.eclipse.xtext.resource.impl.DefaultResourceDescriptionStrategy
import org.eclipse.xtext.util.IAcceptor

/**
 * Describes which objects are exported to other resources.
 */
class SimpleMLResourceDescriptionStrategy : DefaultResourceDescriptionStrategy() {
    override fun createEObjectDescriptions(eObject: EObject, acceptor: IAcceptor<IEObjectDescription>): Boolean {
        return when (eObject) {
            is SmlCompilationUnit -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SmlAnnotation -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SmlAttribute -> {
                super.createEObjectDescriptions(eObject, acceptor)
                false
            }
            is SmlClass -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SmlEnum -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SmlEnumVariant -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SmlFunction -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SmlParameter -> {
                super.createEObjectDescriptions(eObject, acceptor)
                false
            }
            is SmlTypeParameter -> {
                super.createEObjectDescriptions(eObject, acceptor)
                false
            }
            is SmlStep -> {
                if (eObject.visibility() != SmlVisibility.Private) {
                    super.createEObjectDescriptions(eObject, acceptor)
                } else {
                    false
                }
            }
            else -> {
                false
            }
        }
    }
}

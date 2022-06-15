package com.larsreimann.safeds.scoping

import de.unibonn.simpleml.constant.SmlVisibility
import de.unibonn.simpleml.constant.visibility
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.resource.IEObjectDescription
import org.eclipse.xtext.resource.impl.DefaultResourceDescriptionStrategy
import org.eclipse.xtext.util.IAcceptor

/**
 * Describes which objects are exported to other resources.
 */
class SafeSDResourceDescriptionStrategy : DefaultResourceDescriptionStrategy() {
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
            is SmlPredicate -> {
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

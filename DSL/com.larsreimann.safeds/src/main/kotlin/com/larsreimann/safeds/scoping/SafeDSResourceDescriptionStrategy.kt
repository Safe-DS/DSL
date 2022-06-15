package com.larsreimann.safeds.scoping

import com.larsreimann.safeds.constant.SdsVisibility
import com.larsreimann.safeds.constant.visibility
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
class SafeDSResourceDescriptionStrategy : DefaultResourceDescriptionStrategy() {
    override fun createEObjectDescriptions(eObject: EObject, acceptor: IAcceptor<IEObjectDescription>): Boolean {
        return when (eObject) {
            is SdsCompilationUnit -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SdsAnnotation -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SdsAttribute -> {
                super.createEObjectDescriptions(eObject, acceptor)
                false
            }
            is SdsClass -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SdsEnum -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SdsEnumVariant -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SdsFunction -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SdsPredicate -> {
                super.createEObjectDescriptions(eObject, acceptor)
            }
            is SdsParameter -> {
                super.createEObjectDescriptions(eObject, acceptor)
                false
            }
            is SdsTypeParameter -> {
                super.createEObjectDescriptions(eObject, acceptor)
                false
            }
            is SdsStep -> {
                if (eObject.visibility() != SdsVisibility.Private) {
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

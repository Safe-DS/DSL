package com.larsreimann.safeds.ide.server.hover

import com.google.inject.Inject
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.documentation.IEObjectDocumentationProvider
import org.eclipse.xtext.ide.labels.INameLabelProvider
import org.eclipse.xtext.ide.server.hover.HoverService

class SafeDSHoverService @Inject constructor(
    private val documentationProvider: IEObjectDocumentationProvider,
    private val nameLabelProvider: INameLabelProvider
) : HoverService() {

    override fun getContents(obj: EObject): String {
        val documentation = documentationProvider.getDocumentation(obj)
        return if (documentation == null) {
            getFirstLine(obj)
        } else {
            "${getFirstLine(obj)}  \n$documentation"
        }
    }

    private fun getFirstLine(obj: EObject): String {
        val label = nameLabelProvider.getNameLabel(obj)
        return if (label == null) {
            obj.eClass().name
        } else {
            "${obj.eClass().name} **$label**"
        }
    }
}

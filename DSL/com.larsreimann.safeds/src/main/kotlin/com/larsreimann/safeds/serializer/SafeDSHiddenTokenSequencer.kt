package com.larsreimann.safeds.serializer

import com.google.inject.Inject
import com.larsreimann.safeds.services.SimpleMLGrammarAccess
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.RuleCall
import org.eclipse.xtext.nodemodel.ICompositeNode
import org.eclipse.xtext.serializer.sequencer.HiddenTokenSequencer

@Suppress("unused")
class SafeSDHiddenTokenSequencer @Inject constructor(
        private val grammarAccess: SimpleMLGrammarAccess
) : HiddenTokenSequencer() {

    override fun enterAssignedParserRuleCall(rc: RuleCall, semanticChild: EObject, node: ICompositeNode?): Boolean {
        semanticChild.eAdapters()
                .filterIsInstance<CommentAdapter>()
                .forEach {
                    val rule = when (it) {
                        is SingleLineCommentAdapter -> grammarAccess.sL_COMMENTRule
                        is MultiLineCommentAdapter -> grammarAccess.mL_COMMENTRule
                    }
                    delegate.acceptComment(rule, it.toString(), null)
                }
        return super.enterAssignedParserRuleCall(rc, semanticChild, node)
    }
}

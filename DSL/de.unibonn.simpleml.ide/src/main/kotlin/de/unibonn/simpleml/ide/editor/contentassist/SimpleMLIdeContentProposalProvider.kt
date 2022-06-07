package de.unibonn.simpleml.ide.editor.contentassist

import com.google.inject.Inject
import de.unibonn.simpleml.services.SimpleMLGrammarAccess
import de.unibonn.simpleml.simpleML.SmlArgumentList
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.staticAnalysis.linking.parametersOrNull
import org.eclipse.xtext.Assignment
import org.eclipse.xtext.Keyword
import org.eclipse.xtext.RuleCall
import org.eclipse.xtext.ide.editor.contentassist.ContentAssistContext
import org.eclipse.xtext.ide.editor.contentassist.IIdeContentProposalAcceptor
import org.eclipse.xtext.ide.editor.contentassist.IdeContentProposalProvider
import org.eclipse.xtext.scoping.IScopeProvider

class SimpleMLIdeContentProposalProvider @Inject constructor(
    private val grammarAccess: SimpleMLGrammarAccess,
    private val scopeProvider2: IScopeProvider
) : IdeContentProposalProvider() {

    private val crossReferencePriority = 500
    private val snippetPriority = 450
    private val defaultPriority = 400

    override fun _createProposals(
        ruleCall: RuleCall,
        context: ContentAssistContext,
        acceptor: IIdeContentProposalAcceptor
    ) {
        val rule = ruleCall.rule
        val model = context.currentModel

        println("Auto-completion rule: $rule")
        println("Auto-completion model: $model")

        when {
            model is SmlCompilationUnit -> {
                completeGlobalSnippets(context, acceptor)
            }
            model is SmlArgumentList && rule == grammarAccess.smlCallArgumentRule -> {
                completeSmlCallArguments(model, context, acceptor)
            }
        }
    }

    override fun _createProposals(
        assignment: Assignment,
        context: ContentAssistContext,
        acceptor: IIdeContentProposalAcceptor
    ) {
        println("Auto-completion assignment: $assignment")

        // Intentionally left blank so assignments don't get suggested
    }

    override fun _createProposals(
        keyword: Keyword,
        context: ContentAssistContext,
        acceptor: IIdeContentProposalAcceptor
    ) {
        println("Auto-completion keyword: $keyword")

        // Intentionally left blank so keywords don't get suggested
    }

    private fun completeGlobalSnippets(
        context: ContentAssistContext,
        acceptor: IIdeContentProposalAcceptor
    ) {
        val workflow = """
            |workflow ${'$'}{1:name} {
            |    ${'$'}{2:body}
            |}
        """.trimMargin()

        acceptor.accept(proposalCreator.createSnippet(workflow, "workflow", context), snippetPriority)
    }

    private fun completeSmlCallArguments(
        model: SmlArgumentList,
        context: ContentAssistContext,
        acceptor: IIdeContentProposalAcceptor
    ) {
        val usedParameters = model.arguments.map { it.parameter }.toSet()
        model.parametersOrNull()
            ?.filter { it !in usedParameters && !it.isVariadic }
            ?.forEach {
                acceptor.accept(proposalCreator.createProposal("${it.name} = ", context), crossReferencePriority)
            }
    }
}

package de.unibonn.simpleml.ide.server.commands

import com.google.inject.Inject
import org.eclipse.lsp4j.ExecuteCommandParams
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.commands.IExecutableCommandService
import org.eclipse.xtext.service.OperationCanceledManager
import org.eclipse.xtext.util.CancelIndicator

class SimpleMLExecutableCommandService : IExecutableCommandService {

    @Inject
    private lateinit var operationCanceledManager: OperationCanceledManager

    override fun initialize(): List<String> {
        return emptyList()
    }

    override fun execute(
        params: ExecuteCommandParams,
        access: ILanguageServerAccess,
        cancelIndicator: CancelIndicator
    ): Any {

        return when (params.command) {
            CommandId.RemoveOnceOtherCommandsAreAdded.toString() -> {}
            else -> {
                throw IllegalArgumentException("Unknown command '${params.command}'.")
            }
        }
    }
}

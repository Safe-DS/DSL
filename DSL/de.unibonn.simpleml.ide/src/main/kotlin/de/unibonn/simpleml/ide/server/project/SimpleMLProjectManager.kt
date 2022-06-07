package de.unibonn.simpleml.ide.server.project

import de.unibonn.simpleml.stdlibAccess.listStdlibFiles
import org.eclipse.xtext.build.IncrementalBuilder
import org.eclipse.xtext.ide.server.ProjectManager
import org.eclipse.xtext.util.CancelIndicator

class SimpleMLProjectManager : ProjectManager() {

    override fun doInitialBuild(cancelIndicator: CancelIndicator): IncrementalBuilder.Result {

        // Load Stdlib first to prevent errors when it is edited in VS Code (`simple.lang` would be overridden)
        val uris = listStdlibFiles().map { it.second }.toMutableList()
        uris += projectConfig.sourceFolders
            .flatMap { srcFolder -> srcFolder.getAllResources(fileSystemScanner) }

        return doBuild(uris, emptyList(), emptyList(), cancelIndicator)
    }
}

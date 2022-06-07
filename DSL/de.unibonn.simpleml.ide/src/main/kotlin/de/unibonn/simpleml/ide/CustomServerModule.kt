package de.unibonn.simpleml.ide

import de.unibonn.simpleml.ide.server.project.SimpleMLProjectManager
import org.eclipse.xtext.ide.server.ProjectManager
import org.eclipse.xtext.ide.server.ServerModule

class CustomServerModule : ServerModule() {
    override fun configure() {
        super.configure()
        bind(ProjectManager::class.java).to(SimpleMLProjectManager::class.java)
    }
}

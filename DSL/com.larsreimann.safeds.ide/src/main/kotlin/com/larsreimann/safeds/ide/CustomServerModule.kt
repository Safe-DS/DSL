package com.larsreimann.safeds.ide

import com.larsreimann.safeds.ide.server.project.SafeDSProjectManager
import org.eclipse.xtext.ide.server.ProjectManager
import org.eclipse.xtext.ide.server.ServerModule

class CustomServerModule : ServerModule() {
    override fun configure() {
        super.configure()
        bind(ProjectManager::class.java).to(SafeDSProjectManager::class.java)
    }
}

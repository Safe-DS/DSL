package de.unibonn.simpleml.ide

import org.eclipse.xtext.ide.server.ServerLauncher

class ServerLauncher2 {
    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            ServerLauncher.launch(ServerLauncher2::class.java.name, args, CustomServerModule())
        }
    }
}

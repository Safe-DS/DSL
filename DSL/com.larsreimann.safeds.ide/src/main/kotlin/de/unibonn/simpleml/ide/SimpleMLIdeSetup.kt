package com.larsreimann.safeds.ide

import com.google.inject.Guice
import com.google.inject.Injector
import de.unibonn.simpleml.SimpleMLRuntimeModule
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import org.eclipse.xtext.util.Modules2

/**
 * Initialization support for running Xtext languages as language servers.
 */
class SafeSDIdeSetup : SimpleMLStandaloneSetup() {
    override fun createInjector(): Injector? {
        return Guice.createInjector(Modules2.mixin(SimpleMLRuntimeModule(), SimpleMLIdeModule()))
    }
}

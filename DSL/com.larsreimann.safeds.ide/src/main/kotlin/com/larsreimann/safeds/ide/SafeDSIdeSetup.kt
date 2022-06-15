package com.larsreimann.safeds.ide

import com.google.inject.Guice
import com.google.inject.Injector
import com.larsreimann.safeds.SimpleMLRuntimeModule
import com.larsreimann.safeds.SimpleMLStandaloneSetup
import org.eclipse.xtext.util.Modules2

/**
 * Initialization support for running Xtext languages as language servers.
 */
class SafeSDIdeSetup : SimpleMLStandaloneSetup() {
    override fun createInjector(): Injector? {
        return Guice.createInjector(Modules2.mixin(SimpleMLRuntimeModule(), SimpleMLIdeModule()))
    }
}

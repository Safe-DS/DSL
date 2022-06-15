package com.larsreimann.safeds.ide

import com.google.inject.Guice
import com.google.inject.Injector
import com.larsreimann.safeds.SafeDSRuntimeModule
import com.larsreimann.safeds.SafeDSStandaloneSetup
import org.eclipse.xtext.util.Modules2

/**
 * Initialization support for running Xtext languages as language servers.
 */
class SafeDSIdeSetup : SafeDSStandaloneSetup() {
    override fun createInjector(): Injector? {
        return Guice.createInjector(Modules2.mixin(SafeDSRuntimeModule(), SafeDSIdeModule()))
    }
}

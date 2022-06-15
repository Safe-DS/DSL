package com.larsreimann.safeds

import com.google.inject.Injector
import com.larsreimann.safeds.safeDS.SafeDSPackage
import org.eclipse.emf.ecore.EPackage

/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
@Suppress("unused")
open class SafeDSStandaloneSetup : SafeDSStandaloneSetupGenerated() {

    override fun register(injector: Injector) {
        EPackage.Registry.INSTANCE.putIfAbsent(SafeDSPackage.eNS_URI, SafeDSPackage.eINSTANCE)
        super.register(injector)
    }

    companion object {
        fun doSetup() {
            SafeDSStandaloneSetup().createInjectorAndDoEMFRegistration()
        }
    }
}

package de.unibonn.simpleml

import com.google.inject.Injector
import de.unibonn.simpleml.simpleML.SimpleMLPackage
import org.eclipse.emf.ecore.EPackage

/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
@Suppress("unused")
open class SimpleMLStandaloneSetup : SimpleMLStandaloneSetupGenerated() {

    override fun register(injector: Injector) {
        EPackage.Registry.INSTANCE.putIfAbsent(SimpleMLPackage.eNS_URI, SimpleMLPackage.eINSTANCE)
        super.register(injector)
    }

    companion object {
        fun doSetup() {
            SimpleMLStandaloneSetup().createInjectorAndDoEMFRegistration()
        }
    }
}

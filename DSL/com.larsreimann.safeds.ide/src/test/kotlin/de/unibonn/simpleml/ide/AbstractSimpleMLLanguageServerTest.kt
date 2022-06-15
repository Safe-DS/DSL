package com.larsreimann.safeds.ide

import de.unibonn.simpleml.constant.SmlFileExtension
import org.eclipse.lsp4j.InitializeParams
import org.eclipse.lsp4j.InitializeResult
import org.eclipse.xtext.testing.AbstractLanguageServerTest
import org.eclipse.xtext.xbase.lib.Procedures.Procedure1
import java.lang.IllegalStateException

abstract class AbstractSimpleMLLanguageServerTest : AbstractLanguageServerTest(SmlFileExtension.Test.extension) {

    /**
     * This override is necessary since `LanguageServerImpl` throws if it is initialized twice.
     */
    override fun initialize(initializer: Procedure1<in InitializeParams?>?): InitializeResult? {
        return try {
            this.initialize(initializer, true)
        } catch (e: IllegalStateException) {
            null
        }
    }
}

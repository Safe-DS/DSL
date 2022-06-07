@file:Suppress("MemberVisibilityCanBePrivate")

package de.unibonn.simpleml.stdlibAccess

import org.eclipse.xtext.naming.QualifiedName

/**
 * Important packages in the standard library.
 */
object StdlibPackages {

    /**
     * Core package that is implicitly imported into all Simple-ML programs.
     */
    val lang: QualifiedName = QualifiedName.create("simpleml", "lang")
}

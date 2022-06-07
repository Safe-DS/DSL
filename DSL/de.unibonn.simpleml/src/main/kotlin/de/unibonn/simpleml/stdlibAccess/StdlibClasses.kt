@file:Suppress("MemberVisibilityCanBePrivate")

package de.unibonn.simpleml.stdlibAccess

import org.eclipse.xtext.naming.QualifiedName

/**
 * Important classes in the standard library.
 */
object StdlibClasses {
    val Any: QualifiedName = StdlibPackages.lang.append("Any")
    val Boolean: QualifiedName = StdlibPackages.lang.append("Boolean")
    val Number: QualifiedName = StdlibPackages.lang.append("Number")
    val Float: QualifiedName = StdlibPackages.lang.append("Float")
    val Int: QualifiedName = StdlibPackages.lang.append("Int")
    val Nothing: QualifiedName = StdlibPackages.lang.append("Nothing")
    val String: QualifiedName = StdlibPackages.lang.append("String")
}

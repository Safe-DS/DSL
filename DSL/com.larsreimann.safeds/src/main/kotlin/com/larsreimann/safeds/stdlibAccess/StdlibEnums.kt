@file:Suppress("MemberVisibilityCanBePrivate")

package com.larsreimann.safeds.stdlibAccess

import org.eclipse.xtext.naming.QualifiedName

/**
 * Important enums in the standard library.
 */
object StdlibEnums {

    /**
     * Describes declaration types that can be targeted by annotations.
     */
    enum class AnnotationTarget {
        Annotation,
        Attribute,
        Class,
        CompilationUnit,
        Enum,
        EnumVariant,
        Function,
        Parameter,
        Pipeline,
        Result,
        Step,
        TypeParameter,

        ;

        companion object {
            val enum: QualifiedName = QualifiedName.create("safeds", "lang", "AnnotationTarget")

            fun valueOfOrNull(name: String): AnnotationTarget? {
                return values().firstOrNull { it.name == name }
            }
        }
    }
}

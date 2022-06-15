package com.larsreimann.safeds.staticAnalysis.classHierarchy

import de.unibonn.simpleml.emf.classMembersOrEmpty
import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.emf.parentTypesOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsFunction
import de.unibonn.simpleml.staticAnalysis.typing.ClassType
import de.unibonn.simpleml.staticAnalysis.typing.type
import de.unibonn.simpleml.stdlibAccess.StdlibClasses
import de.unibonn.simpleml.stdlibAccess.getStdlibClassOrNull
import de.unibonn.simpleml.utils.uniqueOrNull

fun SmlClass.isSubtypeOf(other: SmlClass) =
    this == this.getStdlibClassOrNull(StdlibClasses.Nothing) ||
        this == other || other in superClasses()

fun SmlClass.superClasses() = sequence<SmlClass> {
    val visited = mutableSetOf<SmlClass>()

    // TODO: multiple parent classes
    var current = parentClassOrNull()
    while (current != null && current !in visited) {
        yield(current)
        visited += current
        current = current.parentClassOrNull()
    }

    val anyClass = this@superClasses.getStdlibClassOrNull(StdlibClasses.Any)
    if (anyClass != null && this@superClasses != anyClass && visited.lastOrNull() != anyClass) {
        yield(anyClass)
    }
}

fun SmlClass.superClassMembers() =
    this.superClasses().flatMap { it.classMembersOrEmpty().asSequence() }

// TODO only static methods can be hidden
fun SmlFunction.hiddenFunction(): SmlFunction? {
    val containingClassOrInterface = closestAncestorOrNull<SmlClass>() ?: return null
    return containingClassOrInterface.superClassMembers()
        .filterIsInstance<SmlFunction>()
        .firstOrNull { it.name == name }
}

fun SmlClass?.inheritedNonStaticMembersOrEmpty(): Set<SmlAbstractDeclaration> {
    return this?.parentClassesOrEmpty()
        ?.flatMap { it.classMembersOrEmpty() }
        ?.filter { it is SmlAttribute && !it.isStatic || it is SmlFunction && !it.isStatic }
        ?.toSet()
        .orEmpty()
}

fun SmlClass?.parentClassesOrEmpty(): List<SmlClass> {
    return this.parentTypesOrEmpty().mapNotNull {
        (it.type() as? ClassType)?.smlClass
    }
}

fun SmlClass?.parentClassOrNull(): SmlClass? {
    return this.parentClassesOrEmpty().uniqueOrNull()
}

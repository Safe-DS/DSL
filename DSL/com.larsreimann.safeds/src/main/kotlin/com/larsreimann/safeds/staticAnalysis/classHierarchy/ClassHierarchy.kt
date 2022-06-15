package com.larsreimann.safeds.staticAnalysis.classHierarchy

import com.larsreimann.safeds.emf.classMembersOrEmpty
import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.parentTypesOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.stdlibAccess.getStdlibClassOrNull
import com.larsreimann.safeds.utils.uniqueOrNull

fun SdsClass.isSubtypeOf(other: SdsClass) =
    this == this.getStdlibClassOrNull(StdlibClasses.Nothing) ||
        this == other || other in superClasses()

fun SdsClass.superClasses() = sequence<SdsClass> {
    val visited = mutableSetOf<SdsClass>()

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

fun SdsClass.superClassMembers() =
    this.superClasses().flatMap { it.classMembersOrEmpty().asSequence() }

// TODO only static methods can be hidden
fun SdsFunction.hiddenFunction(): SdsFunction? {
    val containingClassOrInterface = closestAncestorOrNull<SdsClass>() ?: return null
    return containingClassOrInterface.superClassMembers()
        .filterIsInstance<SdsFunction>()
        .firstOrNull { it.name == name }
}

fun SdsClass?.inheritedNonStaticMembersOrEmpty(): Set<SdsAbstractDeclaration> {
    return this?.parentClassesOrEmpty()
        ?.flatMap { it.classMembersOrEmpty() }
        ?.filter { it is SdsAttribute && !it.isStatic || it is SdsFunction && !it.isStatic }
        ?.toSet()
        .orEmpty()
}

fun SdsClass?.parentClassesOrEmpty(): List<SdsClass> {
    return this.parentTypesOrEmpty().mapNotNull {
        (it.type() as? ClassType)?.sdsClass
    }
}

fun SdsClass?.parentClassOrNull(): SdsClass? {
    return this.parentClassesOrEmpty().uniqueOrNull()
}

package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.classMembersOrEmpty
import com.larsreimann.safeds.emf.objectsInBodyOrEmpty
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.parentTypesOrEmpty
import com.larsreimann.safeds.emf.protocolsOrEmpty
import com.larsreimann.safeds.emf.typeParametersOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.staticAnalysis.classHierarchy.inheritedNonStaticMembersOrEmpty
import com.larsreimann.safeds.staticAnalysis.classHierarchy.isSubtypeOf
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.UnresolvedType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class ClassChecker : AbstractSafeDSChecker() {

    @Check
    fun acyclicSuperTypes(smlClass: SdsClass) {
        smlClass.parentTypesOrEmpty()
            .filter {
                val resolvedClass = (it.type() as? ClassType)?.smlClass
                resolvedClass != null && resolvedClass.isSubtypeOf(smlClass)
            }
            .forEach {
                error(
                    "A class must not directly or indirectly be a subtype of itself.",
                    it,
                    null,
                    ErrorCode.CLASS_MUST_NOT_BE_SUBTYPE_OF_ITSELF
                )
            }
    }

    @Check
    fun body(smlClass: SdsClass) {
        if (smlClass.body != null && smlClass.objectsInBodyOrEmpty().isEmpty()) {
            info(
                "Unnecessary class body.",
                Literals.SDS_CLASS__BODY,
                InfoCode.UnnecessaryBody
            )
        }
    }

    @Check
    fun mustInheritOnlyClasses(smlClass: SdsClass) {
        smlClass.parentTypesOrEmpty()
            .filterNot {
                val type = it.type()
                type is ClassType || type is UnresolvedType
            }
            .forEach {
                error(
                    "A class must only inherit classes.",
                    it,
                    null,
                    ErrorCode.CLASS_MUST_INHERIT_ONLY_CLASSES
                )
            }
    }

    @Check
    fun mustHaveUniqueInheritedMembers(smlClass: SdsClass) {
        smlClass.inheritedNonStaticMembersOrEmpty()
            .groupBy { it.name }
            .forEach { (name, declarationsWithName) ->
                if (declarationsWithName.size > 1) {
                    error(
                        "Inherits multiple members called '$name'.",
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.CLASS_MUST_HAVE_UNIQUE_INHERITED_MEMBERS
                    )
                }
            }
    }

    @Check
    fun uniqueNames(smlClass: SdsClass) {
        smlClass.parametersOrEmpty()
            .reportDuplicateNames { "A parameter with name '${it.name}' exists already in this class." }

        smlClass.classMembersOrEmpty()
            .reportDuplicateNames { "A declaration with name '${it.name}' exists already in this class." }
    }

    @Check
    fun uniqueParentTypes(smlClass: SdsClass) {
        smlClass.parentTypesOrEmpty()
            .duplicatesBy { (it.type() as? ClassType)?.smlClass }
            .forEach {
                error(
                    "Parent types must be unique.",
                    it,
                    null,
                    ErrorCode.CLASS_MUST_HAVE_UNIQUE_PARENT_TYPES
                )
            }
    }

    @Check
    fun unnecessaryTypeParameterList(smlClass: SdsClass) {
        if (smlClass.typeParameterList != null && smlClass.typeParametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary type parameter list.",
                Literals.SDS_CLASS__TYPE_PARAMETER_LIST,
                InfoCode.UnnecessaryTypeParameterList
            )
        }
    }

    @Check
    fun multipleProtocols(smlClass: SdsClass) {
        val protocols = smlClass.protocolsOrEmpty()
        if (protocols.size > 1) {
            protocols.forEach {
                error(
                    "A class must have only one protocol.",
                    it,
                    null,
                    ErrorCode.OneProtocolPerClass
                )
            }
        }
    }
}

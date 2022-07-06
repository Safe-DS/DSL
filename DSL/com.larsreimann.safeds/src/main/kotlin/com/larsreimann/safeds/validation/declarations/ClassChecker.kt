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
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class ClassChecker : AbstractSafeDSChecker() {

    @Check
    fun acyclicSuperTypes(sdsClass: SdsClass) {
        sdsClass.parentTypesOrEmpty()
            .filter {
                val resolvedClass = (it.type() as? ClassType)?.sdsClass
                resolvedClass != null && resolvedClass.isSubtypeOf(sdsClass)
            }
            .forEach {
                error(
                    "A class must not directly or indirectly be a subtype of itself.",
                    it,
                    null,
                    ErrorCode.CLASS_MUST_NOT_BE_SUBTYPE_OF_ITSELF,
                )
            }
    }

    @Check
    fun body(sdsClass: SdsClass) {
        if (sdsClass.body != null && sdsClass.objectsInBodyOrEmpty().isEmpty()) {
            info(
                "Unnecessary class body.",
                Literals.SDS_CLASS__BODY,
                InfoCode.UnnecessaryBody,
            )
        }
    }

    @Check
    fun mustInheritOnlyClasses(sdsClass: SdsClass) {
        sdsClass.parentTypesOrEmpty()
            .filterNot {
                val type = it.type()
                type is ClassType || type is UnresolvedType
            }
            .forEach {
                error(
                    "A class must only inherit classes.",
                    it,
                    null,
                    ErrorCode.CLASS_MUST_INHERIT_ONLY_CLASSES,
                )
            }
    }

    @Check
    fun mustHaveUniqueInheritedMembers(sdsClass: SdsClass) {
        sdsClass.inheritedNonStaticMembersOrEmpty()
            .groupBy { it.name }
            .forEach { (name, declarationsWithName) ->
                if (declarationsWithName.size > 1) {
                    error(
                        "Inherits multiple members called '$name'.",
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.CLASS_MUST_HAVE_UNIQUE_INHERITED_MEMBERS,
                    )
                }
            }
    }

    @Check
    fun uniqueNames(sdsClass: SdsClass) {
        sdsClass.parametersOrEmpty()
            .reportDuplicateNames { "A parameter with name '${it.name}' exists already in this class." }

        sdsClass.classMembersOrEmpty()
            .reportDuplicateNames { "A declaration with name '${it.name}' exists already in this class." }
    }

    @Check
    fun uniqueParentTypes(sdsClass: SdsClass) {
        sdsClass.parentTypesOrEmpty()
            .duplicatesBy { (it.type() as? ClassType)?.sdsClass }
            .forEach {
                error(
                    "Parent types must be unique.",
                    it,
                    null,
                    ErrorCode.CLASS_MUST_HAVE_UNIQUE_PARENT_TYPES,
                )
            }
    }

    @Check
    fun unnecessaryTypeParameterList(sdsClass: SdsClass) {
        if (sdsClass.typeParameterList != null && sdsClass.typeParametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary type parameter list.",
                Literals.SDS_CLASS__TYPE_PARAMETER_LIST,
                InfoCode.UnnecessaryTypeParameterList,
            )
        }
    }

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun multipleProtocols(sdsClass: SdsClass) {
        val protocols = sdsClass.protocolsOrEmpty()
        if (protocols.size > 1) {
            protocols.forEach {
                error(
                    "A class must have only one protocol.",
                    it,
                    null,
                    ErrorCode.OneProtocolPerClass,
                )
            }
        }
    }
}

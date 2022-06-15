package com.larsreimann.safeds.validation.typeChecking

import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SafeDSPackage
import com.larsreimann.safeds.safeDS.SdsIndexedAccess
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.UnresolvedType
import com.larsreimann.safeds.staticAnalysis.typing.VariadicType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class IndexedAccessTypeChecker : AbstractSafeDSChecker() {

    @Check(CheckType.NORMAL)
    fun receiverMustBeVariadic(smlIndexedAccess: SdsIndexedAccess) {
        val receiverType = smlIndexedAccess.receiver.type()
        if (receiverType is UnresolvedType) {
            return // Scoping error already shown
        }

        if (receiverType !is VariadicType) {
            error(
                "The receiver of an indexed access must refer to a variadic parameter.",
                SafeDSPackage.Literals.SDS_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                ErrorCode.WrongType
            )
        }
    }

    @Check
    fun indexMustBeInt(smlIndexedAccess: SdsIndexedAccess) {
        val indexType = smlIndexedAccess.index.type()
        if (indexType is UnresolvedType) {
            return
        }

        val hasWrongType = indexType !is ClassType ||
            indexType.isNullable ||
            indexType.smlClass.qualifiedNameOrNull() != StdlibClasses.Int

        if (hasWrongType) {
            error(
                "The index of an indexed access must be an instance of the class 'Int'.",
                SafeDSPackage.Literals.SDS_INDEXED_ACCESS__INDEX,
                ErrorCode.WrongType
            )
        }
    }
}

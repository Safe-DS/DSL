package com.larsreimann.safeds.formatting2

import com.larsreimann.safeds.emf.annotationCallsOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_ABSTRACT_DECLARATION__NAME
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_ANNOTATION_CALL__ANNOTATION
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_ARGUMENT__PARAMETER
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_IMPORT_ALIAS__NAME
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_IMPORT__IMPORTED_NAMESPACE
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_INFIX_OPERATION__OPERATOR
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_MEMBER_ACCESS__NULL_SAFE
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_NAMED_TYPE__DECLARATION
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_NAMED_TYPE__NULLABLE
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_PREFIX_OPERATION__OPERATOR
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_PROTOCOL_QUANTIFIED_TERM__QUANTIFIER
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_STEP__VISIBILITY
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_TYPE_ARGUMENT__TYPE_PARAMETER
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_TYPE_PARAMETER_CONSTRAINT_GOAL__LEFT_OPERAND
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_TYPE_PARAMETER_CONSTRAINT_GOAL__OPERATOR
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_TYPE_PARAMETER__KIND
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_TYPE_PARAMETER__VARIANCE
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_TYPE_PROJECTION__VARIANCE
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals.SDS_YIELD__RESULT
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAbstractTemplateStringPart
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsArgumentList
import com.larsreimann.safeds.safeDS.SdsAssigneeList
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsAssignmentGoal
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsBlock
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsCallableType
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsClassBody
import com.larsreimann.safeds.safeDS.SdsColumn
import com.larsreimann.safeds.safeDS.SdsColumnList
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsConstraint
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumBody
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionGoal
import com.larsreimann.safeds.safeDS.SdsExpressionLambda
import com.larsreimann.safeds.safeDS.SdsExpressionStatement
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsFunctionBody
import com.larsreimann.safeds.safeDS.SdsGoalArgument
import com.larsreimann.safeds.safeDS.SdsGoalArgumentList
import com.larsreimann.safeds.safeDS.SdsGoalCall
import com.larsreimann.safeds.safeDS.SdsGoalList
import com.larsreimann.safeds.safeDS.SdsGoalPlaceholder
import com.larsreimann.safeds.safeDS.SdsImport
import com.larsreimann.safeds.safeDS.SdsImportAlias
import com.larsreimann.safeds.safeDS.SdsIndexedAccess
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsMemberType
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParameterList
import com.larsreimann.safeds.safeDS.SdsParentTypeList
import com.larsreimann.safeds.safeDS.SdsParenthesizedExpression
import com.larsreimann.safeds.safeDS.SdsParenthesizedGoalExpression
import com.larsreimann.safeds.safeDS.SdsParenthesizedType
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsPrefixOperation
import com.larsreimann.safeds.safeDS.SdsProtocol
import com.larsreimann.safeds.safeDS.SdsProtocolAlternative
import com.larsreimann.safeds.safeDS.SdsProtocolBody
import com.larsreimann.safeds.safeDS.SdsProtocolComplement
import com.larsreimann.safeds.safeDS.SdsProtocolParenthesizedTerm
import com.larsreimann.safeds.safeDS.SdsProtocolQuantifiedTerm
import com.larsreimann.safeds.safeDS.SdsProtocolReferenceList
import com.larsreimann.safeds.safeDS.SdsProtocolSequence
import com.larsreimann.safeds.safeDS.SdsProtocolSubterm
import com.larsreimann.safeds.safeDS.SdsProtocolSubtermList
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsResultList
import com.larsreimann.safeds.safeDS.SdsSchema
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTemplateString
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeArgumentList
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsTypeParameterConstraintGoal
import com.larsreimann.safeds.safeDS.SdsTypeParameterList
import com.larsreimann.safeds.safeDS.SdsTypeProjection
import com.larsreimann.safeds.safeDS.SdsUnionType
import com.larsreimann.safeds.safeDS.SdsWorkflow
import com.larsreimann.safeds.safeDS.SdsYield
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.EStructuralFeature
import org.eclipse.xtext.TerminalRule
import org.eclipse.xtext.formatting2.AbstractFormatter2
import org.eclipse.xtext.formatting2.FormatterPreferenceKeys.indentation
import org.eclipse.xtext.formatting2.IFormattableDocument
import org.eclipse.xtext.formatting2.ITextReplacer
import org.eclipse.xtext.formatting2.ITextReplacerContext
import org.eclipse.xtext.formatting2.internal.AbstractTextReplacer
import org.eclipse.xtext.formatting2.internal.CommentReplacer
import org.eclipse.xtext.formatting2.internal.WhitespaceReplacer
import org.eclipse.xtext.formatting2.regionaccess.IComment
import org.eclipse.xtext.formatting2.regionaccess.ISemanticRegion
import org.eclipse.xtext.formatting2.regionaccess.ITextReplacement
import org.eclipse.xtext.preferences.MapBasedPreferenceValues
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.xbase.lib.Procedures
import kotlin.reflect.KFunction1
import org.eclipse.xtext.formatting2.IHiddenRegionFormatter as Format

class SafeDSFormatter : AbstractFormatter2() {

    private val indent = Format::indent
    private val noSpace = Format::noSpace
    private val oneSpace = Format::oneSpace
    private val newLine = Format::newLine

    @Suppress("SameParameterValue")
    private fun newLines(n: Int): Procedures.Procedure1<in Format> {
        return Procedures.Procedure1 { it.setNewLines(n) }
    }

    /**
     * We follow the rule here that an object never formats its preceding or following region. This is left to the
     * parent.
     */
    override fun format(obj: Any?, doc: IFormattableDocument) {
        if (obj == null) {
            return
        }

        when (obj) {
            is XtextResource -> {
                useSpacesForIndentation()
                _format(obj, doc)
            }

            is SdsCompilationUnit -> {
                // Feature "annotations"
                obj.annotationCallsOrEmpty().forEach {
                    doc.format(it)

                    if (obj.annotationCallsOrEmpty().last() == it) {
                        doc.append(it, newLines(2))
                    } else {
                        doc.append(it, newLine)
                    }
                }

                // Keyword "package"
                doc.formatKeyword(obj, "package", noSpace, oneSpace)

                // Feature "name"
                val name = obj.regionForFeature(SDS_ABSTRACT_DECLARATION__NAME)
                if (name != null) {
                    doc.addReplacer(WhitespaceCollapser(doc, name))

                    if (obj.imports.isNotEmpty() || obj.members.isNotEmpty()) {
                        doc.append(name, newLines(2))
                    } else {
                        doc.append(name, noSpace)
                    }
                }

                // Feature "imports"
                obj.imports.forEach {
                    doc.format(it)

                    if (obj.imports.last() == it && obj.members.isNotEmpty()) {
                        doc.append(it, newLines(2))
                    } else if (obj.imports.last() != it) {
                        doc.append(it, newLine)
                    } else {
                        doc.append(it, noSpace)
                    }
                }

                // Feature "members"
                obj.members.forEach {
                    doc.format(it)

                    if (obj.members.last() != it) {
                        doc.append(it, newLines(2))
                    } else {
                        doc.append(it, noSpace)
                    }
                }

                doc.append(obj, newLine)
            }

            /**********************************************************************************************************
             * Declarations
             **********************************************************************************************************/

            is SdsImport -> {
                // Keyword "import"
                doc.formatKeyword(obj, "import", noSpace, oneSpace)

                // Feature "importedNamespace"
                val importedNamespace = obj.regionForFeature(SDS_IMPORT__IMPORTED_NAMESPACE)
                if (importedNamespace != null) {
                    doc.addReplacer(WhitespaceCollapser(doc, importedNamespace))
                }

                // EObject "aliasDeclaration"
                doc.formatObject(obj.alias, oneSpace, noSpace)
            }
            is SdsImportAlias -> {
                // Keyword "as"
                doc.formatKeyword(obj, "as", null, oneSpace)

                // Feature "alias"
                doc.formatFeature(obj, SDS_IMPORT_ALIAS__NAME, null, noSpace)
            }
            is SdsAnnotation -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "annotation"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "annotation", null, oneSpace)
                } else {
                    doc.formatKeyword(obj, "annotation", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "constraint"
                doc.formatObject(obj.constraint, oneSpace, null)
            }
            is SdsAnnotationCall -> {
                // Keyword "@"
                doc.formatKeyword(obj, "@", null, noSpace)

                // Feature "annotation"
                doc.formatFeature(obj, SDS_ANNOTATION_CALL__ANNOTATION, noSpace, null)

                // EObject "argumentList"
                doc.formatObject(obj.argumentList, noSpace, null)
            }
            is SdsAttribute -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "static"
                if (obj.annotationCallsOrEmpty().isNotEmpty()) {
                    doc.formatKeyword(obj, "static", oneSpace, null)
                }

                // Keyword "attr"
                if (obj.annotationCallsOrEmpty().isEmpty() && !obj.isStatic) {
                    doc.formatKeyword(obj, "attr", null, oneSpace)
                } else {
                    doc.formatKeyword(obj, "attr", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, noSpace)

                // Keyword ":"
                doc.formatKeyword(obj, ":", noSpace, oneSpace)

                // EObject "type"
                doc.formatObject(obj.type, oneSpace, null)
            }
            is SdsClass -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "class"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "class", null, oneSpace)
                } else {
                    doc.formatKeyword(obj, "class", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)

                // EObject "typeParameterList"
                doc.formatObject(obj.typeParameterList, noSpace, null)

                // EObject "constructor"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "parentTypeList"
                doc.formatObject(obj.parentTypeList, oneSpace, null)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SdsParentTypeList -> {
                // Keyword "sub"
                doc.formatKeyword(obj, "sub", null, oneSpace)

                // Feature "parentTypes"
                obj.parentTypes.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)
            }
            is SdsClassBody -> {
                // Keyword "{"
                val openingBrace = obj.regionForKeyword("{")
                if (obj.members.isEmpty()) {
                    doc.append(openingBrace, noSpace)
                } else {
                    doc.append(openingBrace, newLine)
                }

                // Feature "members"
                obj.members.forEach {
                    doc.format(it)
                    if (obj.members.last() == it) {
                        doc.append(it, newLine)
                    } else {
                        doc.append(it, newLines(2))
                    }
                }

                // Keyword "}"
                val closingBrace = obj.regionForKeyword("}")
                doc.prepend(closingBrace, noSpace)

                doc.interior(openingBrace, closingBrace, indent)
            }
            is SdsEnum -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "enum"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "enum", null, oneSpace)
                } else {
                    doc.formatKeyword(obj, "enum", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SdsEnumBody -> {
                // Keyword "{"
                val openingBrace = obj.regionForKeyword("{")
                if (obj.variants.isEmpty()) {
                    doc.append(openingBrace, noSpace)
                } else {
                    doc.append(openingBrace, newLine)
                }

                // Feature "variants"
                obj.variants.forEach {
                    doc.format(it)
                    if (obj.variants.first() != it) {
                        doc.prepend(it, newLines(2))
                    }
                }

                // Keywords ","
                val commas = textRegionExtensions.allRegionsFor(obj).keywords(",")
                commas.forEach {
                    doc.prepend(it, noSpace)
                }

                // Keyword "}"
                val closingBrace = obj.regionForKeyword("}")
                if (obj.variants.isEmpty()) {
                    doc.prepend(closingBrace, noSpace)
                } else {
                    doc.prepend(closingBrace, newLine)
                }

                doc.interior(openingBrace, closingBrace, indent)
            }
            is SdsEnumVariant -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Feature "name"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME)
                } else {
                    doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
                }

                // EObject "typeParameterList"
                doc.formatObject(obj.typeParameterList, noSpace, null)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "constraint"
                doc.formatObject(obj.constraint, oneSpace, null)
            }
            is SdsFunction -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "static"
                if (obj.annotationCallsOrEmpty().isNotEmpty()) {
                    doc.formatKeyword(obj, "static", oneSpace, null)
                }

                // Keyword "fun"
                if (obj.annotationCallsOrEmpty().isEmpty() && !obj.isStatic) {
                    doc.formatKeyword(obj, "fun", null, oneSpace)
                } else {
                    doc.formatKeyword(obj, "fun", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)

                // EObject "typeParameterList"
                doc.formatObject(obj.typeParameterList, noSpace, null)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "resultList"
                doc.formatObject(obj.resultList, oneSpace, null)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SdsFunctionBody -> {
                // Keyword "{"
                val openingBrace = obj.regionForKeyword("{")
                if (obj.statements.isEmpty()) {
                    doc.append(openingBrace, noSpace)
                } else {
                    doc.append(openingBrace, newLine)
                }

                // Feature "statements"
                obj.statements.forEach {
                    doc.format(it)
                    if (obj.statements.last() == it) {
                        doc.append(it, newLine)
                    } else {
                        doc.append(it, newLines(2))
                    }
                }

                // Keyword "}"
                val closingBrace = obj.regionForKeyword("}")
                doc.prepend(closingBrace, noSpace)

                doc.interior(openingBrace, closingBrace, indent)
            }
            is SdsWorkflow -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "workflow"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "workflow", noSpace, oneSpace)
                } else {
                    doc.formatKeyword(obj, "workflow", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, null, oneSpace)

                // EObject "body"
                doc.formatObject(obj.body)
            }
            is SdsStep -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Feature "visibility"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatFeature(obj, SDS_STEP__VISIBILITY, noSpace, null)
                }

                // Keyword "step"
                if (obj.annotationCallsOrEmpty().isEmpty() && obj.visibility == null) {
                    doc.formatKeyword(obj, "step", noSpace, oneSpace)
                } else {
                    doc.formatKeyword(obj, "step", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, null, noSpace)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList)

                // EObject "resultList"
                doc.formatObject(obj.resultList)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SdsArgumentList -> {
                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // Feature "arguments"
                obj.arguments.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SdsArgument -> {
                // Feature "parameter"
                doc.formatFeature(obj, SDS_ARGUMENT__PARAMETER)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "value"
                doc.formatObject(obj.value)
            }
            is SdsParameterList -> {
                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // Feature "parameters"
                obj.parameters.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SdsParameter -> {
                // Features "annotations"
                doc.formatAnnotations(obj, inlineAnnotations = true)

                // Keyword "vararg"
                if (obj.annotationCallsOrEmpty().isNotEmpty()) {
                    doc.formatKeyword(obj, "vararg", oneSpace, null)
                }

                // Feature "name"
                val name = obj.regionForFeature(SDS_ABSTRACT_DECLARATION__NAME)
                if (obj.annotationCallsOrEmpty().isNotEmpty() || obj.isVariadic) {
                    doc.prepend(name, oneSpace)
                }

                // Keyword ":"
                doc.formatKeyword(obj, ":", noSpace, oneSpace)

                // EObject "type"
                doc.formatObject(obj.type)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "defaultValue"
                doc.formatObject(obj.defaultValue)
            }
            is SdsResultList -> {
                // Keyword "->"
                doc.formatKeyword(obj, "->", oneSpace, oneSpace)

                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // Feature "results"
                obj.results.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SdsResult -> {
                // Features "annotations"
                doc.formatAnnotations(obj, inlineAnnotations = true)

                // Feature "name"
                val name = obj.regionForFeature(SDS_ABSTRACT_DECLARATION__NAME)
                if (obj.annotationCallsOrEmpty().isNotEmpty()) {
                    doc.prepend(name, oneSpace)
                }

                // Keyword ":"
                doc.formatKeyword(obj, ":", noSpace, oneSpace)

                // EObject "type"
                doc.formatObject(obj.type)
            }

            /**********************************************************************************************************
             * Predicate
             **********************************************************************************************************/

            is SdsPredicate -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "predicate"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "predicate", noSpace, oneSpace)
                } else {
                    doc.formatKeyword(obj, "predicate", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, null, noSpace)

                // EObject "typeParameterList"
                doc.formatObject(obj.typeParameterList, noSpace, null)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "resultList"
                doc.formatObject(obj.resultList, oneSpace, null)

                // EObject "goalList"
                doc.formatObject(obj.goalList, oneSpace, null)
            }
            is SdsGoalList -> {
                // Keyword "{"
                val openingBrace = obj.regionForKeyword("{")
                if (obj.goals.isEmpty()) {
                    doc.append(openingBrace, noSpace)
                } else {
                    doc.append(openingBrace, newLine)
                }

                // Feature "goals"
                obj.goals.forEach {
                    doc.formatObject(it, null, noSpace)
                }

                // Keywords ","
                doc.formatKeyword(obj, ",", noSpace, newLine)

                // Keyword "}"
                val closingBrace = obj.regionForKeyword("}")
                if (obj.goals.isEmpty()) {
                    doc.prepend(closingBrace, noSpace)
                } else {
                    doc.prepend(closingBrace, newLine)
                }
                doc.interior(openingBrace, closingBrace, indent)
            }
            is SdsAssignmentGoal -> {
                // EObject "placeholder"
                doc.formatObject(obj.placeholder, null, oneSpace)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "expression"
                doc.formatObject(obj.expression)
            }
            is SdsGoalPlaceholder -> {
                // Keyword "val"
                doc.formatKeyword(obj, "val", null, oneSpace)

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
            }
            is SdsExpressionGoal -> {
                // EObject "expression"
                doc.formatObject(obj.expression)
            }
            is SdsGoalCall -> {
                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // EObject "argumentList"
                doc.formatObject(obj.argumentList, noSpace, noSpace)
            }
            is SdsGoalArgumentList -> {
                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // Feature "arguments"
                obj.arguments.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SdsGoalArgument -> {
                // Feature "parameter"
                doc.formatFeature(obj, SDS_ARGUMENT__PARAMETER)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "value"
                doc.formatObject(obj.value)
            }
            is SdsParenthesizedGoalExpression -> {
                // Keyword "("
                val openingParentheses = obj.regionForKeyword("(")
                if (obj.eContainer() !is SdsAssignmentGoal) {
                    doc.prepend(openingParentheses, newLine)
                }
                doc.append(openingParentheses, newLine)

                // Feature "expressions"
                obj.expressions.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatKeyword(obj, ",", noSpace, newLine)

                // Keyword ")"
                val closingParentheses = obj.regionForKeyword(")")
                doc.prepend(closingParentheses, newLine)
                doc.append(closingParentheses, noSpace)
                doc.interior(openingParentheses, closingParentheses, indent)
            }

            /**********************************************************************************************************
             * Protocols
             **********************************************************************************************************/

            is SdsProtocol -> {
                // Keyword "protocol"
                doc.formatKeyword(obj, "protocol", null, oneSpace)

                // EObject "body"
                doc.formatObject(obj.body)
            }
            is SdsProtocolBody -> {
                // Keyword "{"
                val openingBrace = obj.regionForKeyword("{")
                if (obj.subtermList == null && obj.term == null) {
                    doc.append(openingBrace, noSpace)
                } else {
                    doc.append(openingBrace, newLine)
                }

                // EObject "subtermList"
                if (obj.term == null) {
                    doc.formatObject(obj.subtermList, null, newLine)
                } else {
                    doc.format(obj.subtermList)
                    doc.append(obj.subtermList, newLines(2))
                }

                // EObject "term"
                doc.formatObject(obj.term, null, newLine)

                // Keyword "}"
                val closingBrace = obj.regionForKeyword("}")
                doc.prepend(closingBrace, noSpace)

                doc.interior(openingBrace, closingBrace, indent)
            }
            is SdsProtocolSubtermList -> {
                obj.subterms.forEach {
                    if (it === obj.subterms.last()) {
                        doc.formatObject(it, null, null)
                    } else {
                        doc.formatObject(it, null, newLine)
                    }
                }
            }
            is SdsProtocolSubterm -> {
                // Keyword "subterm"
                doc.formatKeyword(obj, "subterm", null, oneSpace)

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, oneSpace)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "term"
                doc.formatObject(obj.term, oneSpace, noSpace)

                // Keyword ";"
                doc.formatKeyword(obj, ";", noSpace, null)
            }
            is SdsProtocolAlternative -> {
                // Keywords '|'
                val pipes = textRegionExtensions.allRegionsFor(obj).keywords("|")
                pipes.forEach {
                    doc.prepend(it, oneSpace)
                    doc.append(it, oneSpace)
                }

                // EObject "terms"
                obj.terms.forEach {
                    doc.formatObject(it)
                }
            }
            is SdsProtocolComplement -> {
                // Keyword "["
                doc.formatKeyword(obj, "[", null, noSpace)

                // Keyword "^"
                doc.formatKeyword(obj, "^", noSpace, null)

                // EObject "referenceList"
                doc.formatObject(obj.referenceList, oneSpace, null)

                // Keyword "]"
                doc.formatKeyword(obj, "]", noSpace, null)
            }
            is SdsProtocolReferenceList -> {
                // EObject "terms"
                obj.references.forEach {
                    if (it == obj.references.last()) {
                        doc.formatObject(it)
                    } else {
                        doc.formatObject(it, null, oneSpace)
                    }
                }
            }
            is SdsProtocolParenthesizedTerm -> {
                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // EObject "term"
                doc.formatObject(obj.term, noSpace, noSpace)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SdsProtocolQuantifiedTerm -> {
                // EObject "term"
                doc.formatObject(obj.term)

                // Feature "quantifier"
                doc.formatFeature(obj, SDS_PROTOCOL_QUANTIFIED_TERM__QUANTIFIER, noSpace, null)
            }
            is SdsProtocolSequence -> {
                // EObject "terms"
                obj.terms.forEach {
                    if (it == obj.terms.last()) {
                        doc.formatObject(it)
                    } else {
                        doc.formatObject(it, null, oneSpace)
                    }
                }
            }

            /**********************************************************************************************************
             * Schema
             **********************************************************************************************************/

            is SdsSchema -> {
                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "schema"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "schema", noSpace, oneSpace)
                } else {
                    doc.formatKeyword(obj, "schema", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, null, oneSpace)

                // EObject "columnList"
                doc.formatObject(obj.columnList, oneSpace, null)
            }
            is SdsColumnList -> {
                // Keyword "{"
                val openingBrace = obj.regionForKeyword("{")
                if (obj.columns.isEmpty()) {
                    doc.append(openingBrace, noSpace)
                } else {
                    doc.append(openingBrace, newLine)
                }

                // Feature "columns"
                obj.columns.forEach {
                    doc.formatObject(it, newLine, noSpace)
                }

                // Keywords ","
                doc.formatKeyword(obj, ",", noSpace, newLine)

                // Keyword "}"
                val closingBrace = obj.regionForKeyword("}")
                if (obj.columns.isEmpty()) {
                    doc.prepend(closingBrace, noSpace)
                } else {
                    doc.prepend(closingBrace, newLine)
                }
                doc.interior(openingBrace, closingBrace, indent)
            }
            is SdsColumn -> {
                // EObject "columnName"
                doc.formatObject(obj.columnName, null, oneSpace)

                // Keyword ":"
                doc.formatKeyword(obj, ":", oneSpace, oneSpace)

                // EObject "columnType"
                doc.formatObject(obj.columnType)
            }

            /**********************************************************************************************************
             * Statements
             **********************************************************************************************************/

            is SdsBlock -> {
                // Keyword "{"
                val openingBrace = obj.regionForKeyword("{")
                if (obj.statements.isEmpty()) {
                    doc.append(openingBrace, noSpace)
                } else {
                    doc.append(openingBrace, newLine)
                }

                // Feature "statements"
                obj.statements.forEach {
                    doc.formatObject(it, null, newLine)
                }

                // Keyword "}"
                val closingBrace = obj.regionForKeyword("}")
                doc.prepend(closingBrace, noSpace)

                doc.interior(openingBrace, closingBrace, indent)
            }
            is SdsAssignment -> {
                // EObject "assigneeList"
                doc.formatObject(obj.assigneeList, null, oneSpace)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "expression"
                doc.formatObject(obj.expression)

                // Keyword ";"
                doc.formatKeyword(obj, ";", noSpace, null)
            }
            is SdsAssigneeList -> {
                // Feature "assignees"
                obj.assignees.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)
            }
            is SdsBlockLambdaResult -> {
                // Keyword "yield"
                doc.formatKeyword(obj, "yield", null, oneSpace)

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
            }
            is SdsPlaceholder -> {
                // Keyword "val"
                doc.formatKeyword(obj, "val", null, oneSpace)

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
            }
            is SdsYield -> {
                // Keyword "yield"
                doc.formatKeyword(obj, "yield", null, oneSpace)

                // Feature "result"
                doc.formatFeature(obj, SDS_YIELD__RESULT)
            }
            is SdsExpressionStatement -> {
                // EObject "expression"
                doc.formatObject(obj.expression)

                // Keyword ";"
                doc.formatKeyword(obj, ";", noSpace, null)
            }

            /**********************************************************************************************************
             * Expressions
             **********************************************************************************************************/

            is SdsBlockLambda -> {
                // EObject "parameterList"
                doc.formatObject(obj.parameterList, null, oneSpace)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SdsCall -> {
                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // EObject "typeArgumentList"
                doc.formatObject(obj.typeArgumentList, null, noSpace)

                // EObject "argumentList"
                doc.formatObject(obj.argumentList)
            }
            is SdsExpressionLambda -> {
                // EObject "parameterList"
                doc.formatObject(obj.parameterList, null, oneSpace)

                // Keyword "->"
                doc.formatKeyword(obj, "->", oneSpace, oneSpace)

                // EObject "result"
                doc.formatObject(obj.result, oneSpace, null)
            }
            is SdsIndexedAccess -> {
                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // Keyword "["
                doc.formatKeyword(obj, "[", noSpace, noSpace)

                // EObject "index"
                doc.formatObject(obj.index, noSpace, noSpace)

                // Keyword "]"
                doc.formatKeyword(obj, "]", noSpace, null)
            }
            is SdsInfixOperation -> {
                // EObject "leftOperand"
                doc.formatObject(obj.leftOperand, null, oneSpace)

                // Feature "operator"
                doc.formatFeature(obj, SDS_INFIX_OPERATION__OPERATOR, oneSpace, oneSpace)

                // EObject "rightOperand"
                doc.formatObject(obj.rightOperand, oneSpace, null)
            }
            is SdsMemberAccess -> {
                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // Feature "nullable"
                doc.formatFeature(obj, SDS_MEMBER_ACCESS__NULL_SAFE, noSpace, noSpace)

                // Keyword "."
                doc.formatKeyword(obj, ".", noSpace, noSpace)

                // EObject "member"
                doc.formatObject(obj.member, noSpace, null)
            }
            is SdsParenthesizedExpression -> {
                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // EObject "expression"
                doc.formatObject(obj.expression, noSpace, noSpace)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SdsPrefixOperation -> {
                // Feature "operator"
                doc.formatFeature(
                    obj,
                    SDS_PREFIX_OPERATION__OPERATOR,
                    prepend = null,
                    append = if (obj.operator == "not") oneSpace else noSpace,
                )

                // EObject "operand"
                doc.formatObject(obj.operand)
            }
            is SdsTemplateString -> {
                // Feature expressions
                obj.expressions.forEach {
                    if (it !is SdsAbstractTemplateStringPart) {
                        doc.formatObject(it, oneSpace, oneSpace)
                    }
                }
            }

            /**********************************************************************************************************
             * Types
             **********************************************************************************************************/

            is SdsCallableType -> {
                // Keyword "callable"
                doc.formatKeyword(obj, "callable", null, oneSpace)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, oneSpace, oneSpace)

                // EObject "resultList"
                doc.formatObject(obj.resultList, oneSpace, null)
            }
            is SdsMemberType -> {
                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // Keyword "."
                doc.formatKeyword(obj, ".", noSpace, noSpace)

                // EObject "member"
                doc.formatObject(obj.member, noSpace, null)
            }
            is SdsNamedType -> {
                // Feature "declaration"
                doc.formatFeature(obj, SDS_NAMED_TYPE__DECLARATION)

                // EObject "typeArgumentList"
                doc.formatObject(obj.typeArgumentList, noSpace, noSpace)

                // Feature "nullable"
                doc.formatFeature(obj, SDS_NAMED_TYPE__NULLABLE, noSpace, null)
            }
            is SdsParenthesizedType -> {
                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // EObject "type"
                doc.formatObject(obj.type, noSpace, noSpace)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SdsUnionType -> {
                // Keyword "union"
                doc.formatKeyword(obj, "union", null, noSpace)

                // EObject "typeArgumentList"
                doc.formatObject(obj.typeArgumentList, noSpace, null)
            }
            is SdsTypeArgumentList -> {
                // Keyword "<"
                doc.formatKeyword(obj, "<", null, noSpace)

                // Feature "typeArguments"
                obj.typeArguments.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)

                // Keyword ">"
                doc.formatKeyword(obj, ">", noSpace, null)
            }
            is SdsTypeArgument -> {
                // Feature "typeParameter"
                doc.formatFeature(obj, SDS_TYPE_ARGUMENT__TYPE_PARAMETER)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "value"
                doc.formatObject(obj.value)
            }
            is SdsTypeProjection -> {
                // Feature "variance"
                doc.formatFeature(obj, SDS_TYPE_PROJECTION__VARIANCE, null, oneSpace)

                // EObject "type"
                doc.formatObject(obj.type)
            }
            is SdsTypeParameterList -> {
                // Keyword "<"
                doc.formatKeyword(obj, "<", null, noSpace)

                // Feature "typeParameters"
                obj.typeParameters.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)

                // Keyword ">"
                doc.formatKeyword(obj, ">", noSpace, null)
            }
            is SdsTypeParameter -> {
                // Features "annotations"
                doc.formatAnnotations(obj, inlineAnnotations = true)

                // Feature "variance"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatFeature(obj, SDS_TYPE_PARAMETER__VARIANCE, null, oneSpace)
                } else {
                    doc.formatFeature(obj, SDS_TYPE_PARAMETER__VARIANCE, oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SDS_ABSTRACT_DECLARATION__NAME)

                // Feature "kind"
                doc.formatKeyword(obj, "::", oneSpace, oneSpace)
                doc.formatFeature(obj, SDS_TYPE_PARAMETER__KIND)
            }
            is SdsConstraint -> {
                // Keyword "constraint"
                doc.formatKeyword(obj, "constraint", null, oneSpace)

                // EObject "constraintList"
                doc.formatObject(obj.constraintList)
            }
            is SdsTypeParameterConstraintGoal -> {
                // Feature "leftOperand"
                doc.formatFeature(obj, SDS_TYPE_PARAMETER_CONSTRAINT_GOAL__LEFT_OPERAND, null, oneSpace)

                // Feature "operator"
                doc.formatFeature(obj, SDS_TYPE_PARAMETER_CONSTRAINT_GOAL__OPERATOR, oneSpace, oneSpace)

                // EObject "rightOperand"
                doc.formatObject(obj.rightOperand, oneSpace, null)
            }
        }
    }

    /**
     * Formats comments, including test markers. Without this override formatting a file with test markers throws an
     * exception in VS Code.
     */
    override fun createCommentReplacer(comment: IComment): ITextReplacer? {
        val grammarElement = comment.grammarElement
        if (grammarElement is TerminalRule && grammarElement.name == "TEST_MARKER") {
            return TestMarkerReplacer(comment)
        }

        return super.createCommentReplacer(comment)
    }

    /******************************************************************************************************************
     * Helpers
     ******************************************************************************************************************/

    private fun useSpacesForIndentation() {
        val newPreferences = mutableMapOf<String, String>()
        newPreferences[indentation.id] = "    "
        request.preferences = MapBasedPreferenceValues(preferences, newPreferences)
    }

    private fun EObject.regionForFeature(feature: EStructuralFeature): ISemanticRegion? {
        return textRegionExtensions.regionFor(this).feature(feature)
    }

    private fun EObject.regionForKeyword(keyword: String): ISemanticRegion? {
        return textRegionExtensions.regionFor(this).keyword(keyword)
    }

    private fun IFormattableDocument.formatObject(
        obj: EObject?,
        prepend: KFunction1<Format, Unit>? = null,
        append: KFunction1<Format, Unit>? = null,
    ) {
        if (obj != null) {
            if (prepend != null) {
                this.prepend(obj, prepend)
            }
            this.format(obj)
            if (append != null) {
                this.append(obj, append)
            }
        }
    }

    private fun IFormattableDocument.formatFeature(
        obj: EObject?,
        feature: EStructuralFeature,
        prepend: KFunction1<Format, Unit>? = null,
        append: KFunction1<Format, Unit>? = null,
    ) {
        if (obj == null) {
            return
        }

        val featureRegion = obj.regionForFeature(feature)
        if (featureRegion != null) {
            if (prepend != null) {
                this.prepend(featureRegion, prepend)
            }
            if (append != null) {
                this.append(featureRegion, append)
            }
        }
    }

    private fun IFormattableDocument.formatKeyword(
        obj: EObject?,
        keyword: String,
        prepend: KFunction1<Format, Unit>? = null,
        append: KFunction1<Format, Unit>? = null,
    ) {
        if (obj == null) {
            return
        }

        val keywordRegion = obj.regionForKeyword(keyword)
        if (keywordRegion != null) {
            if (prepend != null) {
                this.prepend(keywordRegion, prepend)
            }
            if (append != null) {
                this.append(keywordRegion, append)
            }
        }
    }

    private fun IFormattableDocument.formatAnnotations(
        obj: SdsAbstractDeclaration,
        inlineAnnotations: Boolean = false,
    ) {
        // Feature "annotations"
        obj.annotationCallsOrEmpty().forEach {
            format(it)

            if (inlineAnnotations) {
                append(it, oneSpace)
            } else {
                append(it, newLine)
            }
        }
    }

    private fun IFormattableDocument.formatCommas(obj: EObject) {
        val commas = textRegionExtensions.allRegionsFor(obj).keywords(",")
        commas.forEach {
            prepend(it, noSpace)
            append(it, oneSpace)
        }
    }
}

class TestMarkerReplacer(comment: IComment) : CommentReplacer(comment) {
    override fun createReplacements(context: ITextReplacerContext): ITextReplacerContext {
        return context
    }

    override fun configureWhitespace(leading: WhitespaceReplacer, trailing: WhitespaceReplacer) {
        if (comment.text == "»") {
            trailing.formatting.space = ""
        } else if (comment.text == "«") {
            leading.formatting.space = ""
        }
    }
}

class WhitespaceCollapser(doc: IFormattableDocument, name: ISemanticRegion?) : AbstractTextReplacer(doc, name) {
    override fun createReplacements(context: ITextReplacerContext): ITextReplacerContext {
        context.addReplacement(collapseWhitespace())
        return context
    }

    private fun collapseWhitespace(): ITextReplacement {
        return region.replaceWith(region.text.replace(Regex("\\s+"), ""))
    }
}

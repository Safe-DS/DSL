package de.unibonn.simpleml.formatting2

import de.unibonn.simpleml.emf.annotationCallsOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_ABSTRACT_DECLARATION__NAME
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_ANNOTATION_CALL__ANNOTATION
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_ARGUMENT__PARAMETER
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_IMPORT_ALIAS__NAME
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_IMPORT__IMPORTED_NAMESPACE
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_INFIX_OPERATION__OPERATOR
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_MEMBER_ACCESS__NULL_SAFE
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_NAMED_TYPE__DECLARATION
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_NAMED_TYPE__NULLABLE
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_PREFIX_OPERATION__OPERATOR
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_PROTOCOL_QUANTIFIED_TERM__QUANTIFIER
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_STEP__VISIBILITY
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_TYPE_ARGUMENT__TYPE_PARAMETER
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_TYPE_PARAMETER_CONSTRAINT__LEFT_OPERAND
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_TYPE_PARAMETER_CONSTRAINT__OPERATOR
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_TYPE_PARAMETER__VARIANCE
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_TYPE_PROJECTION__VARIANCE
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals.SML_YIELD__RESULT
import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import de.unibonn.simpleml.simpleML.SmlAbstractTemplateStringPart
import de.unibonn.simpleml.simpleML.SmlAnnotation
import de.unibonn.simpleml.simpleML.SmlAnnotationCall
import de.unibonn.simpleml.simpleML.SmlArgument
import de.unibonn.simpleml.simpleML.SmlArgumentList
import de.unibonn.simpleml.simpleML.SmlAssigneeList
import de.unibonn.simpleml.simpleML.SmlAssignment
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlBlock
import de.unibonn.simpleml.simpleML.SmlBlockLambda
import de.unibonn.simpleml.simpleML.SmlBlockLambdaResult
import de.unibonn.simpleml.simpleML.SmlCall
import de.unibonn.simpleml.simpleML.SmlCallableType
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlClassBody
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlConstraintList
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlEnumBody
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlExpressionLambda
import de.unibonn.simpleml.simpleML.SmlExpressionStatement
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlImport
import de.unibonn.simpleml.simpleML.SmlImportAlias
import de.unibonn.simpleml.simpleML.SmlIndexedAccess
import de.unibonn.simpleml.simpleML.SmlInfixOperation
import de.unibonn.simpleml.simpleML.SmlMemberAccess
import de.unibonn.simpleml.simpleML.SmlMemberType
import de.unibonn.simpleml.simpleML.SmlNamedType
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlParameterList
import de.unibonn.simpleml.simpleML.SmlParentTypeList
import de.unibonn.simpleml.simpleML.SmlParenthesizedExpression
import de.unibonn.simpleml.simpleML.SmlParenthesizedType
import de.unibonn.simpleml.simpleML.SmlPlaceholder
import de.unibonn.simpleml.simpleML.SmlPrefixOperation
import de.unibonn.simpleml.simpleML.SmlProtocol
import de.unibonn.simpleml.simpleML.SmlProtocolAlternative
import de.unibonn.simpleml.simpleML.SmlProtocolBody
import de.unibonn.simpleml.simpleML.SmlProtocolComplement
import de.unibonn.simpleml.simpleML.SmlProtocolParenthesizedTerm
import de.unibonn.simpleml.simpleML.SmlProtocolQuantifiedTerm
import de.unibonn.simpleml.simpleML.SmlProtocolReferenceList
import de.unibonn.simpleml.simpleML.SmlProtocolSequence
import de.unibonn.simpleml.simpleML.SmlProtocolSubterm
import de.unibonn.simpleml.simpleML.SmlProtocolSubtermList
import de.unibonn.simpleml.simpleML.SmlResult
import de.unibonn.simpleml.simpleML.SmlResultList
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.simpleML.SmlTemplateString
import de.unibonn.simpleml.simpleML.SmlTypeArgument
import de.unibonn.simpleml.simpleML.SmlTypeArgumentList
import de.unibonn.simpleml.simpleML.SmlTypeParameter
import de.unibonn.simpleml.simpleML.SmlTypeParameterConstraint
import de.unibonn.simpleml.simpleML.SmlTypeParameterList
import de.unibonn.simpleml.simpleML.SmlTypeProjection
import de.unibonn.simpleml.simpleML.SmlUnionType
import de.unibonn.simpleml.simpleML.SmlWorkflow
import de.unibonn.simpleml.simpleML.SmlYield
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

class SimpleMLFormatter : AbstractFormatter2() {

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

            is SmlCompilationUnit -> {

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
                val name = obj.regionForFeature(SML_ABSTRACT_DECLARATION__NAME)
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

            is SmlImport -> {

                // Keyword "import"
                doc.formatKeyword(obj, "import", noSpace, oneSpace)

                // Feature "importedNamespace"
                val importedNamespace = obj.regionForFeature(SML_IMPORT__IMPORTED_NAMESPACE)
                if (importedNamespace != null) {
                    doc.addReplacer(WhitespaceCollapser(doc, importedNamespace))
                }

                // EObject "aliasDeclaration"
                doc.formatObject(obj.alias, oneSpace, noSpace)
            }
            is SmlImportAlias -> {

                // Keyword "as"
                doc.formatKeyword(obj, "as", null, oneSpace)

                // Feature "alias"
                doc.formatFeature(obj, SML_IMPORT_ALIAS__NAME, null, noSpace)
            }
            is SmlAnnotation -> {

                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "annotation"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "annotation", null, oneSpace)
                } else {
                    doc.formatKeyword(obj, "annotation", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, null)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "constraintList"
                doc.formatObject(obj.constraintList, oneSpace, null)
            }
            is SmlAnnotationCall -> {

                // Keyword "@"
                doc.formatKeyword(obj, "@", null, noSpace)

                // Feature "annotation"
                doc.formatFeature(obj, SML_ANNOTATION_CALL__ANNOTATION, noSpace, null)

                // EObject "argumentList"
                doc.formatObject(obj.argumentList, noSpace, null)
            }
            is SmlAttribute -> {

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
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, noSpace)

                // Keyword ":"
                doc.formatKeyword(obj, ":", noSpace, oneSpace)

                // EObject "type"
                doc.formatObject(obj.type, oneSpace, null)
            }
            is SmlClass -> {

                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "class"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "class", null, oneSpace)
                } else {
                    doc.formatKeyword(obj, "class", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, null)

                // EObject "typeParameterList"
                doc.formatObject(obj.typeParameterList, noSpace, null)

                // EObject "constructor"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "parentTypeList"
                doc.formatObject(obj.parentTypeList, oneSpace, null)

                // EObject "constraintList"
                doc.formatObject(obj.constraintList, oneSpace, null)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SmlParentTypeList -> {

                // Keyword "sub"
                doc.formatKeyword(obj, "sub", null, oneSpace)

                // Feature "parentTypes"
                obj.parentTypes.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)
            }
            is SmlClassBody -> {

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
            is SmlEnum -> {

                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "enum"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "enum", null, oneSpace)
                } else {
                    doc.formatKeyword(obj, "enum", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, null)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SmlEnumBody -> {
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
            is SmlEnumVariant -> {

                // Features "annotations"
                doc.formatAnnotations(obj)

                // Feature "name"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME)
                } else {
                    doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, null)
                }

                // EObject "typeParameterList"
                doc.formatObject(obj.typeParameterList, noSpace, null)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "constraintList"
                doc.formatObject(obj.constraintList, oneSpace, null)
            }
            is SmlFunction -> {

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
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, null)

                // EObject "typeParameterList"
                doc.formatObject(obj.typeParameterList, noSpace, null)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, noSpace, null)

                // EObject "resultList"
                doc.formatObject(obj.resultList, oneSpace, null)

                // EObject "constraintList"
                doc.formatObject(obj.constraintList, oneSpace, null)
            }
            is SmlWorkflow -> {

                // Features "annotations"
                doc.formatAnnotations(obj)

                // Keyword "workflow"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatKeyword(obj, "workflow", noSpace, oneSpace)
                } else {
                    doc.formatKeyword(obj, "workflow", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, null, oneSpace)

                // EObject "body"
                doc.formatObject(obj.body)
            }
            is SmlStep -> {

                // Features "annotations"
                doc.formatAnnotations(obj)

                // Feature "visibility"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatFeature(obj, SML_STEP__VISIBILITY, noSpace, null)
                }

                // Keyword "step"
                if (obj.annotationCallsOrEmpty().isEmpty() && obj.visibility == null) {
                    doc.formatKeyword(obj, "step", noSpace, oneSpace)
                } else {
                    doc.formatKeyword(obj, "step", oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, null, noSpace)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList)

                // EObject "resultList"
                doc.formatObject(obj.resultList)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SmlArgumentList -> {

                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // Feature "parameters"
                obj.arguments.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SmlArgument -> {

                // Feature "parameter"
                doc.formatFeature(obj, SML_ARGUMENT__PARAMETER)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "value"
                doc.formatObject(obj.value)
            }
            is SmlParameterList -> {

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
            is SmlParameter -> {

                // Features "annotations"
                doc.formatAnnotations(obj, inlineAnnotations = true)

                // Keyword "vararg"
                if (obj.annotationCallsOrEmpty().isNotEmpty()) {
                    doc.formatKeyword(obj, "vararg", oneSpace, null)
                }

                // Feature "name"
                val name = obj.regionForFeature(SML_ABSTRACT_DECLARATION__NAME)
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
            is SmlResultList -> {

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
            is SmlResult -> {

                // Features "annotations"
                doc.formatAnnotations(obj, inlineAnnotations = true)

                // Feature "name"
                val name = obj.regionForFeature(SML_ABSTRACT_DECLARATION__NAME)
                if (obj.annotationCallsOrEmpty().isNotEmpty()) {
                    doc.prepend(name, oneSpace)
                }

                // Keyword ":"
                doc.formatKeyword(obj, ":", noSpace, oneSpace)

                // EObject "type"
                doc.formatObject(obj.type)
            }

            /**********************************************************************************************************
             * Protocols
             **********************************************************************************************************/

            is SmlProtocol -> {

                // Keyword "protocol"
                doc.formatKeyword(obj, "protocol", null, oneSpace)

                // EObject "body"
                doc.formatObject(obj.body)
            }
            is SmlProtocolBody -> {

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
            is SmlProtocolSubtermList -> {
                obj.subterms.forEach {
                    if (it === obj.subterms.last()) {
                        doc.formatObject(it, null, null)
                    } else {
                        doc.formatObject(it, null, newLine)
                    }
                }
            }
            is SmlProtocolSubterm -> {

                // Keyword "subterm"
                doc.formatKeyword(obj, "subterm", null, oneSpace)

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, oneSpace)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "term"
                doc.formatObject(obj.term, oneSpace, noSpace)

                // Keyword ";"
                doc.formatKeyword(obj, ";", noSpace, null)
            }
            is SmlProtocolAlternative -> {

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
            is SmlProtocolComplement -> {

                // Keyword "["
                doc.formatKeyword(obj, "[", null, noSpace)

                // Keyword "^"
                doc.formatKeyword(obj, "^", noSpace, null)

                // EObject "referenceList"
                doc.formatObject(obj.referenceList, oneSpace, null)

                // Keyword "]"
                doc.formatKeyword(obj, "]", noSpace, null)
            }
            is SmlProtocolReferenceList -> {

                // EObject "terms"
                obj.references.forEach {
                    if (it == obj.references.last()) {
                        doc.formatObject(it)
                    } else {
                        doc.formatObject(it, null, oneSpace)
                    }
                }
            }
            is SmlProtocolParenthesizedTerm -> {

                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // EObject "term"
                doc.formatObject(obj.term, noSpace, noSpace)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SmlProtocolQuantifiedTerm -> {

                // EObject "term"
                doc.formatObject(obj.term)

                // Feature "quantifier"
                doc.formatFeature(obj, SML_PROTOCOL_QUANTIFIED_TERM__QUANTIFIER, noSpace, null)
            }
            is SmlProtocolSequence -> {

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
             * Statements
             **********************************************************************************************************/

            is SmlBlock -> {

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
            is SmlAssignment -> {

                // EObject "assigneeList"
                doc.formatObject(obj.assigneeList, null, oneSpace)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "expression"
                doc.formatObject(obj.expression)

                // Keyword ";"
                doc.formatKeyword(obj, ";", noSpace, null)
            }
            is SmlAssigneeList -> {

                // Feature "assignees"
                obj.assignees.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)
            }
            is SmlBlockLambdaResult -> {

                // Keyword "yield"
                doc.formatKeyword(obj, "yield", null, oneSpace)

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, null)
            }
            is SmlPlaceholder -> {

                // Keyword "val"
                doc.formatKeyword(obj, "val", null, oneSpace)

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME, oneSpace, null)
            }
            is SmlYield -> {

                // Keyword "yield"
                doc.formatKeyword(obj, "yield", null, oneSpace)

                // Feature "result"
                doc.formatFeature(obj, SML_YIELD__RESULT)
            }
            is SmlExpressionStatement -> {

                // EObject "expression"
                doc.formatObject(obj.expression)

                // Keyword ";"
                doc.formatKeyword(obj, ";", noSpace, null)
            }

            /**********************************************************************************************************
             * Expressions
             **********************************************************************************************************/

            is SmlBlockLambda -> {

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, null, oneSpace)

                // EObject "body"
                doc.formatObject(obj.body, oneSpace, null)
            }
            is SmlCall -> {

                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // EObject "typeArgumentList"
                doc.formatObject(obj.typeArgumentList, null, noSpace)

                // EObject "argumentList"
                doc.formatObject(obj.argumentList)
            }
            is SmlExpressionLambda -> {

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, null, oneSpace)

                // Keyword "->"
                doc.formatKeyword(obj, "->", oneSpace, oneSpace)

                // EObject "result"
                doc.formatObject(obj.result, oneSpace, null)
            }
            is SmlIndexedAccess -> {

                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // Keyword "["
                doc.formatKeyword(obj, "[", noSpace, noSpace)

                // EObject "index"
                doc.formatObject(obj.index, noSpace, noSpace)

                // Keyword "]"
                doc.formatKeyword(obj, "]", noSpace, null)
            }
            is SmlInfixOperation -> {

                // EObject "leftOperand"
                doc.formatObject(obj.leftOperand, null, oneSpace)

                // Feature "operator"
                doc.formatFeature(obj, SML_INFIX_OPERATION__OPERATOR, oneSpace, oneSpace)

                // EObject "rightOperand"
                doc.formatObject(obj.rightOperand, oneSpace, null)
            }
            is SmlMemberAccess -> {

                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // Feature "nullable"
                doc.formatFeature(obj, SML_MEMBER_ACCESS__NULL_SAFE, noSpace, noSpace)

                // Keyword "."
                doc.formatKeyword(obj, ".", noSpace, noSpace)

                // EObject "member"
                doc.formatObject(obj.member, noSpace, null)
            }
            is SmlParenthesizedExpression -> {

                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // EObject "expression"
                doc.formatObject(obj.expression, noSpace, noSpace)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SmlPrefixOperation -> {

                // Feature "operator"
                doc.formatFeature(
                    obj,
                    SML_PREFIX_OPERATION__OPERATOR,
                    prepend = null,
                    append = if (obj.operator == "not") oneSpace else noSpace
                )

                // EObject "operand"
                doc.formatObject(obj.operand)
            }
            is SmlTemplateString -> {

                // Feature expressions
                obj.expressions.forEach {
                    if (it !is SmlAbstractTemplateStringPart) {
                        doc.formatObject(it, oneSpace, oneSpace)
                    }
                }
            }

            /**********************************************************************************************************
             * Types
             **********************************************************************************************************/

            is SmlCallableType -> {

                // Keyword "callable"
                doc.formatKeyword(obj, "callable", null, oneSpace)

                // EObject "parameterList"
                doc.formatObject(obj.parameterList, oneSpace, oneSpace)

                // EObject "resultList"
                doc.formatObject(obj.resultList, oneSpace, null)
            }
            is SmlMemberType -> {

                // EObject "receiver"
                doc.formatObject(obj.receiver, null, noSpace)

                // Keyword "."
                doc.formatKeyword(obj, ".", noSpace, noSpace)

                // EObject "member"
                doc.formatObject(obj.member, noSpace, null)
            }
            is SmlNamedType -> {

                // Feature "declaration"
                doc.formatFeature(obj, SML_NAMED_TYPE__DECLARATION)

                // EObject "typeArgumentList"
                doc.formatObject(obj.typeArgumentList, noSpace, noSpace)

                // Feature "nullable"
                doc.formatFeature(obj, SML_NAMED_TYPE__NULLABLE, noSpace, null)
            }
            is SmlParenthesizedType -> {

                // Keyword "("
                doc.formatKeyword(obj, "(", null, noSpace)

                // EObject "type"
                doc.formatObject(obj.type, noSpace, noSpace)

                // Keyword ")"
                doc.formatKeyword(obj, ")", noSpace, null)
            }
            is SmlUnionType -> {

                // Keyword "union"
                doc.formatKeyword(obj, "union", null, noSpace)

                // EObject "typeArgumentList"
                doc.formatObject(obj.typeArgumentList, noSpace, null)
            }
            is SmlTypeArgumentList -> {

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
            is SmlTypeArgument -> {

                // Feature "typeParameter"
                doc.formatFeature(obj, SML_TYPE_ARGUMENT__TYPE_PARAMETER)

                // Keyword "="
                doc.formatKeyword(obj, "=", oneSpace, oneSpace)

                // EObject "value"
                doc.formatObject(obj.value)
            }
            is SmlTypeProjection -> {

                // Feature "variance"
                doc.formatFeature(obj, SML_TYPE_PROJECTION__VARIANCE, null, oneSpace)

                // EObject "type"
                doc.formatObject(obj.type)
            }
            is SmlTypeParameterList -> {

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
            is SmlTypeParameter -> {

                // Features "annotations"
                doc.formatAnnotations(obj, inlineAnnotations = true)

                // Feature "variance"
                if (obj.annotationCallsOrEmpty().isEmpty()) {
                    doc.formatFeature(obj, SML_TYPE_PARAMETER__VARIANCE, null, oneSpace)
                } else {
                    doc.formatFeature(obj, SML_TYPE_PARAMETER__VARIANCE, oneSpace, oneSpace)
                }

                // Feature "name"
                doc.formatFeature(obj, SML_ABSTRACT_DECLARATION__NAME)
            }
            is SmlConstraintList -> {

                // Keyword "where"
                doc.formatKeyword(obj, "where", null, oneSpace)

                // Feature "constraints"
                obj.constraints.forEach {
                    doc.formatObject(it)
                }

                // Keywords ","
                doc.formatCommas(obj)
            }
            is SmlTypeParameterConstraint -> {

                // Feature "leftOperand"
                doc.formatFeature(obj, SML_TYPE_PARAMETER_CONSTRAINT__LEFT_OPERAND, null, oneSpace)

                // Feature "operator"
                doc.formatFeature(obj, SML_TYPE_PARAMETER_CONSTRAINT__OPERATOR, oneSpace, oneSpace)

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
        append: KFunction1<Format, Unit>? = null
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
        append: KFunction1<Format, Unit>? = null
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
        append: KFunction1<Format, Unit>? = null
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
        obj: SmlAbstractDeclaration,
        inlineAnnotations: Boolean = false
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

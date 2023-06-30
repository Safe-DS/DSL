import {AbstractFormatter, AstNode, Formatting} from 'langium';
import * as ast from '../generated/ast';
import {SdsImport, SdsImportAlias, SdsModule} from '../generated/ast';
import {annotationCallsOrEmpty} from "../helpers/astShortcuts";
import noSpace = Formatting.noSpace;
import newLine = Formatting.newLine;
import newLines = Formatting.newLines;
import oneSpace = Formatting.oneSpace;


export class SafeDSFormatter extends AbstractFormatter {
    protected override format(node: AstNode): void {
        if (ast.isSdsModule(node)) {
            this.formatSdsModule(node)
        }
        if (ast.isSdsImport(node)) {
            this.formatSdsImport(node)
        }
        if (ast.isSdsImportAlias(node)) {
            this.formatSdsImportAlias(node)
        }
        if (ast.isSdsAnnotation(node)) {
            this.formatSdsAnnotation(node)
        }
        if (ast.isSdsAnnotationCall(node)) {
            this.formatSdsAnnotationCall(node)
        }
        if (ast.isSdsAttribute(node)) {
            this.formatSdsAttribute(node)
        }
        if (ast.isSdsClass(node)) {
            this.formatSdsClass(node)
        }
        if (ast.isSdsEnum(node)) {
            this.formatSdsEnum(node)
        }
        if (ast.isSdsEnumBody(node)) {
            this.formatSdsEnumBody(node)
        }
        if (ast.isSdsEnumVariant(node)) {
            this.formatSdsEnumVariant(node)
        }
        if (ast.isSdsParameter(node)) {
            this.formatSdsParameter(node)
        }
        if (ast.isSdsParameterList(node)) {
            this.formatSdsParameterList(node)
        }
        if (ast.isSdsArgument(node)) {
            this.formatSdsArgument(node)
        }
        if (ast.isSdsArgumentList(node)) {
            this.formatSdsArgumentList(node)
        }
        if (ast.isSdsPipeline(node)) {
            this.formatSdsPipeline(node)
        }
        if (ast.isSdsStep(node)) {
            this.formatSdsStep(node)
        }
    }

    formatSdsModule(node: SdsModule): void {
        const formatter = this.getNodeFormatter(node);
        const annotations = annotationCallsOrEmpty(node)
        const name = node.name
        const imports = node.imports
        const members = node.members

        // Annotations
        annotations.forEach((value, index) => {
            if (index === 0) {
                formatter.node(value).prepend(noSpace())
            } else {
                formatter.node(value).prepend(newLines(1))
            }
        })

        // Package
        if (annotations.length === 0) {
            formatter.keyword("package").prepend(noSpace())
        } else {
            formatter.keyword("package").prepend(newLines(2))
        }
        formatter.keyword("package").append(oneSpace())
        formatter.keyword(".").surround(noSpace())

        // Imports
        imports.forEach((value, index) => {
            if (index === 0) {
                if (annotations.length === 0 && !name) {
                    formatter.node(value).prepend(noSpace())
                } else {
                    formatter.node(value).prepend(newLines(2))
                }
            } else {
                formatter.node(value).prepend(newLines(1))
            }
        })

        // Members
        members.forEach((value, index) => {
            if (index === 0) {
                if (annotations.length === 0 && !name && imports.length === 0) {
                    formatter.node(value).prepend(noSpace())
                } else {
                    formatter.node(value).prepend(Formatting.newLines(2))
                }
            } else {
                formatter.node(value).prepend(newLines(2))
            }
        })
    }

    formatSdsImport(node: SdsImport): void {
        const formatter = this.getNodeFormatter(node);

        // Keyword "import"
        formatter.keyword("import").append(oneSpace())

        // Imported namespace
        formatter.keyword(".").surround(noSpace())
    }

    formatSdsImportAlias(node: SdsImportAlias): void {
        const formatter = this.getNodeFormatter(node);

        // Keyword "as"
        formatter.keyword("as").surround(Formatting.oneSpace())
    }

    formatSdsAnnotation(node: ast.SdsAnnotation): void {
        const formatter = this.getNodeFormatter(node);

        // Keyword "annotation"
        const keyword = formatter.keyword("annotation")
        formatter.keyword("annotation").prepend(noSpace())

        // Name
        formatter.property("name").prepend(oneSpace())
    }

    formatSdsAnnotationCall(node: ast.SdsAnnotationCall): void {

    }

    formatSdsAttribute(node: ast.SdsAttribute): void {

    }

    formatSdsClass(node: ast.SdsClass): void {

    }

    formatSdsParentTypeList(node: ast.SdsParentTypeList): void {

    }

    formatSdsClassBody(node: ast.SdsClassBody): void {

    }

    formatSdsEnum(node: ast.SdsEnum): void {

    }

    formatSdsEnumBody(node: ast.SdsEnumBody): void {

    }

    formatSdsEnumVariant(node: ast.SdsEnumVariant): void {

    }

    formatSdsFunction(node: ast.SdsFunction): void {

    }

    formatSdsPipeline(node: ast.SdsPipeline): void {

    }

    formatSdsStep(node: ast.SdsStep): void {

    }

    formatSdsArgument(node: ast.SdsArgument): void {

    }

    formatSdsArgumentList(node: ast.SdsArgumentList): void {

    }

    formatSdsParameter(node: ast.SdsParameter): void {

    }

    formatSdsParameterList(node: ast.SdsParameterList): void {

    }

    formatSdsResult(node: ast.SdsResult): void {

    }

    formatSdsResultList(node: ast.SdsResultList): void {

    }

}


//             is SdsAnnotation -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Keyword "annotation"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatKeyword(node, "annotation", null, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "annotation", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
//
//                 // EObject "parameterList"
//                 doc.formatObject(node.parameterList, noSpace, null)
//
//                 // EObject "constraint"
//                 doc.formatObject(node.constraint, oneSpace, null)
//             }
//             is SdsAnnotationCall -> {
//                 // Keyword "@"
//                 doc.formatKeyword(node, "@", null, noSpace)
//
//                 // Property "annotation"
//                 doc.formatProperty(node, SDS_ANNOTATION_CALL__ANNOTATION, noSpace, null)
//
//                 // EObject "argumentList"
//                 doc.formatObject(node.argumentList, noSpace, null)
//             }
//             is SdsAttribute -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Keyword "static"
//                 if (node.annotationCallsOrEmpty().isNotEmpty()) {
//                     doc.formatKeyword(node, "static", oneSpace, null)
//                 }
//
//                 // Keyword "attr"
//                 if (node.annotationCallsOrEmpty().isEmpty() && !node.isStatic) {
//                     doc.formatKeyword(node, "attr", null, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "attr", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, noSpace)
//
//                 // Keyword ":"
//                 doc.formatKeyword(node, ":", noSpace, oneSpace)
//
//                 // EObject "type"
//                 doc.formatObject(node.type, oneSpace, null)
//             }
//             is SdsClass -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Keyword "class"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatKeyword(node, "class", null, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "class", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
//
//                 // EObject "typeParameterList"
//                 doc.formatObject(node.typeParameterList, noSpace, null)
//
//                 // EObject "constructor"
//                 doc.formatObject(node.parameterList, noSpace, null)
//
//                 // EObject "parentTypeList"
//                 doc.formatObject(node.parentTypeList, oneSpace, null)
//
//                 // EObject "body"
//                 doc.formatObject(node.body, oneSpace, null)
//             }
//             is SdsParentTypeList -> {
//                 // Keyword "sub"
//                 doc.formatKeyword(node, "sub", null, oneSpace)
//
//                 // Property "parentTypes"
//                 node.parentTypes.forEach {
//                     doc.formatObject(it)
//                 }
//
//                 // Keywords ","
//                 doc.formatCommas(node)
//             }
//             is SdsClassBody -> {
//                 // Keyword "{"
//                 val openingBrace = node.regionForKeyword("{")
//                 if (node.members.isEmpty()) {
//                     doc.append(openingBrace, noSpace)
//                 } else {
//                     doc.append(openingBrace, newLine)
//                 }
//
//                 // Property "members"
//                 node.members.forEach {
//                     doc.format(it)
//                     if (node.members.last() == it) {
//                         doc.append(it, newLine)
//                     } else {
//                         doc.append(it, newLines(2))
//                     }
//                 }
//
//                 // Keyword "}"
//                 val closingBrace = node.regionForKeyword("}")
//                 doc.prepend(closingBrace, noSpace)
//
//                 doc.interior(openingBrace, closingBrace, indent)
//             }
//             is SdsEnum -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Keyword "enum"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatKeyword(node, "enum", null, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "enum", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
//
//                 // EObject "body"
//                 doc.formatObject(node.body, oneSpace, null)
//             }
//             is SdsEnumBody -> {
//                 // Keyword "{"
//                 val openingBrace = node.regionForKeyword("{")
//                 if (node.variants.isEmpty()) {
//                     doc.append(openingBrace, noSpace)
//                 } else {
//                     doc.append(openingBrace, newLine)
//                 }
//
//                 // Property "variants"
//                 node.variants.forEach {
//                     doc.format(it)
//                     if (node.variants.first() != it) {
//                         doc.prepend(it, newLines(2))
//                     }
//                 }
//
//                 // Keywords ","
//                 val commas = textRegionExtensions.allRegionsFor(node).keywords(",")
//                 commas.forEach {
//                     doc.prepend(it, noSpace)
//                 }
//
//                 // Keyword "}"
//                 val closingBrace = node.regionForKeyword("}")
//                 if (node.variants.isEmpty()) {
//                     doc.prepend(closingBrace, noSpace)
//                 } else {
//                     doc.prepend(closingBrace, newLine)
//                 }
//
//                 doc.interior(openingBrace, closingBrace, indent)
//             }
//             is SdsEnumVariant -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Property "name"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME)
//                 } else {
//                     doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
//                 }
//
//                 // EObject "typeParameterList"
//                 doc.formatObject(node.typeParameterList, noSpace, null)
//
//                 // EObject "parameterList"
//                 doc.formatObject(node.parameterList, noSpace, null)
//
//                 // EObject "constraint"
//                 doc.formatObject(node.constraint, oneSpace, null)
//             }
//             is SdsFunction -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Keyword "static"
//                 if (node.annotationCallsOrEmpty().isNotEmpty()) {
//                     doc.formatKeyword(node, "static", oneSpace, null)
//                 }
//
//                 // Keyword "fun"
//                 if (node.annotationCallsOrEmpty().isEmpty() && !node.isStatic) {
//                     doc.formatKeyword(node, "fun", null, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "fun", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
//
//                 // EObject "typeParameterList"
//                 doc.formatObject(node.typeParameterList, noSpace, null)
//
//                 // EObject "parameterList"
//                 doc.formatObject(node.parameterList, noSpace, null)
//
//                 // EObject "resultList"
//                 doc.formatObject(node.resultList, oneSpace, null)
//
//                 // EObject "body"
//                 doc.formatObject(node.body, oneSpace, null)
//             }
//             is SdsFunctionBody -> {
//                 // Keyword "{"
//                 val openingBrace = node.regionForKeyword("{")
//                 if (node.statements.isEmpty()) {
//                     doc.append(openingBrace, noSpace)
//                 } else {
//                     doc.append(openingBrace, newLine)
//                 }
//
//                 // Property "statements"
//                 node.statements.forEach {
//                     doc.format(it)
//                     if (node.statements.last() == it) {
//                         doc.append(it, newLine)
//                     } else {
//                         doc.append(it, newLines(2))
//                     }
//                 }
//
//                 // Keyword "}"
//                 val closingBrace = node.regionForKeyword("}")
//                 doc.prepend(closingBrace, noSpace)
//
//                 doc.interior(openingBrace, closingBrace, indent)
//             }
//             is SdsPipeline -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Keyword "pipeline"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatKeyword(node, "pipeline", noSpace, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "pipeline", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, null, oneSpace)
//
//                 // EObject "body"
//                 doc.formatObject(node.body)
//             }
//             is SdsStep -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Property "visibility"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatProperty(node, SDS_STEP__VISIBILITY, noSpace, null)
//                 }
//
//                 // Keyword "step"
//                 if (node.annotationCallsOrEmpty().isEmpty() && node.visibility == null) {
//                     doc.formatKeyword(node, "step", noSpace, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "step", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, null, noSpace)
//
//                 // EObject "parameterList"
//                 doc.formatObject(node.parameterList)
//
//                 // EObject "resultList"
//                 doc.formatObject(node.resultList)
//
//                 // EObject "body"
//                 doc.formatObject(node.body, oneSpace, null)
//             }
//             is SdsArgumentList -> {
//                 // Keyword "("
//                 doc.formatKeyword(node, "(", null, noSpace)
//
//                 // Property "arguments"
//                 node.arguments.forEach {
//                     doc.formatObject(it)
//                 }
//
//                 // Keywords ","
//                 doc.formatCommas(node)
//
//                 // Keyword ")"
//                 doc.formatKeyword(node, ")", noSpace, null)
//             }
//             is SdsArgument -> {
//                 // Property "parameter"
//                 doc.formatProperty(node, SDS_ARGUMENT__PARAMETER)
//
//                 // Keyword "="
//                 doc.formatKeyword(node, "=", oneSpace, oneSpace)
//
//                 // EObject "value"
//                 doc.formatObject(node.value)
//             }
//             is SdsParameterList -> {
//                 // Keyword "("
//                 doc.formatKeyword(node, "(", null, noSpace)
//
//                 // Property "parameters"
//                 node.parameters.forEach {
//                     doc.formatObject(it)
//                 }
//
//                 // Keywords ","
//                 doc.formatCommas(node)
//
//                 // Keyword ")"
//                 doc.formatKeyword(node, ")", noSpace, null)
//             }
//             is SdsParameter -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node, inlineAnnotations = true)
//
//                 // Keyword "vararg"
//                 if (node.annotationCallsOrEmpty().isNotEmpty()) {
//                     doc.formatKeyword(node, "vararg", oneSpace, null)
//                 }
//
//                 // Property "name"
//                 val name = node.regionForProperty(SDS_ABSTRACT_DECLARATION__NAME)
//                 if (node.annotationCallsOrEmpty().isNotEmpty() || node.isVariadic) {
//                     doc.prepend(name, oneSpace)
//                 }
//
//                 // Keyword ":"
//                 doc.formatKeyword(node, ":", noSpace, oneSpace)
//
//                 // EObject "type"
//                 doc.formatObject(node.type)
//
//                 // Keyword "="
//                 doc.formatKeyword(node, "=", oneSpace, oneSpace)
//
//                 // EObject "defaultValue"
//                 doc.formatObject(node.defaultValue)
//             }
//             is SdsResultList -> {
//                 // Keyword "->"
//                 doc.formatKeyword(node, "->", oneSpace, oneSpace)
//
//                 // Keyword "("
//                 doc.formatKeyword(node, "(", null, noSpace)
//
//                 // Property "results"
//                 node.results.forEach {
//                     doc.formatObject(it)
//                 }
//
//                 // Keywords ","
//                 doc.formatCommas(node)
//
//                 // Keyword ")"
//                 doc.formatKeyword(node, ")", noSpace, null)
//             }
//             is SdsResult -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node, inlineAnnotations = true)
//
//                 // Property "name"
//                 val name = node.regionForProperty(SDS_ABSTRACT_DECLARATION__NAME)
//                 if (node.annotationCallsOrEmpty().isNotEmpty()) {
//                     doc.prepend(name, oneSpace)
//                 }
//
//                 // Keyword ":"
//                 doc.formatKeyword(node, ":", noSpace, oneSpace)
//
//                 // EObject "type"
//                 doc.formatObject(node.type)
//             }
//
//             /**********************************************************************************************************
//              * Predicate
//              **********************************************************************************************************/
//
//             is SdsPredicate -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Keyword "predicate"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatKeyword(node, "predicate", noSpace, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "predicate", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, null, noSpace)
//
//                 // EObject "typeParameterList"
//                 doc.formatObject(node.typeParameterList, noSpace, null)
//
//                 // EObject "parameterList"
//                 doc.formatObject(node.parameterList, noSpace, null)
//
//                 // EObject "resultList"
//                 doc.formatObject(node.resultList, oneSpace, null)
//
//                 // EObject "body"
//                 doc.formatObject(node.body, oneSpace, null)
//             }
//
//             /**********************************************************************************************************
//              * Protocols
//              **********************************************************************************************************/
//
//             is SdsProtocol -> {
//                 // Keyword "protocol"
//                 doc.formatKeyword(node, "protocol", null, oneSpace)
//
//                 // EObject "body"
//                 doc.formatObject(node.body)
//             }
//             is SdsProtocolBody -> {
//                 // Keyword "{"
//                 val openingBrace = node.regionForKeyword("{")
//                 if (node.subtermList == null && node.term == null) {
//                     doc.append(openingBrace, noSpace)
//                 } else {
//                     doc.append(openingBrace, newLine)
//                 }
//
//                 // EObject "subtermList"
//                 if (node.term == null) {
//                     doc.formatObject(node.subtermList, null, newLine)
//                 } else {
//                     doc.format(node.subtermList)
//                     doc.append(node.subtermList, newLines(2))
//                 }
//
//                 // EObject "term"
//                 doc.formatObject(node.term, null, newLine)
//
//                 // Keyword "}"
//                 val closingBrace = node.regionForKeyword("}")
//                 doc.prepend(closingBrace, noSpace)
//
//                 doc.interior(openingBrace, closingBrace, indent)
//             }
//             is SdsProtocolSubtermList -> {
//                 node.subterms.forEach {
//                     if (it === node.subterms.last()) {
//                         doc.formatObject(it, null, null)
//                     } else {
//                         doc.formatObject(it, null, newLine)
//                     }
//                 }
//             }
//             is SdsProtocolSubterm -> {
//                 // Keyword "subterm"
//                 doc.formatKeyword(node, "subterm", null, oneSpace)
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, oneSpace)
//
//                 // Keyword "="
//                 doc.formatKeyword(node, "=", oneSpace, oneSpace)
//
//                 // EObject "term"
//                 doc.formatObject(node.term, oneSpace, noSpace)
//
//                 // Keyword ";"
//                 doc.formatKeyword(node, ";", noSpace, null)
//             }
//             is SdsProtocolAlternative -> {
//                 // Keywords '|'
//                 val pipes = textRegionExtensions.allRegionsFor(node).keywords("|")
//                 pipes.forEach {
//                     doc.prepend(it, oneSpace)
//                     doc.append(it, oneSpace)
//                 }
//
//                 // EObject "terms"
//                 node.terms.forEach {
//                     doc.formatObject(it)
//                 }
//             }
//             is SdsProtocolComplement -> {
//                 // Keyword "["
//                 doc.formatKeyword(node, "[", null, noSpace)
//
//                 // Keyword "^"
//                 doc.formatKeyword(node, "^", noSpace, null)
//
//                 // EObject "referenceList"
//                 doc.formatObject(node.referenceList, oneSpace, null)
//
//                 // Keyword "]"
//                 doc.formatKeyword(node, "]", noSpace, null)
//             }
//             is SdsProtocolReferenceList -> {
//                 // EObject "terms"
//                 node.references.forEach {
//                     if (it == node.references.last()) {
//                         doc.formatObject(it)
//                     } else {
//                         doc.formatObject(it, null, oneSpace)
//                     }
//                 }
//             }
//             is SdsProtocolParenthesizedTerm -> {
//                 // Keyword "("
//                 doc.formatKeyword(node, "(", null, noSpace)
//
//                 // EObject "term"
//                 doc.formatObject(node.term, noSpace, noSpace)
//
//                 // Keyword ")"
//                 doc.formatKeyword(node, ")", noSpace, null)
//             }
//             is SdsProtocolQuantifiedTerm -> {
//                 // EObject "term"
//                 doc.formatObject(node.term)
//
//                 // Property "quantifier"
//                 doc.formatProperty(node, SDS_PROTOCOL_QUANTIFIED_TERM__QUANTIFIER, noSpace, null)
//             }
//             is SdsProtocolSequence -> {
//                 // EObject "terms"
//                 node.terms.forEach {
//                     if (it == node.terms.last()) {
//                         doc.formatObject(it)
//                     } else {
//                         doc.formatObject(it, null, oneSpace)
//                     }
//                 }
//             }
//
//             /**********************************************************************************************************
//              * Schema
//              **********************************************************************************************************/
//
//             is SdsSchema -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node)
//
//                 // Keyword "schema"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatKeyword(node, "schema", noSpace, oneSpace)
//                 } else {
//                     doc.formatKeyword(node, "schema", oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, null, oneSpace)
//
//                 // EObject "columnList"
//                 doc.formatObject(node.columnList, oneSpace, null)
//             }
//             is SdsColumnList -> {
//                 // Keyword "{"
//                 val openingBrace = node.regionForKeyword("{")
//                 if (node.columns.isEmpty()) {
//                     doc.append(openingBrace, noSpace)
//                 } else {
//                     doc.append(openingBrace, newLine)
//                 }
//
//                 // Property "columns"
//                 node.columns.forEach {
//                     doc.formatObject(it, newLine, noSpace)
//                 }
//
//                 // Keywords ","
//                 doc.formatKeyword(node, ",", noSpace, newLine)
//
//                 // Keyword "}"
//                 val closingBrace = node.regionForKeyword("}")
//                 if (node.columns.isEmpty()) {
//                     doc.prepend(closingBrace, noSpace)
//                 } else {
//                     doc.prepend(closingBrace, newLine)
//                 }
//                 doc.interior(openingBrace, closingBrace, indent)
//             }
//             is SdsColumn -> {
//                 // EObject "columnName"
//                 doc.formatObject(node.columnName, null, oneSpace)
//
//                 // Keyword ":"
//                 doc.formatKeyword(node, ":", oneSpace, oneSpace)
//
//                 // EObject "columnType"
//                 doc.formatObject(node.columnType)
//             }
//
//             /**********************************************************************************************************
//              * Statements
//              **********************************************************************************************************/
//
//             is SdsBlock -> {
//                 val internalPadding: KFunction1<Format, Unit>
//                 if (node.statements.isEmpty()) {
//                     internalPadding = noSpace
//                 } else {
//                     internalPadding = newLine
//                 }
//
//                 val statementsSuffix: KFunction1<Format, Unit>
//                 if (node.eContainer() is SdsConstraint || node.eContainer() is SdsPredicate) {
//                     statementsSuffix = noSpace
//                 } else {
//                     statementsSuffix = newLine
//                 }
//
//                 // Keyword "{"
//                 val openingBrace = node.regionForKeyword("{")
//                 doc.append(openingBrace, internalPadding)
//
//                 // Property "statements"
//                 node.statements.forEach {
//                     doc.formatObject(it, null, statementsSuffix)
//                 }
//
//                 // Keywords "," (for SdsConstraint or SdsPredicate)
//                 if (statementsSuffix == noSpace) {
//                     doc.formatKeyword(node, ",", noSpace, newLine)
//                 }
//
//                 // Keyword "}"
//                 val closingBrace = node.regionForKeyword("}")
//                 doc.prepend(closingBrace, internalPadding)
//
//                 doc.interior(openingBrace, closingBrace, indent)
//             }
//             is SdsAssignment -> {
//                 // EObject "assigneeList"
//                 doc.formatObject(node.assigneeList, null, oneSpace)
//
//                 // Keyword "="
//                 doc.formatKeyword(node, "=", oneSpace, oneSpace)
//
//                 // EObject "expression"
//                 doc.formatObject(node.expression)
//
//                 // Keyword ";"
//                 doc.formatKeyword(node, ";", noSpace, null)
//             }
//             is SdsAssigneeList -> {
//                 // Property "assignees"
//                 node.assignees.forEach {
//                     doc.formatObject(it)
//                 }
//
//                 // Keywords ","
//                 doc.formatCommas(node)
//             }
//             is SdsBlockLambdaResult -> {
//                 // Keyword "yield"
//                 doc.formatKeyword(node, "yield", null, oneSpace)
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
//             }
//             is SdsPlaceholder -> {
//                 // Keyword "val"
//                 doc.formatKeyword(node, "val", null, oneSpace)
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME, oneSpace, null)
//             }
//             is SdsYield -> {
//                 // Keyword "yield"
//                 doc.formatKeyword(node, "yield", null, oneSpace)
//
//                 // Property "result"
//                 doc.formatProperty(node, SDS_YIELD__RESULT)
//             }
//             is SdsExpressionStatement -> {
//                 // EObject "expression"
//                 doc.formatObject(node.expression)
//
//                 // Keyword ";"
//                 doc.formatKeyword(node, ";", noSpace, null)
//             }
//
//             /**********************************************************************************************************
//              * Expressions
//              **********************************************************************************************************/
//
//             is SdsBlockLambda -> {
//                 // EObject "parameterList"
//                 doc.formatObject(node.parameterList, null, oneSpace)
//
//                 // EObject "body"
//                 doc.formatObject(node.body, oneSpace, null)
//             }
//             is SdsCall -> {
//                 // EObject "receiver"
//                 doc.formatObject(node.receiver, null, noSpace)
//
//                 // EObject "typeArgumentList"
//                 doc.formatObject(node.typeArgumentList, null, noSpace)
//
//                 // EObject "argumentList"
//                 doc.formatObject(node.argumentList)
//             }
//             is SdsExpressionLambda -> {
//                 // EObject "parameterList"
//                 doc.formatObject(node.parameterList, null, oneSpace)
//
//                 // Keyword "->"
//                 doc.formatKeyword(node, "->", oneSpace, oneSpace)
//
//                 // EObject "result"
//                 doc.formatObject(node.result, oneSpace, null)
//             }
//             is SdsIndexedAccess -> {
//                 // EObject "receiver"
//                 doc.formatObject(node.receiver, null, noSpace)
//
//                 // Keyword "["
//                 doc.formatKeyword(node, "[", noSpace, noSpace)
//
//                 // EObject "index"
//                 doc.formatObject(node.index, noSpace, noSpace)
//
//                 // Keyword "]"
//                 doc.formatKeyword(node, "]", noSpace, null)
//             }
//             is SdsInfixOperation -> {
//                 // EObject "leftOperand"
//                 doc.formatObject(node.leftOperand, null, oneSpace)
//
//                 // Property "operator"
//                 doc.formatProperty(node, SDS_INFIX_OPERATION__OPERATOR, oneSpace, oneSpace)
//
//                 // EObject "rightOperand"
//                 doc.formatObject(node.rightOperand, oneSpace, null)
//             }
//             is SdsMemberAccess -> {
//                 // EObject "receiver"
//                 doc.formatObject(node.receiver, null, noSpace)
//
//                 // Property "nullable"
//                 doc.formatProperty(node, SDS_MEMBER_ACCESS__NULL_SAFE, noSpace, noSpace)
//
//                 // Keyword "."
//                 doc.formatKeyword(node, ".", noSpace, noSpace)
//
//                 // EObject "member"
//                 doc.formatObject(node.member, noSpace, null)
//             }
//             is SdsParenthesizedExpression -> {
//                 // Keyword "("
//                 doc.formatKeyword(node, "(", null, noSpace)
//
//                 // EObject "expression"
//                 doc.formatObject(node.expression, noSpace, noSpace)
//
//                 // Keyword ")"
//                 doc.formatKeyword(node, ")", noSpace, null)
//             }
//             is SdsPrefixOperation -> {
//                 // Property "operator"
//                 doc.formatProperty(
//                     node,
//                     SDS_PREFIX_OPERATION__OPERATOR,
//                     prepend = null,
//                     append = if (node.operator == "not") oneSpace else noSpace,
//             )
//
//                 // EObject "operand"
//                 doc.formatObject(node.operand)
//             }
//             is SdsTemplateString -> {
//                 // Property expressions
//                 node.expressions.forEach {
//                     if (it !is SdsAbstractTemplateStringPart) {
//                         doc.formatObject(it, oneSpace, oneSpace)
//                     }
//                 }
//             }
//
//             /**********************************************************************************************************
//              * Types
//              **********************************************************************************************************/
//
//             is SdsCallableType -> {
//                 // Keyword "callable"
//                 doc.formatKeyword(node, "callable", null, oneSpace)
//
//                 // EObject "parameterList"
//                 doc.formatObject(node.parameterList, oneSpace, oneSpace)
//
//                 // EObject "resultList"
//                 doc.formatObject(node.resultList, oneSpace, null)
//             }
//             is SdsMemberType -> {
//                 // EObject "receiver"
//                 doc.formatObject(node.receiver, null, noSpace)
//
//                 // Keyword "."
//                 doc.formatKeyword(node, ".", noSpace, noSpace)
//
//                 // EObject "member"
//                 doc.formatObject(node.member, noSpace, null)
//             }
//             is SdsNamedType -> {
//                 // Property "declaration"
//                 doc.formatProperty(node, SDS_NAMED_TYPE__DECLARATION)
//
//                 // EObject "typeArgumentList"
//                 doc.formatObject(node.typeArgumentList, noSpace, noSpace)
//
//                 // Property "nullable"
//                 doc.formatProperty(node, SDS_NAMED_TYPE__NULLABLE, noSpace, null)
//             }
//             is SdsParenthesizedType -> {
//                 // Keyword "("
//                 doc.formatKeyword(node, "(", null, noSpace)
//
//                 // EObject "type"
//                 doc.formatObject(node.type, noSpace, noSpace)
//
//                 // Keyword ")"
//                 doc.formatKeyword(node, ")", noSpace, null)
//             }
//             is SdsUnionType -> {
//                 // Keyword "union"
//                 doc.formatKeyword(node, "union", null, noSpace)
//
//                 // EObject "typeArgumentList"
//                 doc.formatObject(node.typeArgumentList, noSpace, null)
//             }
//             is SdsTypeArgumentList -> {
//                 // Keyword "<"
//                 doc.formatKeyword(node, "<", null, noSpace)
//
//                 // Property "typeArguments"
//                 node.typeArguments.forEach {
//                     doc.formatObject(it)
//                 }
//
//                 // Keywords ","
//                 doc.formatCommas(node)
//
//                 // Keyword ">"
//                 doc.formatKeyword(node, ">", noSpace, null)
//             }
//             is SdsTypeArgument -> {
//                 // Property "typeParameter"
//                 doc.formatProperty(node, SDS_TYPE_ARGUMENT__TYPE_PARAMETER)
//
//                 // Keyword "="
//                 doc.formatKeyword(node, "=", oneSpace, oneSpace)
//
//                 // EObject "value"
//                 doc.formatObject(node.value)
//             }
//             is SdsTypeProjection -> {
//                 // Property "variance"
//                 doc.formatProperty(node, SDS_TYPE_PROJECTION__VARIANCE, null, oneSpace)
//
//                 // EObject "type"
//                 doc.formatObject(node.type)
//             }
//             is SdsTypeParameterList -> {
//                 // Keyword "<"
//                 doc.formatKeyword(node, "<", null, noSpace)
//
//                 // Property "typeParameters"
//                 node.typeParameters.forEach {
//                     doc.formatObject(it)
//                 }
//
//                 // Keywords ","
//                 doc.formatCommas(node)
//
//                 // Keyword ">"
//                 doc.formatKeyword(node, ">", noSpace, null)
//             }
//             is SdsTypeParameter -> {
//                 // Propertys "annotations"
//                 doc.formatAnnotations(node, inlineAnnotations = true)
//
//                 // Property "variance"
//                 if (node.annotationCallsOrEmpty().isEmpty()) {
//                     doc.formatProperty(node, SDS_TYPE_PARAMETER__VARIANCE, null, oneSpace)
//                 } else {
//                     doc.formatProperty(node, SDS_TYPE_PARAMETER__VARIANCE, oneSpace, oneSpace)
//                 }
//
//                 // Property "name"
//                 doc.formatProperty(node, SDS_ABSTRACT_DECLARATION__NAME)
//
//                 // Property "kind"
//                 doc.formatKeyword(node, "::", oneSpace, oneSpace)
//                 doc.formatProperty(node, SDS_TYPE_PARAMETER__KIND)
//             }
//             is SdsConstraint -> {
//                 // Keyword "constraint"
//                 doc.formatKeyword(node, "constraint", null, oneSpace)
//
//                 // EObject "body"
//                 doc.formatObject(node.body)
//             }
//             is SdsTypeParameterConstraint -> {
//                 // Property "leftOperand"
//                 doc.formatProperty(node, SDS_TYPE_PARAMETER_CONSTRAINT__LEFT_OPERAND, null, oneSpace)
//
//                 // Property "operator"
//                 doc.formatProperty(node, SDS_TYPE_PARAMETER_CONSTRAINT__OPERATOR, oneSpace, oneSpace)
//
//                 // EObject "rightOperand"
//                 doc.formatObject(node.rightOperand, oneSpace, null)
//             }
//         }
//     }
//
//     /**
//      * Formats comments, including test markers. Without this override formatting a file with test markers throws an
//      * exception in VS Code.
//      */
//     override fun createCommentReplacer(comment: IComment): ITextReplacer? {
//         val grammarElement = comment.grammarElement
//         if (grammarElement is TerminalRule && grammarElement.name == "TEST_MARKER") {
//         return TestMarkerReplacer(comment)
//     }
//
//     return super.createCommentReplacer(comment)
// }
//
//     /******************************************************************************************************************
//      * Helpers
//      ******************************************************************************************************************/
//
// private fun useSpacesForIndentation() {
//         val newPreferences = mutableMapOf<String, String>()
//         newPreferences[indentation.id] = "    "
//         request.preferences = MapBasedPreferenceValues(preferences, newPreferences)
//     }
//
// private fun EObject.regionForProperty(feature: EStructuralProperty): ISemanticRegion? {
//             return textRegionExtensions.regionFor(this).feature(feature)
//         }
//
//         private fun EObject.regionForKeyword(keyword: String): ISemanticRegion? {
//             return textRegionExtensions.regionFor(this).keyword(keyword)
//         }
//
//         private fun IFormattableDocument.formatObject(
//         node: EObject?,
//         prepend: KFunction1<Format, Unit>? = null,
//         append: KFunction1<Format, Unit>? = null,
// ) {
//         if (node != null) {
//             if (prepend != null) {
//                 this.prepend(node, prepend)
//             }
//             this.format(node)
//             if (append != null) {
//                 this.append(node, append)
//             }
//         }
//     }
//
// private fun IFormattableDocument.formatProperty(
//         node: EObject?,
//         feature: EStructuralProperty,
//         prepend: KFunction1<Format, Unit>? = null,
//         append: KFunction1<Format, Unit>? = null,
// ) {
//         if (node == null) {
//             return
//         }
//
//         val featureRegion = node.regionForProperty(feature)
//         if (featureRegion != null) {
//             if (prepend != null) {
//                 this.prepend(featureRegion, prepend)
//             }
//             if (append != null) {
//                 this.append(featureRegion, append)
//             }
//         }
//     }
//
// private fun IFormattableDocument.formatKeyword(
//         node: EObject?,
//         keyword: String,
//         prepend: KFunction1<Format, Unit>? = null,
//         append: KFunction1<Format, Unit>? = null,
// ) {
//         if (node == null) {
//             return
//         }
//
//         val keywordRegion = node.regionForKeyword(keyword)
//         if (keywordRegion != null) {
//             if (prepend != null) {
//                 this.prepend(keywordRegion, prepend)
//             }
//             if (append != null) {
//                 this.append(keywordRegion, append)
//             }
//         }
//     }
//
// private fun IFormattableDocument.formatAnnotations(
//         node: SdsAbstractDeclaration,
//         inlineAnnotations: Boolean = false,
// ) {
//         // Property "annotations"
//         node.annotationCallsOrEmpty().forEach {
//             format(it)
//
//             if (inlineAnnotations) {
//                 append(it, oneSpace)
//             } else {
//                 append(it, newLine)
//             }
//         }
//     }
//
// private fun IFormattableDocument.formatCommas(node: EObject) {
//         val commas = textRegionExtensions.allRegionsFor(node).keywords(",")
//         commas.forEach {
//             prepend(it, noSpace)
//             append(it, oneSpace)
//         }
//     }
// }
//
// class TestMarkerReplacer(comment: IComment) : CommentReplacer(comment) {
//     override fun createReplacements(context: ITextReplacerContext): ITextReplacerContext {
//         return context
//     }
//
//     override fun configureWhitespace(leading: WhitespaceReplacer, trailing: WhitespaceReplacer) {
//         if (comment.text == "»") {
//             trailing.formatting.space = ""
//         } else if (comment.text == "«") {
//             leading.formatting.space = ""
//         }
//     }
// }
//
// class WhitespaceCollapser(doc: IFormattableDocument, name: ISemanticRegion?) : AbstractTextReplacer(doc, name) {
//     override fun createReplacements(context: ITextReplacerContext): ITextReplacerContext {
//         context.addReplacement(collapseWhitespace())
//         return context
//     }
//
// private fun collapseWhitespace(): ITextReplacement {
//         return region.replaceWith(region.text.replace(Regex("\\s+"), ""))
//     }
// }

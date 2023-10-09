import {
    AbstractFormatter,
    AstNode,
    CstNode,
    findCommentNode,
    Formatting,
    FormattingAction,
    FormattingActionOptions,
    isAstNode,
} from 'langium';
import * as ast from '../generated/ast.js';
import { annotationCallsOrEmpty, literalsOrEmpty, typeArgumentsOrEmpty } from '../helpers/nodeProperties.js';
import { last } from 'radash';
import noSpace = Formatting.noSpace;
import newLine = Formatting.newLine;
import newLines = Formatting.newLines;
import oneSpace = Formatting.oneSpace;
import indent = Formatting.indent;

const newLinesWithIndent = function (count: number, options?: FormattingActionOptions): FormattingAction {
    return {
        options: options ?? {},
        moves: [
            {
                tabs: 1,
                lines: count,
            },
        ],
    };
};

export class SafeDsFormatter extends AbstractFormatter {
    protected override format(node: AstNode): void {
        // -----------------------------------------------------------------------------
        // Module
        // -----------------------------------------------------------------------------
        if (ast.isSdsModule(node)) {
            this.formatSdsModule(node);
        } else if (ast.isSdsImport(node)) {
            this.formatSdsImport(node);
        } else if (ast.isSdsImportedDeclarationList(node)) {
            this.formatSdsImportedDeclarationList(node);
        } else if (ast.isSdsImportedDeclaration(node)) {
            this.formatSdsImportedDeclaration(node);
        }

        // -----------------------------------------------------------------------------
        // Declarations
        // -----------------------------------------------------------------------------
        else if (ast.isSdsAnnotation(node)) {
            this.formatSdsAnnotation(node);
        } else if (ast.isSdsAttribute(node)) {
            this.formatSdsAttribute(node);
        } else if (ast.isSdsClass(node)) {
            this.formatSdsClass(node);
        } else if (ast.isSdsParentTypeList(node)) {
            this.formatSdsParentTypeList(node);
        } else if (ast.isSdsClassBody(node)) {
            this.formatSdsClassBody(node);
        } else if (ast.isSdsEnum(node)) {
            this.formatSdsEnum(node);
        } else if (ast.isSdsEnumBody(node)) {
            this.formatSdsEnumBody(node);
        } else if (ast.isSdsEnumVariant(node)) {
            this.formatSdsEnumVariant(node);
        } else if (ast.isSdsFunction(node)) {
            this.formatSdsFunction(node);
        } else if (ast.isSdsPipeline(node)) {
            this.formatSdsPipeline(node);
        } else if (ast.isSdsSegment(node)) {
            this.formatSdsSegment(node);
        }

        // -----------------------------------------------------------------------------
        // Annotation calls
        // -----------------------------------------------------------------------------
        else if (ast.isSdsAnnotationCallList(node)) {
            this.formatSdsAnnotationCallList(node);
        } else if (ast.isSdsAnnotationCall(node)) {
            this.formatSdsAnnotationCall(node);
        }

        // -----------------------------------------------------------------------------
        // Constraints
        // -----------------------------------------------------------------------------
        else if (ast.isSdsConstraintList(node)) {
            this.formatSdsConstraintList(node);
        } else if (ast.isSdsTypeParameterConstraint(node)) {
            this.formatSdsTypeParameterConstraint(node);
        }

        // -----------------------------------------------------------------------------
        // Callables, parameters, and results
        // -----------------------------------------------------------------------------
        else if (ast.isSdsParameterList(node)) {
            this.formatSdsParameterList(node);
        } else if (ast.isSdsParameter(node)) {
            this.formatSdsParameter(node);
        } else if (ast.isSdsResultList(node)) {
            this.formatSdsResultList(node);
        } else if (ast.isSdsResult(node)) {
            this.formatSdsResult(node);
        }

        // -----------------------------------------------------------------------------
        // Statements
        // -----------------------------------------------------------------------------
        else if (ast.isSdsBlock(node)) {
            this.formatSdsBlock(node);
        } else if (ast.isSdsAssignment(node)) {
            this.formatSdsAssignment(node);
        } else if (ast.isSdsAssigneeList(node)) {
            this.formatSdsAssigneeList(node);
        } else if (ast.isSdsPlaceholder(node)) {
            this.formatSdsPlaceholder(node);
        } else if (ast.isSdsYield(node)) {
            this.formatSdsYield(node);
        } else if (ast.isSdsExpressionStatement(node)) {
            this.formatSdsExpressionStatement(node);
        }

        // -----------------------------------------------------------------------------
        // Expressions
        // -----------------------------------------------------------------------------
        else if (ast.isSdsBlockLambda(node)) {
            this.formatSdsBlockLambda(node);
        } else if (ast.isSdsBlockLambdaResult(node)) {
            this.formatSdsBlockLambdaResult(node);
        } else if (ast.isSdsExpressionLambda(node)) {
            this.formatSdsExpressionLambda(node);
        } else if (ast.isSdsInfixOperation(node)) {
            this.formatSdsInfixOperation(node);
        } else if (ast.isSdsPrefixOperation(node)) {
            this.formatSdsPrefixOperation(node);
        } else if (ast.isSdsCall(node)) {
            this.formatSdsCall(node);
        } else if (ast.isSdsArgumentList(node)) {
            this.formatSdsArgumentList(node);
        } else if (ast.isSdsArgument(node)) {
            this.formatSdsArgument(node);
        } else if (ast.isSdsIndexedAccess(node)) {
            this.formatSdsIndexedAccess(node);
        } else if (ast.isSdsMemberAccess(node)) {
            this.formatSdsMemberAccess(node);
        } else if (ast.isSdsParenthesizedExpression(node)) {
            this.formatSdsParenthesizedExpression(node);
        } else if (ast.isSdsTemplateStringStart(node)) {
            this.formatSdsTemplateStringStart(node);
        } else if (ast.isSdsTemplateStringInner(node)) {
            this.formatSdsTemplateStringInner(node);
        } else if (ast.isSdsTemplateStringEnd(node)) {
            this.formatSdsTemplateStringEnd(node);
        }

        // -----------------------------------------------------------------------------
        // Types
        // -----------------------------------------------------------------------------
        else if (ast.isSdsMemberType(node)) {
            this.formatSdsMemberType(node);
        } else if (ast.isSdsCallableType(node)) {
            this.formatSdsCallableType(node);
        } else if (ast.isSdsLiteralType(node)) {
            this.formatSdsLiteralType(node);
        } else if (ast.isSdsLiteralList(node)) {
            this.formatSdsLiteralList(node);
        } else if (ast.isSdsNamedType(node)) {
            this.formatSdsNamedType(node);
        } else if (ast.isSdsUnionType(node)) {
            this.formatSdsUnionType(node);
        } else if (ast.isSdsTypeParameterList(node)) {
            this.formatSdsTypeParameterList(node);
        } else if (ast.isSdsTypeParameter(node)) {
            this.formatSdsTypeParameter(node);
        } else if (ast.isSdsTypeArgumentList(node)) {
            this.formatSdsTypeArgumentList(node);
        } else if (ast.isSdsTypeArgument(node)) {
            this.formatSdsTypeArgument(node);
        }

        // -----------------------------------------------------------------------------
        // Schemas
        // -----------------------------------------------------------------------------
        else if (ast.isSdsSchema(node)) {
            this.formatSdsSchema(node);
        } else if (ast.isSdsColumnList(node)) {
            this.formatSdsColumnList(node);
        } else if (ast.isSdsColumn(node)) {
            this.formatSdsColumn(node);
        }
    }

    // -----------------------------------------------------------------------------
    // Module
    // -----------------------------------------------------------------------------

    private formatSdsModule(node: ast.SdsModule): void {
        const formatter = this.getNodeFormatter(node);
        const annotations = annotationCallsOrEmpty(node);
        const name = node.name;
        const imports = node.imports;
        const members = node.members;

        // Annotations
        annotations.forEach((value, index) => {
            if (index === 0) {
                if (this.hasComment(value)) {
                    formatter.node(value).prepend(newLine());
                } else {
                    formatter.node(value).prepend(noSpace());
                }
            } else {
                formatter.node(value).prepend(newLines(1));
            }
        });

        // Package
        if (annotations.length === 0) {
            const packageKeyword = formatter.keyword('package');
            const cstNodes = packageKeyword.nodes;

            if (cstNodes.length > 0 && this.hasComment(cstNodes[0])) {
                packageKeyword.prepend(newLine());
            } else {
                packageKeyword.prepend(noSpace());
            }
        } else {
            formatter.keyword('package').prepend(newLines(2));
        }
        formatter.keyword('package').append(oneSpace());
        formatter.keyword('.').surround(noSpace());

        // Imports
        imports.forEach((value, index) => {
            if (index === 0) {
                if (annotations.length === 0 && !name) {
                    if (this.hasComment(value)) {
                        formatter.node(value).prepend(newLine());
                    } else {
                        formatter.node(value).prepend(noSpace());
                    }
                } else {
                    formatter.node(value).prepend(newLines(2));
                }
            } else {
                formatter.node(value).prepend(newLines(1));
            }
        });

        // Members
        members.forEach((value, index) => {
            if (index === 0) {
                if (annotations.length === 0 && !name && imports.length === 0) {
                    if (this.hasComment(value)) {
                        formatter.node(value).prepend(newLine());
                    } else {
                        formatter.node(value).prepend(noSpace());
                    }
                } else {
                    const valueAnnotations = annotationCallsOrEmpty(value);
                    if (valueAnnotations.length > 0) {
                        formatter.node(valueAnnotations[0]).prepend(newLines(2));
                    } else {
                        formatter.node(value).prepend(newLines(2));
                    }
                }
            } else {
                const valueAnnotations = annotationCallsOrEmpty(value);
                if (valueAnnotations.length > 0) {
                    formatter.node(valueAnnotations[0]).prepend(newLines(2));
                } else {
                    formatter.node(value).prepend(newLines(2));
                }
            }
        });
    }

    private formatSdsImport(node: ast.SdsImport): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('from').append(oneSpace());
        formatter.keyword('.').surround(noSpace());
        formatter.keyword('import').surround(oneSpace());
    }

    private formatSdsImportedDeclarationList(node: ast.SdsImportedDeclarationList): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keywords(',').prepend(noSpace()).append(oneSpace());
    }

    private formatSdsImportedDeclaration(node: ast.SdsImportedDeclaration): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('as').surround(Formatting.oneSpace());
    }

    // -----------------------------------------------------------------------------
    // Declarations
    // -----------------------------------------------------------------------------

    private formatSdsAnnotation(node: ast.SdsAnnotation): void {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length > 0) {
            formatter.keyword('annotation').prepend(newLine());
        }

        formatter.property('name').prepend(oneSpace());
        formatter.property('parameterList').prepend(noSpace());
        formatter.property('constraintList').prepend(oneSpace());
    }

    private formatSdsAttribute(node: ast.SdsAttribute): void {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length > 0) {
            if (node.isStatic) {
                formatter.keyword('static').prepend(newLine());
            } else {
                formatter.keyword('attr').prepend(newLine());
            }
        }

        formatter.keyword('static').append(oneSpace());
        formatter.property('name').prepend(oneSpace());
        formatter.keyword(':').prepend(noSpace()).append(oneSpace());
    }

    private formatSdsClass(node: ast.SdsClass): void {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length > 0) {
            formatter.keyword('class').prepend(newLine());
        }

        formatter.property('name').prepend(oneSpace());
        formatter.property('typeParameterList').prepend(noSpace());
        formatter.property('parameterList').prepend(noSpace());
        formatter.property('parentTypeList').prepend(oneSpace());
        formatter.property('constraintList').prepend(oneSpace());

        if (node.constraintList) {
            formatter.property('body').prepend(newLine());
        } else {
            formatter.property('body').prepend(oneSpace());
        }
    }

    formatSdsParentTypeList(node: ast.SdsParentTypeList): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('sub').append(oneSpace());
        formatter.keywords(',').prepend(noSpace()).append(oneSpace());
    }

    private formatSdsClassBody(node: ast.SdsClassBody): void {
        const formatter = this.getNodeFormatter(node);

        const members = node.members ?? [];
        if (members.length === 0) {
            formatter.keyword('{').append(noSpace());
            formatter.keyword('}').prepend(noSpace());
        } else {
            members.forEach((value, index) => {
                if (index === 0) {
                    formatter.node(value).prepend(indent());
                } else {
                    formatter.node(value).prepend(newLinesWithIndent(2));
                }
            });
            formatter.keyword('}').prepend(newLine());
        }
    }

    private formatSdsEnum(node: ast.SdsEnum): void {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length > 0) {
            formatter.keyword('enum').prepend(newLine());
        }

        formatter.property('name').prepend(oneSpace());
        formatter.property('body').prepend(oneSpace());
    }

    private formatSdsEnumBody(node: ast.SdsEnumBody): void {
        const formatter = this.getNodeFormatter(node);

        const variants = node.variants ?? [];
        if (variants.length === 0) {
            formatter.keyword('{').append(noSpace());
            formatter.keyword('}').prepend(noSpace());
        } else {
            variants.forEach((value, index) => {
                if (index === 0) {
                    formatter.node(value).prepend(indent());
                } else {
                    formatter.node(value).prepend(newLinesWithIndent(2));
                }
            });
            formatter.keyword('}').prepend(newLine());
        }
    }

    private formatSdsEnumVariant(node: ast.SdsEnumVariant): void {
        const formatter = this.getNodeFormatter(node);

        const annotationCalls = annotationCallsOrEmpty(node);

        formatter.nodes(...annotationCalls.slice(1)).prepend(newLine());

        if (annotationCallsOrEmpty(node).length > 0) {
            formatter.property('name').prepend(newLine());
        }

        formatter.property('typeParameterList').prepend(noSpace());
        formatter.property('parameterList').prepend(noSpace());
        formatter.property('constraintList').prepend(oneSpace());
    }

    formatSdsFunction(node: ast.SdsFunction): void {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length > 0) {
            if (node.isStatic) {
                formatter.keyword('static').prepend(newLine());
            } else {
                formatter.keyword('fun').prepend(newLine());
            }
        }

        formatter.keyword('static').append(oneSpace());
        formatter.property('name').prepend(oneSpace());
        formatter.property('typeParameterList').prepend(noSpace());
        formatter.property('parameterList').prepend(noSpace());
        formatter.property('resultList').prepend(oneSpace());
        formatter.property('constraintList').prepend(oneSpace());
    }

    private formatSdsPipeline(node: ast.SdsPipeline): void {
        const formatter = this.getNodeFormatter(node);

        formatter.property('annotationCallList').prepend(noSpace());

        if (annotationCallsOrEmpty(node).length > 0) {
            formatter.keyword('pipeline').prepend(newLine());
        }

        formatter.property('name').prepend(oneSpace());
        formatter.node(node.body).prepend(oneSpace());
    }

    private formatSdsSegment(node: ast.SdsSegment): void {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length === 0) {
            if (node.visibility) {
                formatter.keyword('segment').prepend(oneSpace());
            }
        } else {
            if (node.visibility) {
                formatter.property('visibility').prepend(newLine());
                formatter.keyword('segment').prepend(oneSpace());
            } else {
                formatter.keyword('segment').prepend(newLine());
            }
        }

        formatter.property('name').prepend(oneSpace());
        formatter.property('parameterList').prepend(noSpace());
        formatter.property('resultList').prepend(oneSpace());
        formatter.property('body').prepend(oneSpace());
    }

    // -----------------------------------------------------------------------------
    // Annotation calls
    // -----------------------------------------------------------------------------

    private formatSdsAnnotationCallList(node: ast.SdsAnnotationCallList): void {
        const formatter = this.getNodeFormatter(node);
        const annotationCalls = node.annotationCalls ?? [];

        formatter.nodes(...annotationCalls.slice(1)).prepend(newLine());
    }

    private formatSdsAnnotationCall(node: ast.SdsAnnotationCall): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('@').append(noSpace());
        formatter.property('argumentList').prepend(noSpace());
    }

    // -----------------------------------------------------------------------------
    // Constraints
    // -----------------------------------------------------------------------------

    private formatSdsConstraintList(node: ast.SdsConstraintList) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('where').append(oneSpace());

        const openingBrace = formatter.keyword('{');
        const closingBrace = formatter.keyword('}');

        const constraints = node.constraints ?? [];

        if (constraints.length === 0) {
            openingBrace.append(noSpace());
            closingBrace.prepend(noSpace());
        } else {
            formatter.nodes(...constraints).prepend(indent());
            formatter.keywords(',').prepend(noSpace());
            closingBrace.prepend(newLine());
        }
    }

    private formatSdsTypeParameterConstraint(node: ast.SdsTypeParameterConstraint) {
        const formatter = this.getNodeFormatter(node);

        formatter.property('operator').surround(oneSpace());
    }

    // -----------------------------------------------------------------------------
    // Callables, parameters, and results
    // -----------------------------------------------------------------------------

    private formatSdsParameterList(node: ast.SdsParameterList): void {
        const formatter = this.getNodeFormatter(node);

        const openingParenthesis = formatter.keyword('(');
        const closingParenthesis = formatter.keyword(')');

        const parameters = node.parameters ?? [];

        if (
            parameters.length >= 3 ||
            parameters.some((it) => annotationCallsOrEmpty(it).length > 0 || this.isComplexType(it.type))
        ) {
            formatter.nodes(...parameters).prepend(indent());
            formatter.keywords(',').prepend(noSpace());
            closingParenthesis.prepend(newLine());
        } else {
            openingParenthesis.append(noSpace());
            formatter.nodes(...parameters.slice(1)).prepend(oneSpace());
            formatter.keywords(',').prepend(noSpace());
            closingParenthesis.prepend(noSpace());
        }
    }

    private formatSdsParameter(node: ast.SdsParameter): void {
        const formatter = this.getNodeFormatter(node);

        const lastAnnotationCall = last(annotationCallsOrEmpty(node));
        if (lastAnnotationCall) {
            formatter.node(lastAnnotationCall).append(newLine());
        }

        formatter.keyword('const').append(oneSpace());
        formatter.keyword('vararg').append(oneSpace());
        formatter.keyword(':').prepend(noSpace()).append(oneSpace());
        formatter.keyword('=').surround(oneSpace());
    }

    private formatSdsResultList(node: ast.SdsResultList): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('->').surround(oneSpace());

        const openingParenthesis = formatter.keyword('(');
        const closingParenthesis = formatter.keyword(')');

        const results = node.results ?? [];

        if (
            results.length >= 3 ||
            results.some((it) => annotationCallsOrEmpty(it).length > 0 || this.isComplexType(it.type))
        ) {
            formatter.nodes(...results).prepend(indent());
            formatter.keywords(',').prepend(noSpace());
            closingParenthesis.prepend(newLine());
        } else {
            openingParenthesis.append(noSpace());
            formatter.nodes(...results.slice(1)).prepend(oneSpace());
            formatter.keywords(',').prepend(noSpace());
            closingParenthesis.prepend(noSpace());
        }
    }

    private formatSdsResult(node: ast.SdsResult): void {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length > 0) {
            formatter.property('name').prepend(newLine());
        }

        formatter.keyword(':').prepend(noSpace()).append(oneSpace());
    }

    // -----------------------------------------------------------------------------
    // Statements
    // -----------------------------------------------------------------------------

    private formatSdsBlock(node: ast.SdsBlock): void {
        const formatter = this.getNodeFormatter(node);
        const openingBrace = formatter.keyword('{');
        const closingBrace = formatter.keyword('}');

        if (node.statements.length === 0) {
            openingBrace.append(noSpace());
            closingBrace.prepend(noSpace());
        } else {
            formatter.nodes(...node.statements).prepend(indent({ allowMore: true }));
            closingBrace.prepend(newLine());
        }
    }

    private formatSdsAssignment(node: ast.SdsAssignment) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('=').surround(oneSpace());
        formatter.keyword(';').prepend(noSpace());
    }

    private formatSdsAssigneeList(node: ast.SdsAssigneeList) {
        const formatter = this.getNodeFormatter(node);

        formatter.keywords(',').prepend(noSpace()).append(oneSpace());
    }

    private formatSdsPlaceholder(node: ast.SdsPlaceholder) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('val').append(oneSpace());
    }

    private formatSdsYield(node: ast.SdsYield) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('yield').append(oneSpace());
        formatter.property('result').prepend(oneSpace());
    }

    private formatSdsExpressionStatement(node: ast.SdsExpressionStatement) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword(';').prepend(noSpace());
    }

    // -----------------------------------------------------------------------------
    // Expressions
    // -----------------------------------------------------------------------------

    private formatSdsBlockLambda(node: ast.SdsBlockLambda): void {
        const formatter = this.getNodeFormatter(node);

        formatter.property('body').prepend(oneSpace());
    }

    private formatSdsBlockLambdaResult(node: ast.SdsBlockLambdaResult) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('yield').append(oneSpace());
    }

    private formatSdsExpressionLambda(node: ast.SdsExpressionLambda) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('->').surround(oneSpace());
    }

    private formatSdsInfixOperation(node: ast.SdsInfixOperation) {
        const formatter = this.getNodeFormatter(node);

        formatter.property('operator').surround(oneSpace());
    }

    private formatSdsPrefixOperation(node: ast.SdsPrefixOperation) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('not').append(oneSpace());
        formatter.keyword('-').append(noSpace());
    }

    private formatSdsCall(node: ast.SdsCall) {
        const formatter = this.getNodeFormatter(node);

        formatter.property('argumentList').prepend(noSpace());
    }

    private formatSdsArgumentList(node: ast.SdsArgumentList): void {
        const formatter = this.getNodeFormatter(node);

        const openingParenthesis = formatter.keyword('(');
        const closingParenthesis = formatter.keyword(')');

        const args = node.arguments ?? [];

        if (args.length >= 3 || args.some((it) => this.isComplexExpression(it.value))) {
            formatter.nodes(...args).prepend(indent());
            formatter.keywords(',').prepend(noSpace());
            closingParenthesis.prepend(newLine());
        } else {
            openingParenthesis.append(noSpace());
            formatter.nodes(...args.slice(1)).prepend(oneSpace());
            formatter.keywords(',').prepend(noSpace());
            closingParenthesis.prepend(noSpace());
        }
    }

    private formatSdsArgument(node: ast.SdsArgument): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('=').surround(oneSpace());
    }

    private formatSdsIndexedAccess(node: ast.SdsIndexedAccess) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('[').surround(noSpace());
        formatter.keyword(']').prepend(noSpace());
    }

    private formatSdsMemberAccess(node: ast.SdsMemberAccess) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('?').surround(noSpace());
        formatter.keyword('.').surround(noSpace());
    }

    private formatSdsParenthesizedExpression(node: ast.SdsParenthesizedExpression): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('(').append(noSpace());
        formatter.keyword(')').prepend(noSpace());
    }

    private formatSdsTemplateStringStart(node: ast.SdsTemplateStringStart) {
        const formatter = this.getNodeFormatter(node);

        formatter.node(node).append(oneSpace());
    }

    private formatSdsTemplateStringInner(node: ast.SdsTemplateStringInner) {
        const formatter = this.getNodeFormatter(node);

        formatter.node(node).surround(oneSpace());
    }

    private formatSdsTemplateStringEnd(node: ast.SdsTemplateStringEnd) {
        const formatter = this.getNodeFormatter(node);

        formatter.node(node).prepend(oneSpace());
    }

    /**
     * Returns whether the expression is considered complex and requires special formatting like placing the associated
     * argument on its own line.
     *
     * @param node The expression to check.
     */
    private isComplexExpression(node: ast.SdsExpression | undefined): boolean {
        return ast.isSdsChainedExpression(node);
    }

    // -----------------------------------------------------------------------------
    // Types
    // -----------------------------------------------------------------------------

    private formatSdsMemberType(node: ast.SdsMemberType) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('.').surround(noSpace());
    }

    private formatSdsCallableType(node: ast.SdsCallableType) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('->').surround(oneSpace());
    }

    private formatSdsLiteralType(node: ast.SdsLiteralType): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('literal').append(noSpace());
    }

    private formatSdsLiteralList(node: ast.SdsLiteralList): void {
        const formatter = this.getNodeFormatter(node);
        const literals = node.literals ?? [];

        if (literals.length > 0) {
            formatter.node(literals[0]).prepend(noSpace());
            formatter.nodes(...literals.slice(1)).prepend(oneSpace());
        }

        formatter.keywords(',').prepend(noSpace());
        formatter.keyword('>').prepend(noSpace());
    }

    private formatSdsNamedType(node: ast.SdsNamedType) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('?').prepend(noSpace());
        formatter.property('typeArgumentList').prepend(noSpace());
    }

    private formatSdsUnionType(node: ast.SdsUnionType): void {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('union').append(noSpace());
    }

    private formatSdsTypeParameterList(node: ast.SdsTypeParameterList): void {
        const formatter = this.getNodeFormatter(node);

        const closingBracket = formatter.keyword('>');

        const typeParameters = node.typeParameters ?? [];

        if (typeParameters.length >= 3 || typeParameters.some((it) => annotationCallsOrEmpty(it).length > 0)) {
            formatter.nodes(...typeParameters).prepend(indent());
            formatter.keywords(',').prepend(noSpace());
            closingBracket.prepend(newLine());
        } else {
            if (typeParameters.length > 0) {
                formatter.node(typeParameters[0]).prepend(noSpace());
                formatter.nodes(...typeParameters.slice(1)).prepend(oneSpace());
            }
            formatter.keywords(',').prepend(noSpace());
            closingBracket.prepend(noSpace());
        }
    }

    private formatSdsTypeParameter(node: ast.SdsTypeParameter) {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length > 0) {
            if (node.variance) {
                formatter.property('variance').prepend(newLine());
            } else {
                formatter.property('name').prepend(newLine());
            }
        }

        formatter.property('variance').append(oneSpace());
    }

    private formatSdsTypeArgumentList(node: ast.SdsTypeArgumentList): void {
        const formatter = this.getNodeFormatter(node);
        const typeArguments = node.typeArguments ?? [];

        if (typeArguments.length > 0) {
            formatter.node(typeArguments[0]).prepend(noSpace());
            formatter.nodes(...typeArguments.slice(1)).prepend(oneSpace());
        }

        formatter.keywords(',').prepend(noSpace());
        formatter.keyword('>').prepend(noSpace());
    }

    private formatSdsTypeArgument(node: ast.SdsTypeArgument) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword('=').surround(oneSpace());
    }

    /**
     * Returns whether the type is considered complex and requires special formatting like placing the associated
     * parameter on its own line.
     *
     * @param node The type to check.
     */
    private isComplexType(node: ast.SdsType | undefined): boolean {
        if (!node) {
            return false;
        }

        if (ast.isSdsCallableType(node) || ast.isSdsMemberType(node)) {
            return true;
        } else if (ast.isSdsLiteralType(node)) {
            return literalsOrEmpty(node).length > 0;
        } else if (ast.isSdsNamedType(node)) {
            return typeArgumentsOrEmpty(node.typeArgumentList).length > 0;
        } else if (ast.isSdsUnionType(node)) {
            return typeArgumentsOrEmpty(node.typeArgumentList).length > 0;
        } else {
            /* c8 ignore next 2 */
            return false;
        }
    }

    // -----------------------------------------------------------------------------
    // Schemas
    // -----------------------------------------------------------------------------

    private formatSdsSchema(node: ast.SdsSchema) {
        const formatter = this.getNodeFormatter(node);

        if (annotationCallsOrEmpty(node).length > 0) {
            formatter.keyword('schema').prepend(newLine());
        }

        formatter.property('name').prepend(oneSpace());
        formatter.property('columnList').prepend(oneSpace());
    }

    private formatSdsColumnList(node: ast.SdsColumnList) {
        const formatter = this.getNodeFormatter(node);
        const columns = node.columns ?? [];

        if (columns.length === 0) {
            formatter.keyword('{').append(noSpace());
            formatter.keyword('}').prepend(noSpace());
        } else {
            formatter.nodes(...columns).prepend(indent());
            formatter.keywords(',').prepend(noSpace());
            formatter.keyword('}').prepend(newLine());
        }
    }

    private formatSdsColumn(node: ast.SdsColumn) {
        const formatter = this.getNodeFormatter(node);

        formatter.keyword(':').prepend(noSpace()).append(oneSpace());
    }

    // -----------------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------------

    /**
     * Returns whether the given node has a comment associated with it.
     *
     * @param node The node to check.
     */
    private hasComment(node: AstNode | CstNode | undefined): boolean {
        return Boolean(this.getCommentNode(node));
    }

    /**
     * Returns the comment associated with the given node.
     *
     * @param node The node to get the comment for.
     */
    private getCommentNode(node: AstNode | CstNode | undefined): CstNode | undefined {
        const commentNames = ['ML_COMMENT', 'SL_COMMENT'];

        if (isAstNode(node)) {
            return findCommentNode(node.$cstNode, commentNames);
        } else {
            return findCommentNode(node, commentNames);
        }
    }
}

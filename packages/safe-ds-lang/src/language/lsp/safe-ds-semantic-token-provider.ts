import { AbstractSemanticTokenProvider, SemanticTokenAcceptor } from 'langium/lsp';
import { AstNode, AstUtils } from 'langium';
import { SemanticTokenModifiers, SemanticTokenTypes } from 'vscode-languageserver';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import {
    isSdsAnnotation,
    isSdsAnnotationCall,
    isSdsArgument,
    isSdsAttribute,
    isSdsBlockLambdaResult,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsImport,
    isSdsImportedDeclaration,
    isSdsModule,
    isSdsNamedType,
    isSdsParameter,
    isSdsParameterBound,
    isSdsPipeline,
    isSdsPlaceholder,
    isSdsReference,
    isSdsResult,
    isSdsSegment,
    isSdsTypeAlias,
    isSdsTypeArgument,
    isSdsTypeParameter,
    isSdsYield,
} from '../generated/ast.js';
import { SafeDsServices } from '../safe-ds-module.js';

export class SafeDsSemanticTokenProvider extends AbstractSemanticTokenProvider {
    private readonly builtinClasses: SafeDsClasses;

    constructor(services: SafeDsServices) {
        super(services);

        this.builtinClasses = services.builtins.Classes;
    }

    protected highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void {
        if (isSdsAnnotationCall(node)) {
            acceptor({
                node,
                keyword: '@',
                type: SemanticTokenTypes.decorator,
            });
            acceptor({
                node,
                property: 'annotation',
                type: SemanticTokenTypes.decorator,
            });
        } else if (isSdsArgument(node)) {
            if (node.parameter) {
                acceptor({
                    node,
                    property: 'parameter',
                    type: SemanticTokenTypes.parameter,
                });
            }
        } else if (isSdsDeclaration(node)) {
            const info = this.computeSemanticTokenInfoForDeclaration(node, [SemanticTokenModifiers.declaration]);
            if (info) {
                acceptor({
                    node,
                    property: 'name',
                    ...info,
                });
            }
        } else if (isSdsImport(node)) {
            acceptor({
                node,
                property: 'package',
                type: SemanticTokenTypes.namespace,
            });
        } else if (isSdsImportedDeclaration(node)) {
            const info = this.computeSemanticTokenInfoForDeclaration(node.declaration?.ref);
            if (info) {
                acceptor({
                    node,
                    property: 'declaration',
                    ...info,
                });
            }
        } else if (isSdsNamedType(node)) {
            const info = this.computeSemanticTokenInfoForDeclaration(node.declaration?.ref);
            if (info) {
                acceptor({
                    node,
                    property: 'declaration',
                    ...info,
                });
            }
        } else if (isSdsParameterBound(node)) {
            acceptor({
                node,
                property: 'leftOperand',
                type: SemanticTokenTypes.parameter,
            });
        } else if (isSdsReference(node)) {
            const info = this.computeSemanticTokenInfoForDeclaration(node.target.ref);
            if (info) {
                acceptor({
                    node,
                    property: 'target',
                    ...info,
                });
            }
        } else if (isSdsTypeArgument(node)) {
            if (node.typeParameter) {
                acceptor({
                    node,
                    property: 'typeParameter',
                    type: SemanticTokenTypes.typeParameter,
                });
            }
        } else if (isSdsYield(node)) {
            // For lack of a better option, we use the token type for parameters here
            acceptor({
                node,
                property: 'result',
                type: SemanticTokenTypes.parameter,
            });
        }
    }

    private computeSemanticTokenInfoForDeclaration(
        node: AstNode | undefined,
        additionalModifiers: SemanticTokenModifiers[] = [],
    ): SemanticTokenInfo | void {
        /* c8 ignore start */
        if (!node) {
            return;
        }
        /* c8 ignore stop */

        if (isSdsAnnotation(node)) {
            return {
                type: SemanticTokenTypes.decorator,
                modifier: additionalModifiers,
            };
        } else if (isSdsAttribute(node)) {
            const modifier = [SemanticTokenModifiers.readonly, ...additionalModifiers];
            if (node.isStatic) {
                modifier.push(SemanticTokenModifiers.static);
            }

            return {
                type: SemanticTokenTypes.property,
                modifier,
            };
        } else if (isSdsBlockLambdaResult(node)) {
            return {
                // For lack of a better option, we use the token type for parameters here
                type: SemanticTokenTypes.parameter,
                modifier: additionalModifiers,
            };
        } else if (isSdsClass(node)) {
            const isBuiltinClass = this.builtinClasses.isBuiltinClass(node);
            return {
                type: SemanticTokenTypes.class,
                modifier: isBuiltinClass
                    ? [SemanticTokenModifiers.defaultLibrary, ...additionalModifiers]
                    : additionalModifiers,
            };
        } else if (isSdsEnum(node)) {
            return {
                type: SemanticTokenTypes.enum,
                modifier: additionalModifiers,
            };
        } else if (isSdsEnumVariant(node)) {
            return {
                type: SemanticTokenTypes.enumMember,
                modifier: additionalModifiers,
            };
        } else if (isSdsFunction(node)) {
            if (AstUtils.hasContainerOfType(node, isSdsClass)) {
                return {
                    type: SemanticTokenTypes.method,
                    modifier: node.isStatic
                        ? [SemanticTokenModifiers.static, ...additionalModifiers]
                        : additionalModifiers,
                };
            } else {
                return {
                    type: SemanticTokenTypes.function,
                    modifier: additionalModifiers,
                };
            }
        } else if (isSdsModule(node)) {
            return {
                type: SemanticTokenTypes.namespace,
                modifier: additionalModifiers,
            };
        } else if (isSdsParameter(node)) {
            return {
                type: SemanticTokenTypes.parameter,
                modifier: additionalModifiers,
            };
        } else if (isSdsPipeline(node)) {
            return {
                type: SemanticTokenTypes.function,
                modifier: additionalModifiers,
            };
        } else if (isSdsPlaceholder(node)) {
            return {
                type: SemanticTokenTypes.variable,
                modifier: [SemanticTokenModifiers.readonly, ...additionalModifiers],
            };
        } else if (isSdsResult(node)) {
            return {
                // For lack of a better option, we use the token type for parameters here
                type: SemanticTokenTypes.parameter,
                modifier: additionalModifiers,
            };
        } else if (isSdsSegment(node)) {
            return {
                type: SemanticTokenTypes.function,
                modifier: additionalModifiers,
            };
        } else if (isSdsTypeAlias(node)) {
            return {
                type: SemanticTokenTypes.type,
                modifier: additionalModifiers,
            };
        } else if (isSdsTypeParameter(node)) {
            return {
                type: SemanticTokenTypes.typeParameter,
                modifier: additionalModifiers,
            };
        }
    }
}

interface SemanticTokenInfo {
    type: SemanticTokenTypes;
    modifier?: SemanticTokenModifiers | SemanticTokenModifiers[];
}

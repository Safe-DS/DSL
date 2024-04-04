import { AstNode, DocumentationProvider } from 'langium';
import { InlayHintKind, MarkupContent } from 'vscode-languageserver';
import { createMarkupContent } from '../documentation/safe-ds-comment-provider.js';
import { isSdsArgument, isSdsBlockLambdaResult, isSdsPlaceholder, isSdsYield } from '../generated/ast.js';
import { Argument } from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { NamedType } from '../typing/model.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { AbstractInlayHintProvider, InlayHintAcceptor } from 'langium/lsp';

export class SafeDsInlayHintProvider extends AbstractInlayHintProvider {
    private readonly documentationProvider: DocumentationProvider;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        super();

        this.documentationProvider = services.documentation.DocumentationProvider;
        this.nodeMapper = services.helpers.NodeMapper;
        this.typeComputer = services.typing.TypeComputer;
    }

    override computeInlayHint(node: AstNode, acceptor: InlayHintAcceptor) {
        const cstNode = node.$cstNode;
        /* c8 ignore start */
        if (!cstNode) {
            return;
        }
        /* c8 ignore stop */

        if (isSdsArgument(node) && Argument.isPositional(node)) {
            const parameter = this.nodeMapper.argumentToParameter(node);
            if (parameter) {
                acceptor({
                    position: cstNode.range.start,
                    label: `${parameter.name} = `,
                    kind: InlayHintKind.Parameter,
                    tooltip: createMarkupContent(this.documentationProvider.getDocumentation(parameter)),
                });
            }
        } else if (isSdsBlockLambdaResult(node) || isSdsPlaceholder(node) || isSdsYield(node)) {
            const type = this.typeComputer.computeType(node);
            let tooltip: MarkupContent | undefined = undefined;
            if (type instanceof NamedType) {
                tooltip = createMarkupContent(this.documentationProvider.getDocumentation(type.declaration));
            }

            acceptor({
                position: cstNode.range.end,
                label: `: ${type}`,
                kind: InlayHintKind.Type,
                tooltip,
            });
        }
    }
}

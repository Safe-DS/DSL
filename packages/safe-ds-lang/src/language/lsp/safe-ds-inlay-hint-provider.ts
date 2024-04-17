import { AstNode, AstUtils, CstNode } from 'langium';
import { InlayHintKind } from 'vscode-languageserver';
import { createMarkupContent } from '../documentation/safe-ds-comment-provider.js';
import {
    isSdsArgument,
    isSdsBlockLambdaResult,
    isSdsLambda,
    isSdsLiteral,
    isSdsParameter,
    isSdsPlaceholder,
    isSdsReference,
    isSdsYield,
} from '../generated/ast.js';
import { Argument } from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { NamedType, UnknownType } from '../typing/model.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { AbstractInlayHintProvider, InlayHintAcceptor } from 'langium/lsp';
import { SafeDsSettingsProvider } from '../workspace/safe-ds-settings-provider.js';
import { CompositeGeneratorNode, toString } from 'langium/generate';
import { SafeDsDocumentationProvider } from '../documentation/safe-ds-documentation-provider.js';

export class SafeDsInlayHintProvider extends AbstractInlayHintProvider {
    private readonly settingsProvider: SafeDsSettingsProvider;
    private readonly documentationProvider: SafeDsDocumentationProvider;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        super();

        this.settingsProvider = services.workspace.SettingsProvider;
        this.documentationProvider = services.documentation.DocumentationProvider;
        this.nodeMapper = services.helpers.NodeMapper;
        this.typeComputer = services.typing.TypeComputer;
    }

    override computeInlayHint(node: AstNode, acceptor: InlayHintAcceptor): void {
        const cstNode = node.$cstNode;
        if (!cstNode) {
            /* c8 ignore next 2 */
            return;
        }

        this.computeAssigneeTypeInlayHint(node, cstNode, acceptor);
        this.computeLambdaParameterTypeInlayHint(node, cstNode, acceptor);
        this.computeParameterNameInlayHint(node, cstNode, acceptor);
    }

    private computeAssigneeTypeInlayHint(node: AstNode, cstNode: CstNode, acceptor: InlayHintAcceptor) {
        if (
            this.settingsProvider.shouldShowAssigneeTypeInlayHints() &&
            (isSdsBlockLambdaResult(node) || isSdsPlaceholder(node) || isSdsYield(node))
        ) {
            this.computeTypeInlayHint(node, cstNode, acceptor);
        }
    }

    private computeLambdaParameterTypeInlayHint(node: AstNode, cstNode: CstNode, acceptor: InlayHintAcceptor) {
        if (
            this.settingsProvider.shouldShowLambdaParameterTypeInlayHints() &&
            isSdsParameter(node) &&
            AstUtils.hasContainerOfType(node, isSdsLambda) &&
            !node.type
        ) {
            this.computeTypeInlayHint(node, cstNode, acceptor);
        }
    }

    private computeParameterNameInlayHint(node: AstNode, cstNode: CstNode, acceptor: InlayHintAcceptor) {
        if (!isSdsArgument(node) || !Argument.isPositional(node)) {
            return;
        }

        const shouldShowParameterNameInlayHints = this.settingsProvider.shouldShowParameterNameInlayHints();
        if (shouldShowParameterNameInlayHints === 'none') {
            return;
        }

        const parameter = this.nodeMapper.argumentToParameter(node);
        if (!parameter) {
            return;
        }

        const value = node.value;
        if (
            (shouldShowParameterNameInlayHints === 'onlyLiterals' && !isSdsLiteral(value)) ||
            (shouldShowParameterNameInlayHints === 'exceptReferences' && isSdsReference(value))
        ) {
            return;
        }

        acceptor({
            position: cstNode.range.start,
            label: `${parameter.name} = `,
            kind: InlayHintKind.Parameter,
            tooltip: createMarkupContent(this.documentationProvider.getDocumentation(parameter)),
        });
    }

    private computeTypeInlayHint(node: AstNode, cstNode: CstNode, acceptor: InlayHintAcceptor) {
        const type = this.typeComputer.computeType(node);
        if (type === UnknownType) {
            return;
        }

        const shortTypeString = type.toString({
            collapseClassTypes: this.settingsProvider.shouldCollapseClassTypesInInlayHints(),
            collapseLiteralTypes: this.settingsProvider.shouldCollapseLiteralTypesInInlayHints(),
        });
        const longTypeString = type.toString();

        // Create a tooltip
        let tooltip = new CompositeGeneratorNode().appendTemplateIf(shortTypeString !== longTypeString)`
            \`\`\`safe-ds-dev
            ${longTypeString}
            \`\`\`
        `;

        if (type instanceof NamedType) {
            tooltip.appendNewLineIfNotEmpty();
            tooltip.append(this.documentationProvider.getDescription(type.declaration));
        }

        acceptor({
            position: cstNode.range.end,
            label: `: ${shortTypeString}`,
            kind: InlayHintKind.Type,
            tooltip: createMarkupContent(toString(tooltip)),
        });
    }
}

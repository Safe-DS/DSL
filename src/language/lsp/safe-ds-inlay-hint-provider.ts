import { AbstractInlayHintProvider, AstNode, InlayHintAcceptor } from 'langium';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { isSdsArgument, isSdsBlockLambdaResult, isSdsPlaceholder } from '../generated/ast.js';
import { isPositionalArgument } from '../helpers/nodeProperties.js';
import { InlayHintKind } from 'vscode-languageserver';

export class SafeDsInlayHintProvider extends AbstractInlayHintProvider {
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        super();

        this.nodeMapper = services.helpers.NodeMapper;
        this.typeComputer = services.types.TypeComputer;
    }

    override computeInlayHint(node: AstNode, acceptor: InlayHintAcceptor) {
        const cstNode = node.$cstNode;
        if (!cstNode) {
            return;
        }

        if (isSdsArgument(node) && isPositionalArgument(node)) {
            const parameter = this.nodeMapper.argumentToParameter(node);
            if (parameter) {
                acceptor({
                    position: cstNode.range.start,
                    label: `${parameter.name} = `,
                    kind: InlayHintKind.Parameter,
                });
            }
        } else if (isSdsBlockLambdaResult(node) || isSdsPlaceholder(node)) {
            const type = this.typeComputer.computeType(node);
            acceptor({
                position: cstNode.range.end,
                label: `: ${type}`,
                kind: InlayHintKind.Type,
            });
        }
    }
}

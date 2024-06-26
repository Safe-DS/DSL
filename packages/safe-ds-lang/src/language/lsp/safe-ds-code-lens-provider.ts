import { CodeLensProvider } from 'langium/lsp';
import { CancellationToken, CodeLens, type CodeLensParams } from 'vscode-languageserver';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { AstNode, AstNodeLocator, AstUtils, interruptAndCheck, LangiumDocument } from 'langium';
import { isSdsModule, isSdsPipeline, SdsModuleMember, SdsPipeline, SdsPlaceholder } from '../generated/ast.js';
import { SafeDsRunner } from '../runtime/safe-ds-runner.js';
import { getModuleMembers, streamPlaceholders } from '../helpers/nodeProperties.js';
import { SafeDsTypeChecker } from '../typing/safe-ds-type-checker.js';

import { COMMAND_PRINT_VALUE, COMMAND_RUN_PIPELINE, COMMAND_SHOW_IMAGE } from '../communication/commands.js';

export class SafeDsCodeLensProvider implements CodeLensProvider {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly runner: SafeDsRunner;
    private readonly typeChecker: SafeDsTypeChecker;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.runner = services.runtime.Runner;
        this.typeChecker = services.typing.TypeChecker;
        this.typeComputer = services.typing.TypeComputer;
    }

    async provideCodeLens(
        document: LangiumDocument,
        _params: CodeLensParams,
        cancelToken: CancellationToken = CancellationToken.None,
    ): Promise<CodeLens[] | undefined> {
        if (!this.runner.isReady()) {
            return;
        }

        const root = document.parseResult.value;
        if (!isSdsModule(root)) {
            /* c8 ignore next 2 */
            return;
        }

        const result: CodeLens[] = [];
        const acceptor: CodeLensAcceptor = (codeLens) => result.push(codeLens);

        for (const node of getModuleMembers(root)) {
            await interruptAndCheck(cancelToken);
            await this.computeCodeLensForModuleMember(node, acceptor);
        }

        return result;
    }

    private async computeCodeLensForModuleMember(
        node: SdsModuleMember,
        accept: CodeLensAcceptor,
        cancelToken: CancellationToken = CancellationToken.None,
    ): Promise<void> {
        if (isSdsPipeline(node)) {
            await this.computeCodeLensForPipeline(node, accept);

            for (const placeholder of streamPlaceholders(node.body)) {
                await interruptAndCheck(cancelToken);
                await this.computeCodeLensForPlaceholder(placeholder, accept);
            }
        }
    }

    private async computeCodeLensForPipeline(node: SdsPipeline, accept: CodeLensAcceptor): Promise<void> {
        const cstNode = node.$cstNode;
        if (!cstNode) {
            /* c8 ignore next 2 */
            return;
        }

        accept({
            range: cstNode.range,
            command: {
                title: `Run ${node.name}`,
                command: COMMAND_RUN_PIPELINE,
                arguments: this.computeNodeId(node),
            },
        });
    }

    private async computeCodeLensForPlaceholder(node: SdsPlaceholder, accept: CodeLensAcceptor): Promise<void> {
        const cstNode = node.$cstNode;
        if (!cstNode) {
            /* c8 ignore next 2 */
            return;
        }

        if (this.typeChecker.isImage(this.typeComputer.computeType(node))) {
            const documentUri = AstUtils.getDocument(node).uri.toString();
            const nodePath = this.astNodeLocator.getAstNodePath(node);

            accept({
                range: cstNode.range,
                command: {
                    title: `Show ${node.name}`,
                    command: COMMAND_SHOW_IMAGE,
                    arguments: [documentUri, nodePath],
                },
            });
        } else if (this.typeChecker.isTable(this.typeComputer.computeType(node))) {
            accept({
                range: cstNode.range,
                command: {
                    title: `Explore ${node.name}`,
                    command: 'safe-ds.exploreTable',
                    arguments: this.computeNodeId(node),
                },
            });
        } else if (this.typeChecker.canBePrinted(this.typeComputer.computeType(node))) {
            accept({
                range: cstNode.range,
                command: {
                    title: `Print ${node.name}`,
                    command: COMMAND_PRINT_VALUE,
                    arguments: this.computeNodeId(node),
                },
            });
        }
    }

    private computeNodeId(node: AstNode): [string, string] {
        const documentUri = AstUtils.getDocument(node).uri;
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return [documentUri.toString(), nodePath];
    }
}

type CodeLensAcceptor = (codeLens: CodeLens) => void;

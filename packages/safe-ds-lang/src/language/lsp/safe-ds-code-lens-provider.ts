import { CodeLensProvider } from 'langium/lsp';
import { CancellationToken, CodeLens, type CodeLensParams } from 'vscode-languageserver';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { AstNode, AstUtils, interruptAndCheck, LangiumDocument } from 'langium';
import { isSdsAssignment, SdsAssignment } from '../generated/ast.js';
import { SafeDsRunner } from '../runner/safe-ds-runner.js';

export class SafeDsCodeLensProvider implements CodeLensProvider {
    private readonly runner: SafeDsRunner;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.runner = services.runtime.Runner;
        this.typeComputer = services.typing.TypeComputer;
    }

    async provideCodeLens(
        document: LangiumDocument,
        _params: CodeLensParams,
        cancelToken: CancellationToken = CancellationToken.None,
    ): Promise<CodeLens[] | undefined> {
        const root = document.parseResult.value;
        const result: CodeLens[] = [];
        const acceptor: CodeLensAcceptor = (codeLens) => result.push(codeLens);

        for (const node of AstUtils.streamAst(root)) {
            await interruptAndCheck(cancelToken);
            await this.computeCodeLens(node, acceptor);
        }

        return result;
    }

    private async computeCodeLens(node: AstNode, accept: CodeLensAcceptor): Promise<void> {
        if (isSdsAssignment(node)) {
            await this.computeCodeLensForAssignment(node, accept);
        }
    }

    private async computeCodeLensForAssignment(node: SdsAssignment, accept: CodeLensAcceptor): Promise<void> {
        console.log(this.runner.isPythonServerAvailable());
        if (!this.runner.isPythonServerAvailable()) {
            return;
        }

        const cstNode = node.$cstNode;
        if (!cstNode) {
            /* c8 ignore next 2 */
            return;
        }

        if (this.runner.isPythonServerAvailable()) {
            accept({
                range: cstNode.range,
                data: 'test',
                command: {
                    title: 'test',
                    command: 'test',
                },
            });
        }
    }
}

type CodeLensAcceptor = (codeLens: CodeLens) => void;

import { CodeLensProvider } from 'langium/lsp';
import { CancellationToken, CodeLens, type CodeLensParams, Range } from 'vscode-languageserver';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { AstNode, AstNodeLocator, AstUtils, interruptAndCheck, LangiumDocument } from 'langium';
import {
    isSdsAssignment,
    isSdsCall,
    isSdsClass,
    isSdsMemberAccess,
    isSdsModule,
    isSdsOutputStatement,
    isSdsPipeline,
    isSdsPlaceholder,
    SdsAssignment,
    SdsModuleMember,
    SdsOutputStatement,
    SdsPipeline,
    SdsPlaceholder,
} from '../generated/ast.js';
import { SafeDsRunner } from '../runtime/safe-ds-runner.js';
import { getAbstractResults, getAssignees, getModuleMembers, getStatements } from '../helpers/nodeProperties.js';
import { SafeDsTypeChecker } from '../typing/safe-ds-type-checker.js';

import {
    COMMAND_EXPLORE_TABLE,
    COMMAND_PRINT_VALUE,
    COMMAND_RUN_PIPELINE,
    COMMAND_SHOW_IMAGE,
} from '../communication/commands.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { NamedTupleType, Type } from '../typing/model.js';

export class SafeDsCodeLensProvider implements CodeLensProvider {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly runner: SafeDsRunner;
    private readonly typeChecker: SafeDsTypeChecker;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.nodeMapper = services.helpers.NodeMapper;
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

            for (const statement of getStatements(node.body)) {
                await interruptAndCheck(cancelToken);
                if (isSdsAssignment(statement)) {
                    await this.computeCodeLensForAssignment(statement, accept);
                } else if (isSdsOutputStatement(statement)) {
                    await this.computeCodeLensForOutputStatement(statement, accept);
                }
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

    private async computeCodeLensForAssignment(
        node: SdsAssignment,
        accept: CodeLensAcceptor,
        cancelToken: CancellationToken = CancellationToken.None,
    ): Promise<void> {
        for (const assignee of getAssignees(node)) {
            await interruptAndCheck(cancelToken);
            if (isSdsPlaceholder(assignee)) {
                await this.computeCodeLensForPlaceholder(node, assignee, accept);
            }
        }
    }

    private async computeCodeLensForPlaceholder(
        assignment: SdsAssignment,
        placeholder: SdsPlaceholder,
        accept: CodeLensAcceptor,
    ): Promise<void> {
        const cstNode = placeholder.$cstNode;
        if (!cstNode) {
            /* c8 ignore next 2 */
            return;
        }

        const type = this.typeComputer.computeType(placeholder);
        await this.computeCodeLensForValue(
            type,
            placeholder.name,
            this.computeNodeId(assignment),
            placeholder.$containerIndex,
            cstNode.range,
            accept,
        );
    }

    private async computeCodeLensForOutputStatement(
        node: SdsOutputStatement,
        accept: CodeLensAcceptor,
        cancelToken: CancellationToken = CancellationToken.None,
    ): Promise<void> {
        const cstNode = node.$cstNode;
        if (!cstNode) {
            /* c8 ignore next 2 */
            return;
        }

        // Compute type of expression and unpack if it is a named tuple
        const expressionType = this.typeComputer.computeType(node.expression);
        let unpackedTypes: Type[] = [expressionType];
        if (expressionType instanceof NamedTupleType) {
            unpackedTypes = expressionType.entries.map((it) => it.type);
        }

        // Get names of values
        let valueNames: string[] = [];
        if (isSdsCall(node.expression)) {
            const callable = this.nodeMapper.callToCallable(node.expression);
            if (isSdsClass(callable)) {
                valueNames = [`${callable.name} instance`];
            } else {
                valueNames = getAbstractResults(callable).map((it) => it.name);
            }
        } else if (isSdsMemberAccess(node.expression)) {
            const declarationName = node.expression.member?.target?.ref?.name;
            if (declarationName) {
                valueNames = [declarationName];
            }
        }

        // Create code lenses for each value
        for (let i = 0; i < unpackedTypes.length; i++) {
            await interruptAndCheck(cancelToken);

            const index = expressionType instanceof NamedTupleType ? i : undefined;
            await this.computeCodeLensForValue(
                unpackedTypes[i]!,
                valueNames[i] ?? 'expression',
                this.computeNodeId(node),
                index,
                cstNode.range,
                accept,
                { fallbackToPrint: true },
            );
        }
    }

    private async computeCodeLensForValue(
        type: Type,
        name: string,
        id: NodeId,
        index: number | undefined,
        range: Range,
        accept: CodeLensAcceptor,
        options: CodeLensForValueOptions = {},
    ): Promise<void> {
        if (this.typeChecker.isImage(type)) {
            accept({
                range,
                command: {
                    title: `Show ${name}`,
                    command: COMMAND_SHOW_IMAGE,
                    arguments: [name, id, index],
                },
            });
        } else if (this.typeChecker.isTable(type)) {
            accept({
                range,
                command: {
                    title: `Explore ${name}`,
                    command: COMMAND_EXPLORE_TABLE,
                    arguments: [name, id, index],
                },
            });
        } else if (options.fallbackToPrint || this.typeChecker.canBePrinted(type)) {
            accept({
                range,
                command: {
                    title: `Print ${name}`,
                    command: COMMAND_PRINT_VALUE,
                    arguments: [name, id, index],
                },
            });
        }
    }

    private computeNodeId(node: AstNode): NodeId {
        const documentUri = AstUtils.getDocument(node).uri;
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return [documentUri.toString(), nodePath];
    }
}

type CodeLensAcceptor = (codeLens: CodeLens) => void;
type NodeId = [string, string];

/**
 * Options for the `computeCodeLensForValue` method.
 */
interface CodeLensForValueOptions {
    /**
     * If `true`, a print code lens is created, if no other code lens is applicable.
     */
    fallbackToPrint?: boolean;
}

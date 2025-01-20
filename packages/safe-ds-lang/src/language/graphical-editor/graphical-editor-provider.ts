import { SafeDsLogger, SafeDsMessagingProvider } from '../communication/safe-ds-messaging-provider.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { Uri } from 'vscode';
import { extname } from 'path';
import {
    AstNodeLocator,
    DocumentationProvider,
    DocumentBuilder,
    DocumentState,
    LangiumDocuments,
    Disposable,
    URI,
    IndexManager,
} from 'langium';
import {
    isSdsAnnotation,
    isSdsCall,
    isSdsClass,
    isSdsEnum,
    isSdsFunction,
    isSdsMemberAccess,
    isSdsReference,
    isSdsSegment,
} from '../generated/ast.js';
import { Connection, DidSaveTextDocumentParams } from 'vscode-languageserver';
import { Buildin, Collection } from './global.js';
import {
    GraphicalEditorCloseSyncChannelRequest,
    GraphicalEditorGetBuildinsRequest,
    GraphicalEditorGetDocumentationRequest,
    GraphicalEditorOpenSyncChannelRequest,
    GraphicalEditorParseDocumentRequest,
    GraphicalEditorSyncEventNotification,
} from '../communication/rpc.js';
import { isPrivate } from '../helpers/nodeProperties.js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { Parser } from './ast-parser/parser.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';

export class SafeDsGraphicalEditorProvider {
    private readonly logger: SafeDsLogger;
    private readonly LangiumDocuments: LangiumDocuments;
    private readonly DocumentBuilder: DocumentBuilder;
    private readonly AstNodeLocator: AstNodeLocator;
    private readonly DocProvider: DocumentationProvider;
    private readonly MessagingProvider: SafeDsMessagingProvider;
    private readonly IndexManager: IndexManager;
    private readonly Annotations: SafeDsAnnotations;
    private readonly TypeComputer: SafeDsTypeComputer;
    private readonly connection: Connection | undefined;

    private readonly SYNC_TRIGGER_STATE: DocumentState = 6;
    private readonly openChannel = new Map<string, Disposable>();

    constructor(services: SafeDsServices) {
        this.logger = services.communication.MessagingProvider.createTaggedLogger('Graphical Editor');
        this.LangiumDocuments = services.shared.workspace.LangiumDocuments;
        this.DocumentBuilder = services.shared.workspace.DocumentBuilder;
        this.AstNodeLocator = services.workspace.AstNodeLocator;
        this.DocProvider = services.documentation.DocumentationProvider;
        this.MessagingProvider = services.communication.MessagingProvider;
        this.IndexManager = services.shared.workspace.IndexManager;
        this.Annotations = services.builtins.Annotations;
        this.TypeComputer = services.typing.TypeComputer;
        this.connection = services.shared.lsp.Connection;

        this.MessagingProvider.onRequest(GraphicalEditorParseDocumentRequest.type, this.parseDocument);
        this.MessagingProvider.onRequest(GraphicalEditorGetDocumentationRequest.type, this.getDocumentation);
        this.MessagingProvider.onRequest(GraphicalEditorOpenSyncChannelRequest.type, this.openSyncChannel);
        this.MessagingProvider.onRequest(GraphicalEditorCloseSyncChannelRequest.type, this.closeSyncChannel);
        this.MessagingProvider.onRequest(GraphicalEditorGetBuildinsRequest.type, this.getBuildins);
    }

    public parseDocument = async (uri: Uri): Promise<Collection> => {
        const parser = new Parser(
            uri,
            'pipeline',
            this.Annotations,
            this.AstNodeLocator,
            this.TypeComputer,
            this.logger,
        );

        const validTypes = ['.sds', '.sdsdev'];

        const fileType = extname(uri.path);
        if (!validTypes.includes(fileType)) {
            parser.pushError(`Unknown file type <${fileType}>`);
            const { graph, errorList } = parser.getResult();
            return { pipeline: graph, errorList, segmentList: [] };
        }

        const document = await this.LangiumDocuments.getOrCreateDocument(uri);
        await this.DocumentBuilder.build([document]);

        document.parseResult.lexerErrors.forEach(parser.pushLexerErrors);
        document.parseResult.parserErrors.forEach(parser.pushParserErrors);
        if (parser.hasErrors()) {
            const { graph, errorList } = parser.getResult();
            return { pipeline: graph, errorList, segmentList: [] };
        }

        parser.parsePipeline(document);
        const { graph: pipeline, errorList: errorListPipeline } = parser.getResult();

        const { segmentList, errorList: errorListSegment } = Parser.parseSegments(
            document,
            this.Annotations,
            this.AstNodeLocator,
            this.TypeComputer,
            this.logger,
        );

        const errorList = [...errorListPipeline, ...errorListSegment];

        return { pipeline, errorList, segmentList };
    };

    public async getDocumentation(params: { uri: Uri; uniquePath: string }): Promise<string | undefined> {
        const validTypes = ['.sds', '.sdsdev'];

        const fileType = extname(params.uri.path);
        if (!validTypes.includes(fileType)) {
            this.logger.error(`GetDocumentation: Unknown file type <${fileType}>`);
            return;
        }

        const document = await this.LangiumDocuments.getOrCreateDocument(params.uri);
        await this.DocumentBuilder.build([document]);

        const root = document.parseResult.value;
        const node = this.AstNodeLocator.getAstNode(root, params.uniquePath);

        if (!node) {
            this.logger.error(`GetDocumentation: Node retrieval failed for <${params.uniquePath}>`);
            return;
        }

        if (!isSdsCall(node)) {
            this.logger.error(`GetDocumentation: Invalid node type <${node.$type}>`);
            return;
        }

        const receiver = node.receiver;
        if (isSdsMemberAccess(receiver)) {
            const fun = receiver.member?.target.ref!;
            return this.DocProvider.getDocumentation(fun);
        }

        if (isSdsReference(receiver)) {
            const cls = receiver.target.ref!;
            return this.DocProvider.getDocumentation(cls);
        }

        this.logger.error(`GetDocumentation: Invalid call receiver <${node.$type}>`);
        return;
    }

    public closeSyncChannel(uri: Uri) {
        if (!this.openChannel.has(uri.toString())) return;

        const channel = this.openChannel.get(uri.toString())!;
        channel.dispose();
    }

    public openSyncChannel(uri: Uri) {
        if (!this.connection) {
            this.logger.error('OpenSyncChannel: No connection to client');
            return;
        }

        this.closeSyncChannel(uri);

        const syncEventHandler = async (params: DidSaveTextDocumentParams) => {
            const documentUri = URI.parse(params.textDocument.uri);
            const response = await this.parseDocument(documentUri);

            this.MessagingProvider.sendNotification(GraphicalEditorSyncEventNotification.type, response);
        };

        const channel = this.connection.onDidSaveTextDocument(syncEventHandler);

        /*
            Man könnte über diese Methode ein Update des Graphen bei jedem Keystroke triggern.
            Dieses Verhalten speziell ist vermutlich zu viel, aber eine debouncte Version könnte interessant sein.
            
            const syncHandler: DocumentBuildListener = () => {
                const response: SyncChannelInterface.Response = {
                    test: "THIS is a sync event",
                };
                connection.sendNotification(SyncChannelHandler.method, response);
            };
            
            sharedServices.workspace.DocumentBuilder.onBuildPhase(
                SYNC_TRIGGER_STATE,
                syncHandler,
            );
        */

        this.openChannel.set(uri.toString(), channel);
    }

    public async getBuildins(): Promise<Buildin[]> {
        const resultList: Buildin[] = [];
        const allElements = this.IndexManager.allElements();

        for (const element of allElements) {
            if (!element.node) {
                this.logger.warn(`GetBuildins: Unable to parse <${element.name}>`);
                continue;
            }

            if (isSdsClass(element.node)) {
                const name = element.node.name;

                const classMemberList = element.node.body?.members ?? [];
                const functionList: Buildin[] = classMemberList
                    .filter((member) => isSdsFunction(member))
                    .filter((fun) => !isPrivate(fun))
                    .map((fun) => {
                        const category = this.Annotations.getCategory(fun);
                        return {
                            category: category?.name ?? '',
                            name: fun.name,
                            parent: name,
                        };
                    });
                resultList.push(...functionList);
            }

            if (isSdsFunction(element.node)) {
                resultList.push({
                    name: element.node.name,
                    category: this.Annotations.getCategory(element.node)?.name ?? '',
                    parent: undefined,
                });
            }

            if (isSdsSegment(element.node)) {
                continue;
            }

            if (isSdsAnnotation(element.node) || isSdsEnum(element.node)) {
                this.logger.info(`GetBuildins: Skipping <${element.node.$type}>`);
                continue;
            }

            this.logger.warn(`GetBuildins: Unable to parse <${element.node.$type}>`);
        }

        return resultList;
    }
}

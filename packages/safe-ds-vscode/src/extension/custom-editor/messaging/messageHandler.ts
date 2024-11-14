import { Disposable, Uri, Webview } from 'vscode';
import { LanguageClient, NotificationType, RequestType } from 'vscode-languageclient/node.js';
import { GetAst } from '$lang/language/custom-editor/getAst.js';
import {
    AstInterface,
    ExtensionToWebview,
    GlobalReferenceInterface,
    NodeDescriptionInterface,
    SyncChannelInterface,
    WebviewToExtension,
} from '$lang/language/custom-editor/global.ts';
import { safeDsLogger } from '../../helpers/logging.ts';
import { GetGlobalReferences } from '$lang/language/custom-editor/getGlobalReferences.ts';
import { GetNodeDesciption } from '$lang/language/custom-editor/getNodeDescription.ts';
import { SyncChannelHandler } from '$lang/language/custom-editor/getSyncChannel.ts';

export class MessageHandler {
    private vscodeWebview: Webview;
    private client: LanguageClient;
    private documentUri: Uri;

    constructor(webview: Webview, client: LanguageClient, uri: Uri) {
        this.vscodeWebview = webview;
        this.client = client;
        this.documentUri = uri;
    }

    public get webview() {
        const vscodeWebview = this.vscodeWebview;
        const client = this.client;
        const documentUri = this.documentUri;
        return {
            listenToMessages(): Disposable {
                return vscodeWebview.onDidReceiveMessage(async (message: WebviewToExtension) => {
                    if (message.command === 'test') {
                        safeDsLogger.info(message.value);
                    }

                    if (message.command === 'RequestAst') {
                        const response = await client.sendRequest(
                            new RequestType<AstInterface.Message, AstInterface.Response, void>(GetAst.method),
                            { uri: documentUri },
                        );
                        const messageObject: ExtensionToWebview = {
                            command: 'SendAst',
                            value: response,
                        };
                        vscodeWebview.postMessage(messageObject);
                    }

                    if (message.command === 'RequestGlobalReferences') {
                        const response = await client.sendRequest(
                            new RequestType<GlobalReferenceInterface.Message, GlobalReferenceInterface.Response, void>(
                                GetGlobalReferences.method,
                            ),
                            { uri: documentUri },
                        );
                        const messageObject: ExtensionToWebview = {
                            command: 'SendGlobalReferences',
                            value: response,
                        };
                        vscodeWebview.postMessage(messageObject);
                    }

                    if (message.command === 'RequestNodeDescription') {
                        const response = await client.sendRequest(
                            new RequestType<NodeDescriptionInterface.Message, NodeDescriptionInterface.Response, void>(
                                GetNodeDesciption.method,
                            ),
                            { uri: documentUri, uniquePath: message.value },
                        );
                        const messageObject: ExtensionToWebview = {
                            command: 'SendNodeDescription',
                            value: response,
                        };
                        vscodeWebview.postMessage(messageObject);
                    }

                    if (message.command === 'ManageSyncChannel') {
                        await client.sendRequest(
                            new RequestType<SyncChannelInterface.Message, SyncChannelInterface.Response, void>(
                                SyncChannelHandler.method,
                            ),
                            { uri: documentUri, action: message.value },
                        );
                    }
                });
            },
            sendMessageTest(message: string) {
                const messageObject: ExtensionToWebview = {
                    command: 'test',
                    value: message,
                };
                vscodeWebview.postMessage(messageObject);
            },
        };
    }

    public get languageServer() {
        const client = this.client;
        const vscodeWebview = this.vscodeWebview;

        return {
            forwardSyncEvents(): Disposable {
                return client.onNotification(
                    new NotificationType<SyncChannelInterface.Response>(SyncChannelHandler.method),
                    (message: SyncChannelInterface.Response) => {
                        const messageObject: ExtensionToWebview = {
                            command: 'SendSyncEvent',
                            value: message,
                        };
                        vscodeWebview.postMessage(messageObject);
                    },
                );
            },
        };
    }
}
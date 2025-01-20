import { Uri, Webview } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node.js';
import { rpc } from '@safe-ds/lang';
import { safeDsLogger } from '../../helpers/logging.ts';

interface Message {
    command: string;
    value: string;
}

export class MessageHandler {
    private vscodeWebview: Webview;
    private client: LanguageClient;
    private uri: Uri;

    constructor(webview: Webview, client: LanguageClient, uri: Uri) {
        this.vscodeWebview = webview;
        this.client = client;
        this.uri = uri;
    }

    public registerMessageHandlerFromWebview() {
        const ParseDocument = rpc.GraphicalEditorParseDocumentRequest;
        const OpenSyncChannel = rpc.GraphicalEditorOpenSyncChannelRequest;
        const CloseSyncChannel = rpc.GraphicalEditorCloseSyncChannelRequest;
        const GetDocumentation = rpc.GraphicalEditorGetDocumentationRequest;
        const GetBuildins = rpc.GraphicalEditorGetBuildinsRequest;

        return this.vscodeWebview.onDidReceiveMessage(async (message: Message) => {
            if (message.command === 'test') {
                safeDsLogger.info(message.value);
            }

            if (message.command === ParseDocument.method) {
                const response = await this.client.sendRequest(ParseDocument.type, this.uri);
                const messageObject = {
                    command: ParseDocument.method,
                    value: response,
                };
                this.vscodeWebview.postMessage(messageObject);
            }

            if (message.command === GetBuildins.method) {
                const response = await this.client.sendRequest(GetBuildins.type);
                const messageObject = {
                    command: GetBuildins.method,
                    value: response,
                };
                this.vscodeWebview.postMessage(messageObject);
            }

            if (message.command === GetDocumentation.method) {
                const response = await this.client.sendRequest(GetDocumentation.type, {
                    uri: this.uri,
                    uniquePath: message.value,
                });
                const messageObject = {
                    command: GetDocumentation.method,
                    value: response,
                };
                this.vscodeWebview.postMessage(messageObject);
            }

            if (message.command === OpenSyncChannel.method) {
                await this.client.sendRequest(OpenSyncChannel.type, this.uri);
            }

            if (message.command === CloseSyncChannel.method) {
                await this.client.sendRequest(CloseSyncChannel.type, this.uri);
            }
        });
    }

    public registerMessageHandlerFromLanguageServer() {
        const SyncEvent = rpc.GraphicalEditorSyncEventNotification;

        return this.client.onNotification(SyncEvent.type, (message) => {
            const messageObject = {
                command: SyncEvent.method,
                value: message,
            };
            this.vscodeWebview.postMessage(messageObject);
        });
    }

    public testWebview(message: string) {
        const messageObject = {
            command: 'test',
            value: message,
        };
        this.vscodeWebview.postMessage(messageObject);
    }
}

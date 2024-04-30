import { Disposable, Uri, Webview } from 'vscode';
import { ExtensionToWebview, WebviewToExtension } from './message-types.js';
import { logOutput } from '../../../extension/output.js';
import { LanguageClient, RequestType } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import { GetAst } from '$lang/language/custom-editor/getAst.js';
import { AstInterface } from './getAst.js';

export class MessageHandler {
    private static instance: MessageHandler;
    private vscodeWebview: Webview;
    private client: LanguageClient;
    private documentUri: Uri;
    private constructor(webview: Webview, client: LanguageClient, uri: Uri) {
        this.vscodeWebview = webview;
        this.client = client;
        this.documentUri = uri;
    }

    public static getInstance(webview: Webview, client: LanguageClient, uri: Uri) {
        if (!MessageHandler.instance) {
            MessageHandler.instance = new MessageHandler(webview, client, uri);
        }
        return MessageHandler.instance;
    }

    public get webview() {
        const vscodeWebview = this.vscodeWebview;
        const client = this.client;
        const documentUri = this.documentUri;
        return {
            listenToMessages(): Disposable {
                return vscodeWebview.onDidReceiveMessage(async (message: WebviewToExtension) => {
                    logOutput('I GOT A MESSAGE');
                    switch (message.command) {
                        case 'test':
                            logOutput(message.value);
                            break;
                        case 'RequestAst':
                            logOutput('I got a request for AST');
                            const response = await client.sendRequest(
                                new RequestType<AstInterface.Message, AstInterface.Response, void>(GetAst.method),
                                { uri: documentUri },
                            );
                            const messageObject: ExtensionToWebview = {
                                command: 'SendAst',
                                value: response,
                            };
                            vscodeWebview.postMessage(messageObject);
                            break;
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
        return {
            async getAst_SAMPLE(documentUri: vscode.Uri): Promise<AstInterface.Response> {
                // await client.onReady(); // Ensure the client is ready before sending requests // This is suggested in every tutorial, but the method doesn't exist?
                const response = await client.sendRequest(
                    new RequestType<AstInterface.Message, AstInterface.Response, void>(GetAst.method),
                    { uri: documentUri },
                );
                return response;
            },
        };
    }
}

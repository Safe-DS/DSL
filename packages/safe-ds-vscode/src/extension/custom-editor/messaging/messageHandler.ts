import { Disposable, Webview } from 'vscode';
import { ExtensionToWebview, WebviewToExtension } from './message-types.js';
import { logAny, logOutput } from '../../../extension/output.js';
import { LanguageClient, RequestType } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import { GetAst, GetAstTypes } from '../../../../../safe-ds-lang/src/language/custom-editor/getAst.js';

export class MessageHandler {
    private static instance: MessageHandler;
    private vscodeWebview: Webview;
    private client: LanguageClient;
    private constructor(webview: Webview, client: LanguageClient) {
        this.vscodeWebview = webview;
        this.client = client;
    }

    public static getInstance(webview: Webview, client: LanguageClient) {
        if (!MessageHandler.instance) {
            MessageHandler.instance = new MessageHandler(webview, client);
        }
        return MessageHandler.instance;
    }

    public get webview() {
        const vscodeWebview = this.vscodeWebview;
        return {
            listenToMessages(): Disposable {
                return vscodeWebview.onDidReceiveMessage(async (message: WebviewToExtension) => {
                    logOutput(`${Date.now()}: ${message.command} called`);

                    switch (message.command) {
                        case 'test':
                            logOutput(message.value);
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
            async getAst(documentUri: vscode.Uri) {
                // await client.onReady(); // Ensure the client is ready before sending requests // This is suggested in every tutorial, but the method doesn't exist?
                logOutput('I GOT SEND');
                const response = await client.sendRequest(
                    new RequestType<GetAstTypes.Message, GetAstTypes.Response, void>(GetAst.method),
                    { uri: documentUri },
                );
                logOutput('I GOT RECEIVED');
                logAny(response);
            },
        };
    }
}

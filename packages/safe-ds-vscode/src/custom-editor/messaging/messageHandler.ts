import { Disposable, Webview } from 'vscode';
import { ExtensionToWebview, WebviewToExtension } from './message-types.js';
import { logAny, logOutput } from '../../extension/output.js';
import { LanguageClient, RequestType } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';

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
            async getAST(documentUri: vscode.Uri) {
                interface MyCustomRequestParams {
                    uri: vscode.Uri;
                }
                interface MyCustomRequestResponse {
                    json: string;
                }
                const MyCustomRequestType = new RequestType<MyCustomRequestParams, MyCustomRequestResponse, void>(
                    'custom-editor/getAST',
                );
                // await client.onReady(); // Ensure the client is ready before sending requests
                const response = await client.sendRequest(MyCustomRequestType, { uri: documentUri });
                logAny(response);
            },
        };
    }
}

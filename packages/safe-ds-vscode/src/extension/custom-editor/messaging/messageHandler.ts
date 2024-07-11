import { Disposable, Uri, Webview } from 'vscode';
import { LanguageClient, RequestType } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import { GetAst } from '$lang/language/custom-editor/getAst.js';
import { AstInterface, ExtensionToWebview, WebviewToExtension } from '$lang/language/custom-editor/global.ts';

// Todo: This class can technically be reworked a bit
// maybe just having two static spaces, with messageListener is enough
// It should still be possible ot initiate messages from the extension, but for now that's
// almost not necessary

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
                    switch (message.command) {
                        case 'test':
                            // Todo: Update print
                            // logOutput(message.value);
                            break;
                        case 'RequestAst':
                            // Todo: Set the vscode application state as "loading AST" in the bottom bar
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
            async getAst_DEPRECATED(documentUri: vscode.Uri): Promise<AstInterface.Response> {
                // await client.onReady(); // Todo: properly look for this -> Ensure the client is ready before sending requests // This is suggested in every tutorial, but the method doesn't exist?
                const response = await client.sendRequest(
                    new RequestType<AstInterface.Message, AstInterface.Response, void>(GetAst.method),
                    { uri: documentUri },
                );
                return response;
            },
        };
    }
}

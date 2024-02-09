import * as vscode from 'vscode';
import path from 'path';
import fs from 'fs';
import { logOutput } from '../extension/output.js';
import { MessageHandler } from './messaging/messageHandler.js';

/**
 * Provider for the Safe-DS custom visual editor.
 */
export class SafeDSCustomTextEditorProvider implements vscode.CustomTextEditorProvider {
    private static readonly viewType = 'safe-ds.custom-editor';
    private static readonly options = {
        webviewOptions: {
            enableFindWidget: false,
            retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
    };

    constructor(private readonly context: vscode.ExtensionContext) {}

    public static registerProvider(context: vscode.ExtensionContext): void {
        const provider = new SafeDSCustomTextEditorProvider(context);
        context.subscriptions.push(
            vscode.window.registerCustomEditorProvider(
                SafeDSCustomTextEditorProvider.viewType,
                provider,
                SafeDSCustomTextEditorProvider.options,
            ),
        );
    }

    public static registerCommands(context: vscode.ExtensionContext): void {
        const commands = [
            {
                name: 'open',
                callback(...args: any[]) {
                    let documentURI: vscode.Uri | undefined = undefined;

                    if (args.length > 0 && args[0] instanceof vscode.Uri) {
                        documentURI = args[0];
                    } else if (vscode.window.activeTextEditor) {
                        documentURI = vscode.window.activeTextEditor.document.uri;
                    }

                    if (documentURI) {
                        SafeDSCustomTextEditorProvider.openDiagram(documentURI);
                    }
                },
            },
        ];

        commands.forEach((command) => {
            context.subscriptions.push(
                vscode.commands.registerCommand(
                    `${SafeDSCustomTextEditorProvider.viewType}.${command.name}`,
                    command.callback,
                ),
            );
            logOutput(
                `Registered ${command.name} | Full Command: ${SafeDSCustomTextEditorProvider.viewType}.${command.name}`,
            );
        });
    }

    /**
     * Called when the custom editor is opened
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        const messageHandler = MessageHandler.getInstance(webviewPanel.webview);
        this.context.subscriptions.push(messageHandler.listenToMessages());
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document.fileName);

        messageHandler.sendMessageTest('Hi from Extension');
    }

    /**
     * Get the static html used for the editor webviews.
     */
    private getHtmlForWebview(webview: vscode.Webview, filename: string): string {
        const title = `Diagram - ${filename}`;

        // Local path to static page elements
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'src', 'custom-editor', 'media', 'reset.css'),
        );

        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'src', 'custom-editor', 'media', 'vscode.css'),
        );

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'custom-editor', 'custom-editor.js'),
        );

        // Generate paths do dynamic page content
        const assetsPath = path.join(this.context.extensionUri.fsPath, 'dist', 'custom-editor', 'assets');
        const cssFiles = fs
            .readdirSync(assetsPath)
            .filter((file) => file.endsWith('.css'))
            .map((file) => {
                return webview.asWebviewUri(vscode.Uri.file(path.join(assetsPath, file)));
            });

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->

				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${
                    webview.cspSource
                }; script-src 'nonce-${nonce}';">

                <script nonce="${nonce}">
                    window.injVscode = acquireVsCodeApi();
                </script>


                ${cssFiles.map((cssUri) => {
                    return `<link href="${cssUri}" rel="stylesheet" />`;
                })}
                <link href="${styleResetUri}" rel="stylesheet" />
                <link href="${styleVSCodeUri}" rel="stylesheet" />

				<title>"${title}"</title>
			</head>
			<body>
                <div>
                    HELLO WORLD
                </div>
				<div class="root"/>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }

    /**
     * Open the custom editor for the given URI.
     */
    public static async openDiagram(uri: vscode.Uri): Promise<void> {
        await vscode.commands.executeCommand('vscode.openWith', uri, SafeDSCustomTextEditorProvider.viewType);
        return;
    }
}

const getNonce = () => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

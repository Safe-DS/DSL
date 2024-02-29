import * as vscode from 'vscode';
import { ToExtensionMessage } from '@safe-ds/eda/types/messaging.js';
import * as webviewApi from './apis/webviewApi.ts';
import { State } from '@safe-ds/eda/types/state.js';
import { logOutput, printOutputMessage } from '../output.ts';
import { SafeDsServices } from '@safe-ds/lang';
import { RunnerApi } from './apis/runnerApi.ts';

export class EDAPanel {
    // Map to track multiple panels
    private static instancesMap: Map<string, { panel: EDAPanel; runnerApi: RunnerApi }> = new Map();
    private static context: vscode.ExtensionContext;
    private static services: SafeDsServices;

    public static readonly viewType = 'eda';

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private disposables: vscode.Disposable[] = [];
    private tableIdentifier: string;
    private column: vscode.ViewColumn | undefined;
    private webviewListener: vscode.Disposable | undefined;
    private viewStateChangeListener: vscode.Disposable | undefined;
    private updateHtmlDone: boolean = false;
    private startPipelineId: string;

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        startPipeLineId: string,
        tableIdentifier: string,
    ) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.tableIdentifier = tableIdentifier;
        this.startPipelineId = startPipeLineId;

        // Set the webview's initial html content
        this.updateHtmlDone = false;
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        // Handle view state changes
        this.viewStateChangeListener = this.panel.onDidChangeViewState(async (e) => {
            const updatedPanel = e.webviewPanel;
            if (updatedPanel.visible) {
                this.column = updatedPanel.viewColumn;
            }
        });
        this.disposables.push(this.viewStateChangeListener);

        // Handle messages from the webview
        const webview = this.panel.webview;
        this.webviewListener = webview.onDidReceiveMessage(async (data: ToExtensionMessage) => {
            printOutputMessage(data.command + ' called');
            switch (data.command) {
                case 'setInfo': {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case 'setError': {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
                case 'setCurrentGlobalState': {
                    if (!data.value) {
                        return;
                    }
                    const existingStates = (EDAPanel.context.globalState.get('webviewState') ?? []) as State[];
                    const stateExists = existingStates.some((s) => s.tableIdentifier === data.value.tableIdentifier);

                    const newWebviewState = stateExists
                        ? (existingStates.map((s) =>
                              s.tableIdentifier === data.value.tableIdentifier ? data.value : s,
                          ) as State[])
                        : existingStates.concat(data.value);

                    EDAPanel.context.globalState.update('webviewState', newWebviewState);
                    break;
                }
                case 'resetGlobalState': {
                    EDAPanel.context.globalState.update('webviewState', []);
                    break;
                }
            }
        });
        this.disposables.push(this.webviewListener);
    }

    public static createOrShow(
        extensionUri: vscode.Uri,
        context: vscode.ExtensionContext,
        startPipelineId: string,
        services: SafeDsServices,
        tableIdentifier: string,
        pipelinePath: vscode.Uri,
    ) {
        EDAPanel.context = context;
        EDAPanel.services = services;

        // Set column to the active editor if it exists
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        let instance = EDAPanel.instancesMap.get(tableIdentifier);
        if (instance) {
            let panel = instance.panel;
            panel.panel.reveal(panel.column);
            panel.tableIdentifier = tableIdentifier;
            panel.startPipelineId = startPipelineId;
            EDAPanel.instancesMap.set(tableIdentifier, { panel, runnerApi: new RunnerApi(services, pipelinePath) });

            // Have to update and construct state as table placeholder could've changed in code
            panel.updateHtmlDone = false;
            panel._update();
            panel.constructCurrentState().then((state) => {
                webviewApi.postMessage(panel!.panel.webview, {
                    command: 'setWebviewState',
                    value: state,
                });
            });
            return;
        } else {
            // Otherwise, create a new panel.
            const newPanel = vscode.window.createWebviewPanel(
                EDAPanel.viewType,
                tableIdentifier ? tableIdentifier + ' Exploration' : 'EDA',
                column || vscode.ViewColumn.One,
                {
                    // Enable javascript in the webview
                    enableScripts: true,
                    localResourceRoots: [
                        vscode.Uri.joinPath(extensionUri, 'media'),
                        vscode.Uri.joinPath(extensionUri, 'dist', 'eda-webview'),
                        vscode.Uri.joinPath(extensionUri, '..', 'safe-ds-eda', 'dist'),
                    ],
                    retainContextWhenHidden: true,
                },
            );

            const edaPanel = new EDAPanel(newPanel, extensionUri, startPipelineId, tableIdentifier);
            EDAPanel.instancesMap.set(tableIdentifier, {
                panel: edaPanel,
                runnerApi: new RunnerApi(services, pipelinePath),
            });
            edaPanel.column = column;
            edaPanel.panel.iconPath = {
                light: vscode.Uri.joinPath(edaPanel.extensionUri, 'img', 'binoculars-solid.png'),
                dark: vscode.Uri.joinPath(edaPanel.extensionUri, 'img', 'binoculars-solid.png'),
            };
            edaPanel.constructCurrentState().then((state) => {
                webviewApi.postMessage(edaPanel!.panel.webview, {
                    command: 'setWebviewState',
                    value: state,
                });
            });
        }
    }

    public static kill(tableIdentifier: string) {
        printOutputMessage('kill ' + tableIdentifier);
        let instance = EDAPanel.instancesMap.get(tableIdentifier);
        if (instance) {
            instance.panel.dispose();
            EDAPanel.instancesMap.delete(tableIdentifier);
        }
    }

    public dispose() {
        EDAPanel.instancesMap.delete(this.tableIdentifier);

        // Clean up our panel
        this.panel.dispose();

        // Cleans up all disposables like listeners
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this.panel.webview;
        this.panel.webview.html = await this._getHtmlForWebview(webview);
        this.updateHtmlDone = true;
    }

    private findCurrentState(): State | undefined {
        const existingStates = (EDAPanel.context.globalState.get('webviewState') ?? []) as State[];
        return existingStates.find((s) => s.tableIdentifier === this.tableIdentifier);
    }

    private constructCurrentState(): Promise<State> {
        // Helper function to wait until updateHtmlDone is true or timeout
        const waitForUpdateHtmlDone = (timeoutMs: number): Promise<void> => {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                // Function to check updateHtmlDone status
                const check = () => {
                    if (this.updateHtmlDone) {
                        resolve();
                    } else if (Date.now() - startTime > timeoutMs) {
                        reject(new Error('Timeout waiting for updateHtmlDone'));
                    } else {
                        setTimeout(check, 100); // Check every 100ms
                    }
                };
                check();
            });
        };

        return new Promise((resolve, reject) => {
            // Wait for updateHtmlDone to be true or timeout after 10s
            waitForUpdateHtmlDone(10000)
                .then(() => {
                    // Proceed with the original logic after waiting
                    const existingCurrentState = this.findCurrentState();
                    if (existingCurrentState) {
                        printOutputMessage('Found current State.');
                        resolve(existingCurrentState);
                        return;
                    }

                    if (!this.tableIdentifier) {
                        resolve({ tableIdentifier: undefined, history: [], defaultState: true });
                        return;
                    }

                    const instance = EDAPanel.instancesMap.get(this.tableIdentifier);
                    if (!instance) {
                        reject(new Error('RunnerApi instance not found.'));
                    } else {
                        instance.runnerApi
                            .getPlaceholderValue(this.tableIdentifier, this.startPipelineId)
                            .then((state) => {
                                if (state === undefined) {
                                    reject(new Error('Timeout waiting for placeholder value'));
                                } else {
                                    resolve(state);
                                }
                            });
                    }
                })
                .catch((error) => {
                    // Handle timeout or other errors
                    reject(error);
                });
        });
    }

    private async _getHtmlForWebview(webview: vscode.Webview) {
        // The uri we use to load this script in the webview
        let scriptUri;
        // First look in the eda package, so the watch build works and updates the webview on changes
        let scriptPath = vscode.Uri.joinPath(this.extensionUri, '..', 'safe-ds-eda', 'dist', 'main.js');
        scriptUri = webview.asWebviewUri(scriptPath);
        try {
            await vscode.workspace.fs.stat(scriptPath);
            logOutput('Using EDA build from EDA package.');
        } catch (error) {
            // If not use the static one from the dist folder here
            logOutput('Using EDA build from local dist.');
            scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist', 'eda-webview', 'main.js'));
        }

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'reset.css'));
        const stylesVscodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'vscode.css'));
        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'styles.css'));

        // Use a nonce to only allow specific scripts to be run
        const nonce = this.getNonce();

        return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <!--
        Use a content security policy to only allow loading images from https or from our extension directory,
        and only allow scripts that have a specific nonce.
      -->
      <meta http-equiv="Content-Security-Policy" content="img-src https: data:;
        style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${stylesResetUri}" rel="stylesheet">
      <link href="${stylesVscodeUri}" rel="stylesheet">
      <link href="${stylesMainUri}" rel="stylesheet">
      <script nonce="${nonce}">
        window.injVscode = acquireVsCodeApi();
        window.tableIdentifier = "${this.tableIdentifier}" === "undefined" ? undefined : "${this.tableIdentifier}";
      </script>
    </head>
    <body data-vscode-context='{"preventDefaultContextMenuItems": true}'>
    </body>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
    }

    public getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

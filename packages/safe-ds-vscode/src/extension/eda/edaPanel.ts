import * as vscode from 'vscode';
import { ToExtensionMessage } from '@safe-ds/eda/types/messaging.js';
import * as webviewApi from './apis/webviewApi.ts';
import { State } from '@safe-ds/eda/types/state.js';
import { ast, SafeDsServices } from '@safe-ds/lang';
import { RunnerApi } from './apis/runnerApi.ts';
import { safeDsLogger } from '../helpers/logging.js';

export class EDAPanel {
    // Map to track multiple panels
    private static panelsMap: Map<string, EDAPanel> = new Map();
    private static context: vscode.ExtensionContext;
    private static services: SafeDsServices;

    public static readonly viewType = 'eda';

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private disposables: vscode.Disposable[] = [];
    private tableIdentifier: string;
    private tableName: string;
    private column: vscode.ViewColumn | undefined;
    private webviewListener: vscode.Disposable | undefined;
    private viewStateChangeListener: vscode.Disposable | undefined;
    private updateHtmlDone: boolean = false;
    private startPipelineExecutionId: string;
    private runnerApi: RunnerApi;

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        startPipelineExecutionId: string,
        pipelinePath: vscode.Uri,
        pipelineName: string,
        pipelineNode: ast.SdsPipeline,
        tableName: string,
    ) {
        this.tableIdentifier = pipelineName + '.' + tableName;
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.startPipelineExecutionId = startPipelineExecutionId;
        this.runnerApi = new RunnerApi(EDAPanel.services, pipelinePath, pipelineName, pipelineNode);
        this.tableName = tableName;

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
            safeDsLogger.info(data.command + ' called');
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
                    // if (!data.value) {
                    //     return;
                    // }
                    // const existingStates = (EDAPanel.context.globalState.get('webviewState') ?? []) as State[];
                    // const stateExists = existingStates.some((s) => s.tableIdentifier === data.value.tableIdentifier);

                    // const newWebviewState = stateExists
                    //     ? (existingStates.map((s) =>
                    //           s.tableIdentifier === data.value.tableIdentifier ? data.value : s,
                    //       ) as State[])
                    //     : existingStates.concat(data.value);

                    // EDAPanel.context.globalState.update('webviewState', newWebviewState);
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

    public static async createOrShow(
        extensionUri: vscode.Uri,
        context: vscode.ExtensionContext,
        startPipelineExecutionId: string,
        services: SafeDsServices,
        pipelinePath: vscode.Uri,
        pipelineName: string,
        pipelineNode: ast.SdsPipeline,
        tableName: string,
    ): Promise<void> {
        EDAPanel.context = context;
        EDAPanel.services = services;

        let tableIdentifier = pipelineName + '.' + tableName;

        // Set column to the active editor if it exists
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        let panel = EDAPanel.panelsMap.get(tableIdentifier);
        if (panel) {
            panel.panel.reveal(panel.column);
            panel.tableIdentifier = tableIdentifier;
            panel.startPipelineExecutionId = startPipelineExecutionId;
            panel.runnerApi = new RunnerApi(services, pipelinePath, pipelineName, pipelineNode);
            panel.tableName = tableName;
            EDAPanel.panelsMap.set(tableIdentifier, panel);

            // TODO: Display disclaimer that data can be outdated and show refresh button
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

            const edaPanel = new EDAPanel(
                newPanel,
                extensionUri,
                startPipelineExecutionId,
                pipelinePath,
                pipelineName,
                pipelineNode,
                tableName,
            );
            EDAPanel.panelsMap.set(tableIdentifier, edaPanel);
            edaPanel.column = column;
            edaPanel.panel.iconPath = {
                light: vscode.Uri.joinPath(edaPanel.extensionUri, 'img', 'binoculars-solid.png'),
                dark: vscode.Uri.joinPath(edaPanel.extensionUri, 'img', 'binoculars-solid.png'),
            };
            await edaPanel.waitForUpdateHtmlDone(10000);
            const stateInfo = await edaPanel.constructCurrentState();
            webviewApi.postMessage(edaPanel!.panel.webview, {
                command: 'setWebviewState',
                value: stateInfo.state,
            });

            // TODO: if from existing state, show disclaimer that updated data is loading and execute pipeline + history + profiling and send

            if (
                !stateInfo.fromExisting ||
                !stateInfo.state.table ||
                !stateInfo.state.table!.columns.find((c) => c[1].profiling)
            ) {
                const profiling = await EDAPanel.panelsMap
                    .get(tableIdentifier)!
                    .runnerApi.getProfiling(stateInfo.state.table!);

                webviewApi.postMessage(edaPanel!.panel.webview, {
                    command: 'setProfiling',
                    value: profiling,
                });
            }
        }
    }

    public static kill(tableIdentifier: string) {
        safeDsLogger.info('kill ' + tableIdentifier);
        let panel = EDAPanel.panelsMap.get(tableIdentifier);
        if (panel) {
            panel.panel.dispose();
            EDAPanel.panelsMap.delete(tableIdentifier);
        }
    }

    public dispose() {
        EDAPanel.panelsMap.delete(this.tableIdentifier);

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

    private waitForUpdateHtmlDone = (timeoutMs: number): Promise<void> => {
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

    // private findCurrentState(): State | undefined {
    //     const existingStates = (EDAPanel.context.globalState.get('webviewState') ?? []) as State[];
    //     return existingStates.find((s) => s.tableIdentifier === this.tableIdentifier);
    // }

    private async constructCurrentState(): Promise<{ state: State; fromExisting: boolean }> {
        // const existingCurrentState = this.findCurrentState();
        // if (existingCurrentState) {
        //     printOutputMessage('Found current State.');
        //     return { state: existingCurrentState, fromExisting: true };
        // }
        //
        const panel = EDAPanel.panelsMap.get(this.tableIdentifier);
        if (!panel) {
            throw new Error('RunnerApi panel not found.');
        } else {
            const table = await panel.runnerApi.getTableByPlaceholder(this.tableName, this.startPipelineExecutionId);
            if (!table) {
                throw new Error('Timeout waiting for placeholder value');
            } else {
                return {
                    state: {
                        tableIdentifier: panel.tableIdentifier,
                        history: [],
                        defaultState: false,
                        table,
                    },
                    fromExisting: false,
                };
            }
        }
    }

    private async _getHtmlForWebview(webview: vscode.Webview) {
        // The uri we use to load this script in the webview
        let scriptUri;
        // First look in the eda package, so the watch build works and updates the webview on changes
        let scriptPath = vscode.Uri.joinPath(this.extensionUri, '..', 'safe-ds-eda', 'dist', 'main.js');
        scriptUri = webview.asWebviewUri(scriptPath);
        try {
            await vscode.workspace.fs.stat(scriptPath);
            safeDsLogger.info('Using EDA build from EDA package.');
        } catch (error) {
            // If not use the static one from the dist folder here
            safeDsLogger.info('Using EDA build from local dist.');
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

import * as vscode from 'vscode';
import { ToExtensionMessage } from '@safe-ds/eda/types/messaging.js';
import * as webviewApi from './apis/webviewApi.ts';
import { Table } from '@safe-ds/eda/types/state.ts';
import { SafeDsServices } from '@safe-ds/lang';
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

    //#region Creation
    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        startPipelineExecutionId: string,
        pipelinePath: vscode.Uri,
        pipelineName: string,
        pipelineNodeEndOffset: number,
        tableName: string,
    ) {
        this.tableIdentifier = pipelineName + '.' + tableName;
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.startPipelineExecutionId = startPipelineExecutionId;
        this.runnerApi = new RunnerApi(EDAPanel.services, pipelinePath, pipelineName, pipelineNodeEndOffset, tableName);
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
            // TODO handle floating panels if at some point possible
        });
        this.disposables.push(this.viewStateChangeListener);

        // Handle messages from the webview
        const webview = this.panel.webview;
        this.webviewListener = webview.onDidReceiveMessage(async (data: ToExtensionMessage) => {
            safeDsLogger.debug(data.command + ' called');
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
                case 'executeRunner': {
                    if (!data.value) {
                        return;
                    }

                    let alreadyComplete = false;

                    // Execute the runner
                    const resultPromise = this.runnerApi.executeHistoryAndReturnNewResult(
                        data.value.pastEntries,
                        data.value.newEntry,
                        data.value.type === 'excludingHiddenColumns' ? data.value.hiddenColumns : undefined,
                    );

                    // Check if execution takes longer than 1s to show progress indicator
                    setTimeout(() => {
                        if (!alreadyComplete) {
                            vscode.window.withProgress(
                                {
                                    location: vscode.ProgressLocation.Notification,
                                    title: 'Executing action ...',
                                    cancellable: true,
                                },
                                async (progress, token) => {
                                    token.onCancellationRequested(() => {
                                        if (data.value.newEntry) {
                                            safeDsLogger.info('User canceled execution.');
                                            webviewApi.postMessage(this.panel.webview, {
                                                command: 'cancelRunnerExecution',
                                                value: data.value.newEntry,
                                            });
                                        } else {
                                            throw new Error('No history entry to cancel');
                                        }
                                    });

                                    // Wait for the result to finish in case it's still running
                                    await resultPromise;
                                    alreadyComplete = true; // Mark completion to prevent multiple indicators
                                },
                            );
                        }
                    }, 1000);

                    const result = await resultPromise;
                    alreadyComplete = true;

                    webviewApi.postMessage(this.panel.webview, {
                        command: 'runnerExecutionResult',
                        value: result,
                    });
                    break;
                }
                case 'refreshProfiling': {
                    if (!data.value) {
                        return;
                    }

                    let alreadyComplete = false;
                    // Execute the runner
                    const resultPromise = this.runnerApi.getFreshProfiling(data.value.historyEntries);

                    setTimeout(() => {
                        if (!alreadyComplete) {
                            vscode.window.withProgress(
                                {
                                    location: vscode.ProgressLocation.Notification,
                                    title: 'Executing action(s) ...',
                                },
                                async () => {
                                    // Wait for the result to finish in case it's still running
                                    await resultPromise;
                                    alreadyComplete = true; // Mark completion to prevent multiple indicators
                                },
                            );
                        }
                    }, 500);

                    const result = await resultPromise;
                    alreadyComplete = true;

                    webviewApi.postMessage(this.panel.webview, {
                        command: 'setProfiling',
                        value: result,
                        historyId: data.value.historyId,
                    });
                    break;
                }
                case 'executeRunnerAll': {
                    if (!data.value) {
                        return;
                    }

                    let alreadyComplete = false;

                    // Execute the runner
                    const jumpedToHistoryId = data.value.jumpedToHistoryId;
                    const resultPromise = this.runnerApi.executeMultipleHistoryAndReturnNewResults(data.value.entries);

                    // Check if execution takes longer than 1s to show progress indicator
                    setTimeout(() => {
                        if (!alreadyComplete) {
                            vscode.window.withProgress(
                                {
                                    location: vscode.ProgressLocation.Notification,
                                    title: 'Executing action(s) ...',
                                },
                                async () => {
                                    // Wait for the result to finish in case it's still running
                                    await resultPromise;
                                    alreadyComplete = true; // Mark completion to prevent multiple indicators
                                },
                            );
                        }
                    }, 1000);

                    const results = await resultPromise;
                    alreadyComplete = true;

                    webviewApi.postMessage(this.panel.webview, {
                        command: 'multipleRunnerExecutionResult',
                        value: {
                            type: 'past',
                            results,
                            jumpedToHistoryId,
                        },
                    });
                    break;
                }
                case 'executeRunnerAllFuture': {
                    if (!data.value) {
                        return;
                    }

                    let alreadyComplete = false;

                    // Execute the runner
                    const jumpedToHistoryId = data.value.jumpedToHistoryId;
                    const resultPromise = this.runnerApi.executeFutureHistoryAndReturnNewResults(
                        data.value.pastEntries,
                        data.value.futureEntries,
                    );

                    // Check if execution takes longer than 1s to show progress indicator
                    setTimeout(() => {
                        if (!alreadyComplete) {
                            vscode.window.withProgress(
                                {
                                    location: vscode.ProgressLocation.Notification,
                                    title: 'Executing action(s) ...',
                                },
                                async () => {
                                    // Wait for the result to finish in case it's still running
                                    await resultPromise;
                                    alreadyComplete = true; // Mark completion to prevent multiple indicators
                                },
                            );
                        }
                    }, 1000);

                    const results = await resultPromise;
                    alreadyComplete = true;

                    webviewApi.postMessage(this.panel.webview, {
                        command: 'multipleRunnerExecutionResult',
                        value: {
                            type: 'future',
                            results,
                            jumpedToHistoryId,
                        },
                    });
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
        pipelineNodeEndOffset: number,
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
            panel.runnerApi = new RunnerApi(services, pipelinePath, pipelineName, pipelineNodeEndOffset, tableName);
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
                pipelineNodeEndOffset,
                tableName,
            );
            EDAPanel.panelsMap.set(tableIdentifier, edaPanel);
            edaPanel.column = column;
            edaPanel.panel.iconPath = {
                light: vscode.Uri.joinPath(edaPanel.extensionUri, 'img', 'binoculars-solid.png'),
                dark: vscode.Uri.joinPath(edaPanel.extensionUri, 'img', 'binoculars-solid.png'),
            };
            await edaPanel.waitForUpdateHtmlDone(10000);
            const table = await edaPanel.getBaseTable();
            webviewApi.postMessage(edaPanel!.panel.webview, {
                command: 'setInitialTable',
                value: table,
            });

            const profiling = await EDAPanel.panelsMap.get(tableIdentifier)!.runnerApi.getProfiling(table);

            webviewApi.postMessage(edaPanel!.panel.webview, {
                command: 'setProfiling',
                value: profiling,
            });
        }
    }
    //#endregion

    //#region Disposal
    public static kill(tableIdentifier: string) {
        safeDsLogger.info('kill ' + tableIdentifier);
        let panel = EDAPanel.panelsMap.get(tableIdentifier);
        if (panel) {
            panel.panel.dispose();
            EDAPanel.panelsMap.delete(tableIdentifier);
        }
    }

    public dispose() {
        safeDsLogger.info('dispose ' + this.tableIdentifier);
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
    //#endregion

    //#region State handling
    private async getBaseTable(): Promise<Table> {
        const panel = EDAPanel.panelsMap.get(this.tableIdentifier);
        if (!panel) {
            throw new Error('Panel not found.');
        } else {
            const table = await panel.runnerApi.getTableByPlaceholder(this.tableName, this.startPipelineExecutionId);
            if (!table) {
                throw new Error('Timeout waiting for placeholder value');
            } else {
                return table;
            }
        }
    }
    //#endregion

    //#region Html updating
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

    private async _getHtmlForWebview(webview: vscode.Webview) {
        // The uri we use to load this script in the webview
        let scriptUri;
        // First look in the eda package, so the watch build works and updates the webview on changes
        let scriptPath = vscode.Uri.joinPath(this.extensionUri, '..', 'safe-ds-eda', 'dist', 'main.js');
        scriptUri = webview.asWebviewUri(scriptPath);
        try {
            await vscode.workspace.fs.stat(scriptPath);
            safeDsLogger.info('Using EDA build from EDA package.');
        } catch (_error) {
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
    //#endregion
}

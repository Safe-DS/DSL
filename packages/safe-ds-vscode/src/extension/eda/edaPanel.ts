import * as vscode from 'vscode';
import { ToExtensionMessage } from '@safe-ds/eda/types/messaging.js';
import * as webviewApi from './apis/webviewApi.ts';
import { Column, State, Table } from '@safe-ds/eda/types/state.js';
import { logOutput, printOutputMessage } from '../output.ts';
import { messages, SafeDsServices } from '@safe-ds/lang';

export const undefinedPanelIdentifier = 'undefinedPanelIdentifier';

export class EDAPanel {
    // Map to track multiple panels
    private static panelsMap: Map<string, EDAPanel> = new Map();
    private static context: vscode.ExtensionContext;
    private static services: SafeDsServices;

    public static readonly viewType = 'eda';

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private disposables: vscode.Disposable[] = [];
    private tableIdentifier: string | undefined;
    private startPipelineId: string = '';
    private column: vscode.ViewColumn | undefined;
    private webviewListener: vscode.Disposable | undefined;
    private viewStateChangeListener: vscode.Disposable | undefined;

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        startPipeLineId: string,
        tableIdentifier?: string,
    ) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.tableIdentifier = tableIdentifier;
        this.startPipelineId = startPipeLineId;

        // Set the webview's initial html content
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
        servicess: SafeDsServices,
        tableIdentifier?: string,
    ) {
        EDAPanel.context = context;
        EDAPanel.services = servicess;

        // Set column to the active editor if it exists
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        let panel = EDAPanel.panelsMap.get(tableIdentifier ?? undefinedPanelIdentifier);
        if (panel) {
            panel.panel.reveal(panel.column);
            panel.tableIdentifier = tableIdentifier;
            panel.startPipelineId = startPipelineId;

            // Have to update and construct state as table placeholder could've changed in code
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
            EDAPanel.panelsMap.set(tableIdentifier ?? undefinedPanelIdentifier, edaPanel);
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
        let panel = EDAPanel.panelsMap.get(tableIdentifier);
        if (panel) {
            panel.dispose();
            EDAPanel.panelsMap.delete(tableIdentifier);
        }
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, tableIdentifier: string) {
        const existingPanel = EDAPanel.panelsMap.get(tableIdentifier);
        if (existingPanel) {
            existingPanel.dispose();
        }
        const revivedPanel = new EDAPanel(panel, extensionUri, existingPanel?.startPipelineId ?? '', tableIdentifier);
        EDAPanel.panelsMap.set(tableIdentifier, revivedPanel);
    }

    public dispose() {
        EDAPanel.panelsMap.delete(this.tableIdentifier ?? undefinedPanelIdentifier);

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
    }

    private findCurrentState(): State | undefined {
        const existingStates = (EDAPanel.context.globalState.get('webviewState') ?? []) as State[];
        return existingStates.find((s) => s.tableIdentifier === this.tableIdentifier);
    }

    private constructCurrentState(): Promise<State> {
        return new Promise((resolve, reject) => {
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

            const placeholderValueCallback = (message: messages.PlaceholderValueMessage) => {
                if (message.id !== this.startPipelineId || message.data.name !== this.tableIdentifier) {
                    return;
                }
                EDAPanel.services.runtime.Runner.removeMessageCallback(placeholderValueCallback, 'placeholder_value');

                const pythonTableColumns = message.data.value;
                const table: Table = {
                    totalRows: 0,
                    name: this.tableIdentifier,
                    columns: [] as Table['columns'],
                    appliedFilters: [] as Table['appliedFilters'],
                };

                let i = 0;
                let currentMax = 0;
                for (const [columnName, columnValues] of Object.entries(pythonTableColumns)) {
                    if (!Array.isArray(columnValues)) {
                        continue;
                    }
                    if (currentMax < columnValues.length) {
                        currentMax = columnValues.length;
                    }

                    const isNumerical = typeof columnValues[0] === 'number';
                    const columnType = isNumerical ? 'numerical' : 'categorical';

                    const column: Column = {
                        name: columnName,
                        values: columnValues,
                        type: columnType,
                        hidden: false,
                        highlighted: false,
                        appliedFilters: [],
                        appliedSort: null,
                        profiling: { top: [], bottom: [] },
                        coloredHighLow: false,
                    };
                    table.columns.push([i++, column]);
                }
                table.totalRows = currentMax;
                table.visibleRows = currentMax;
                printOutputMessage('Got placeholder from Runner!');
                resolve({ tableIdentifier: this.tableIdentifier, history: [], defaultState: false, table });
            };

            EDAPanel.services.runtime.Runner.addMessageCallback(placeholderValueCallback, 'placeholder_value');
            printOutputMessage('Getting placeholder from Runner ...');
            EDAPanel.services.runtime.Runner.sendMessageToPythonServer(
                messages.createPlaceholderQueryMessage(this.startPipelineId, this.tableIdentifier),
            );

            setTimeout(() => reject(new Error('Timeout waiting for placeholder value')), 30000);
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

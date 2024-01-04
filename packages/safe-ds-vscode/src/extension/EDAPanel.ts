import * as vscode from "vscode";
import { ToExtensionMessage } from "../../../../types/shared-eda-vscode/messaging.js";
import * as webviewApi from "./Apis/webviewApi.ts";
import { Column, State, Table } from "../../../../types/shared-eda-vscode/types.js";
import { addMessageCallback, removeMessageCallback, sendMessageToPythonServer } from "./pythonServer.ts";
import { PlaceholderValueMessage, createPlaceholderQueryMessage } from "./messages.ts";
import { printOutputMessage } from "./output.ts";

export class EDAPanel {
  // Map to track multiple panels
  public static panelsMap: Map<string, EDAPanel> = new Map();
  public static context: vscode.ExtensionContext;

  public static readonly viewType = "eda";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _tableIdentifier: string | undefined;
  private _pythonServerPort: number = 5000;
  private _startPipelineId: string = "";
  private _column: vscode.ViewColumn | undefined;
  private _webviewListener: vscode.Disposable | undefined;
  private _viewStateChangeListener: vscode.Disposable | undefined;
  // private _lastVisibleState: boolean = true;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, startPipeLineId: string, tableIdentifier?: string, pythonServerPort = 5000) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._tableIdentifier = tableIdentifier;
    this._pythonServerPort = pythonServerPort;
    this._startPipelineId = startPipeLineId;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle view state changes
    this._viewStateChangeListener = this._panel.onDidChangeViewState(async (e) => {
      const updatedPanel = e.webviewPanel; 
      if (updatedPanel.visible) {
        this._column = updatedPanel.viewColumn;
        // Not needed as retainContextWhenHidden is true for panel
        // if(!this._lastVisibleState) { // State only has to be updated if it left the visible state and thus lost it's state
        //   webviewApi.postMessage(updatedPanel.webview, {
        //     command: "setWebviewState",
        //     value: await this.constructCurrentState(),
        //   });
        // }
      }
      // this._lastVisibleState = e.webviewPanel.visible;
    });
    this._disposables.push(this._viewStateChangeListener);

    // Handle messages from the webview
    const webview = this._panel.webview;
    this._webviewListener = webview.onDidReceiveMessage(async (data: ToExtensionMessage) => {
      console.log(data.command + " called")
      switch (data.command) {
        case "setInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "setError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "setCurrentGloabalState": {
          if (!data.value) {
            return;
          }
          const existingStates = EDAPanel.context.globalState.get("webviewState") as State[];
          const stateExists = existingStates.some(s => s.tableIdentifier === data.value.tableIdentifier);

          const newWebviewState = stateExists
              ? existingStates.map(s => s.tableIdentifier === data.value.tableIdentifier ? data.value : s) as State[]
              : existingStates.concat(data.value);

          EDAPanel.context.globalState.update("webviewState", newWebviewState);
          break;
        }
        case "resetGlobalState": {
          EDAPanel.context.globalState.update("webviewState", []);
          break;
        }
      }
    });
    this._disposables.push(this._webviewListener);
  }

  public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext, startPipelineId: string, tableIdentifier?: string, pythonServerPort = 5000) {
    EDAPanel.context = context;
    
    // Set column to the active editor if it exists
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    console.log(column)

    // If we already have a panel, show it.
    let panel = EDAPanel.panelsMap.get(tableIdentifier ?? 'undefinedPanelIdentifier');
    if (panel) {
      panel._panel.reveal(panel._column);
      panel._tableIdentifier = tableIdentifier;
      panel._pythonServerPort = pythonServerPort;
      panel._startPipelineId = startPipelineId;
      panel._update();
      // Otherwise fired in 'onDidChangeViewState' listener
      if (panel._panel.visible) {
        panel.constructCurrentState().then((state) => {
          webviewApi.postMessage(panel!._panel.webview, {
            command: "setWebviewState",
            value: state,
          });
        });
      }
      return;
    } else {
      // Otherwise, create a new panel.
      const newPanel = vscode.window.createWebviewPanel(EDAPanel.viewType, tableIdentifier ? tableIdentifier + ' Exploration' : 'EDA', column || vscode.ViewColumn.One, {
        // Enable javascript in the webview
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media"),
          vscode.Uri.joinPath(extensionUri, "..", "safe-ds-eda", "dist"),
        ],
        retainContextWhenHidden: true,
      });
  
      const edaPanel = new EDAPanel(newPanel, extensionUri, startPipelineId, tableIdentifier, pythonServerPort);
      EDAPanel.panelsMap.set(tableIdentifier ?? 'undefinedPanelIdentifier', edaPanel);
      edaPanel._column = column;
      edaPanel._panel.iconPath = {
        light: vscode.Uri.joinPath(edaPanel._extensionUri, "resources", "binoculars-solid.png"),
        dark: vscode.Uri.joinPath(edaPanel._extensionUri, "resources", "binoculars-solid.png")
      };
      console.log('here')
      edaPanel.constructCurrentState().then((state) => {
        webviewApi.postMessage(edaPanel!._panel.webview, {
          command: "setWebviewState",
          value: state,
        });
      });
    }
  }

  public static kill(tableIdentifier: string) {
    console.log('kill ' + tableIdentifier)
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
    const revivedPanel = new EDAPanel(panel, extensionUri, existingPanel?._startPipelineId ?? "", tableIdentifier);
    EDAPanel.panelsMap.set(tableIdentifier, revivedPanel);
  }

  public dispose() {
    console.log("dispose");
    EDAPanel.panelsMap.delete(this._tableIdentifier ?? 'undefinedPanelIdentifier');

    // Clean up our panel
    this._panel.dispose();

    // Cleans up all disposables like listeners
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }  

  private findCurrentState(): State | undefined {
    const existingStates = EDAPanel.context.globalState.get("webviewState") as State[];
    return existingStates.find(s => s.tableIdentifier === this._tableIdentifier);
  }

  private constructCurrentState(): Promise<State> {
    return new Promise((resolve, reject) => {
      const existingCurrentState = this.findCurrentState();
      if (existingCurrentState) {
        printOutputMessage("Found current State.");
        resolve(existingCurrentState);
        return;
      }
  
      if (!this._tableIdentifier) {
        resolve({ tableIdentifier: undefined, history: [], defaultState: true });
        return;
      }
  
      const placeholderValueCallback = (message: PlaceholderValueMessage) => {
        if (message.id !== this._startPipelineId || message.data.name !== this._tableIdentifier) {
          return;
        }
        removeMessageCallback(placeholderValueCallback, "placeholder_value");

        const pythonTableColumns = message.data.value;
        const table: Table = { 
          totalRows: 0, 
          name: this._tableIdentifier, 
          columns: [] as Table["columns"], 
          appliedFilters: [] as Table["appliedFilters"]
        };

        let i = 0;
        let currentMax = 0;
        for (const [columnName, columnValues] of Object.entries(pythonTableColumns)) {
          if (!Array.isArray(columnValues)) {
            continue;
          }
          if(currentMax < columnValues.length) {
            currentMax = columnValues.length;
          }

          const isNumerical = typeof columnValues[0] === 'number';
          const columnType = isNumerical ? "numerical" : "categorical";

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
        printOutputMessage("Got placeholder from Runner!");
        resolve({ tableIdentifier: this._tableIdentifier, history: [], defaultState: false, table });
      };
  
      addMessageCallback(placeholderValueCallback, "placeholder_value");
      printOutputMessage("Getting placeholder from Runner ...");
      sendMessageToPythonServer(createPlaceholderQueryMessage(this._startPipelineId, this._tableIdentifier));
  
      setTimeout(() => reject(new Error("Timeout waiting for placeholder value")), 30000);
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "..", "safe-ds-eda", "dist", "main.js"));

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
    const stylesVscodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
    const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "styles.css"));

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
        window.tableIdentifier = "${this._tableIdentifier}" === "undefined" ? undefined : "${this._tableIdentifier}";
        window.pythonServerPort = ${this._pythonServerPort};
      </script>
    </head>
    <body>
    </body>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
  }

  public getNonce() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}

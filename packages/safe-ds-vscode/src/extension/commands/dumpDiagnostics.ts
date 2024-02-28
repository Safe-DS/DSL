import vscode, { ExtensionContext, Uri } from 'vscode';

export const dumpDiagnostics = (context: ExtensionContext) => async () => {
    // Get the current document
    const currentDocument = vscode.window.activeTextEditor?.document;
    if (!currentDocument) {
        vscode.window.showErrorMessage('No active document.');
        return;
    } else if (currentDocument.languageId !== 'safe-ds') {
        vscode.window.showErrorMessage('The active document is not a Safe-DS document.');
        return;
    }

    // Get diagnostics for the current document
    const diagnostics = vscode.languages.getDiagnostics(currentDocument.uri);
    if (diagnostics.length === 0) {
        vscode.window.showErrorMessage('The active document has no diagnostics.');
        return;
    }

    // Dump diagnostics to a file
    const uri = vscode.Uri.joinPath(diagnosticsDumpsUri(context), `${basicISOTimestamp()}.json`);
    const content = JSON.stringify(
        {
            text: currentDocument.getText(),
            diagnostics,
        },
        null,
        2,
    );

    await vscode.workspace.fs.writeFile(uri, Buffer.from(content));

    // Inform the user and ask for further action
    const item = await vscode.window.showInformationMessage(`Diagnostics successfully dumped.`, 'Open file', 'Close');

    if (item === 'Open file') {
        vscode.window.showTextDocument(uri);
    }
};

export const diagnosticsDumpsUri = (context: ExtensionContext): Uri => {
    return vscode.Uri.joinPath(context.globalStorageUri, 'diagnosticsDumps');
};

const basicISOTimestamp = (): string => {
    return new Date().toISOString().replaceAll(/[-:]/gu, '');
};
